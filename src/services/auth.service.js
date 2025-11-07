const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../core/config');
const { redis } = require('../core/redis');
const UserRepository = require('../repositories/user.repository');
const { emailUtil } = require('../utils/email');

/**
 * 认证服务类
 * 处理用户认证相关的业务逻辑
 */
class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @param {string} userData.name - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise<Object>} 注册成功的用户信息
   */
  async register(userData) {
    try {
      // 检查邮箱是否已存在
      const isEmailExists = await this.userRepository.isEmailExists(userData.email);
      if (isEmailExists) {
        throw new Error('Email already exists');
      }

      // 确保config.bcrypt存在，使用默认值以防配置缺失
      const saltRounds = config.bcrypt?.saltRounds || 10;
      
      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // 获取用户名，优先使用username，如果没有则使用name
      const username = userData.username || userData.name;
      
      if (!username) {
        throw new Error('用户名不能为空');
      }

      // 记录创建用户前的数据
      console.log('准备创建用户，数据:', { username, email: userData.email });

      // 创建用户数据对象
      const userDataToCreate = {
        username: username,
        display_name: userData.display_name || username,
        email: userData.email,
        password: hashedPassword,
        role: 'subscriber',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      // 创建用户
      const newUser = await this.userRepository.create(userDataToCreate);
      console.log('用户创建成功，ID:', newUser.id);

      // 重新获取用户信息（不包含密码）
      const userInfo = await this.userRepository.findById(newUser.id);
      return userInfo;
    } catch (error) {
      // 详细记录错误信息
      console.error('注册过程中发生错误:', error);
      
      // 处理数据库字段错误
      if (error.message && error.message.includes('Unknown column')) {
        throw new Error('数据库表结构可能未正确初始化，请确保运行了SQL脚本创建表');
      }
      
      // 重新抛出原始错误
      throw error;
    }
  }

  /**
   * 用户登录
   * @param {string} account - 用户账号（邮箱）
   * @param {string} password - 用户密码
   * @param {string} ip - IP地址
   * @returns {Promise<Object>} 包含token和用户信息的对象
   */
  async login(account, password, ip) {
    // 查找用户
    const user = await this.userRepository.findByEmail(account);
    
    // 如果找到用户，更新最后登录IP
    if (user && ip) {
      await this.userRepository.updateLastLogin(user.id, ip);
    }
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new Error('Account is disabled');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 获取不包含密码的用户信息
    const userInfo = await this.userRepository.findById(user.id);
    
    // 将用户信息存入Redis，使用与token相同的过期时间
    // 解析expiresIn字符串，转换为秒
    let expireSeconds = 3600; // 默认1小时
    if (config.jwt.expiresIn) {
      const match = config.jwt.expiresIn.match(/(\d+)([hmd])/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
          case 'h':
            expireSeconds = value * 3600;
            break;
          case 'd':
            expireSeconds = value * 86400;
            break;
          case 'm':
            expireSeconds = value * 60;
            break;
        }
      }
    }
    
    // 处理用户之前的有效token，使其失效
    const userTokensKey = `user:${user.id}:tokens`;
    
    try {
      // 获取集合中的所有token
      const existingTokens = await redis.smembers(userTokensKey); // 注意：在redis.js中已正确映射到sMembers
      
      if (existingTokens && existingTokens.length > 0) {
        // 将所有旧token加入黑名单
        for (const oldToken of existingTokens) {
          try {
            const decoded = jwt.decode(oldToken);
            if (decoded) {
              const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
              if (expiryTime > 0) {
                // 将旧token加入黑名单
                await redis.setex(`token:blacklist:${oldToken}`, expiryTime, '1');
                // 清理对应的缓存
                const oldTokenMapKey = `token:map:${oldToken}`;
                try {
                  const oldUserCacheKey = await redis.get(oldTokenMapKey);
                  if (oldUserCacheKey) {
                    await redis.del(oldUserCacheKey);
                    await redis.del(oldTokenMapKey);
                  }
                } catch (cacheError) {
                  console.error('清理token缓存时出错:', cacheError);
                }
              }
            }
          } catch (tokenError) {
            console.error('处理旧token时出错:', tokenError);
          }
        }
        
        // 清空旧的token集合
        try {
          await redis.del(userTokensKey);
        } catch (delError) {
          console.error('删除旧token集合时出错:', delError);
        }
      }
    } catch (smembersError) {
      console.error('获取用户token集合时出错:', smembersError);
    }
    
    // 生成Redis键名
    const userCacheKey = `user:${user.id}:${token.substring(0, 10)}`;
    // 存储用户信息，但不设置user:user_id:tokens集合的value
    await redis.set(userCacheKey, userInfo, expireSeconds);
    
    // 存储token与用户缓存键的映射，用于登出时清理
    const tokenMapKey = `token:map:${token}`;
    await redis.set(tokenMapKey, userCacheKey, expireSeconds);
    
    // 使用Redis集合存储用户的有效token，只保留最新的token
    await redis.sadd(userTokensKey, token); // 注意：在redis.js中已正确映射到sAdd
    // 设置集合的过期时间
    await redis.expire(userTokensKey, expireSeconds);

    return {
      token,
      user: userInfo
    };
  }

  /**
   * 用户登出
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} 登出结果
   */
  async logout(token) {
    try {
      // 获取token过期时间
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        console.error('无效的token格式');
        return true;
      }
      
      const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
      
      // 查找对应的用户缓存键
      const tokenMapKey = `token:map:${token}`;
      try {
        const userCacheKey = await redis.get(tokenMapKey);
        
        if (userCacheKey) {
          // 删除用户缓存数据
          try {
            await redis.del(userCacheKey);
          } catch (delCacheError) {
            console.error('删除用户缓存时出错:', delCacheError);
          }
          // 删除token映射
          try {
            await redis.del(tokenMapKey);
            console.log(`用户缓存已清理: ${userCacheKey}`);
          } catch (delMapError) {
            console.error('删除token映射时出错:', delMapError);
          }
        }
      } catch (getError) {
        console.error('获取token映射时出错:', getError);
      }

      // 将token加入黑名单，过期时间设置为token剩余有效期
      try {
        await redis.setex(`token:blacklist:${token}`, expiryTime, '1');
      } catch (blacklistError) {
        console.error('将token加入黑名单时出错:', blacklistError);
      }
      
      // 从用户token集合中移除该token
      if (decoded && decoded.id) {
        const userTokensKey = `user:${decoded.id}:tokens`;
        try {
          await redis.srem(userTokensKey, token); // 注意：在redis.js中已正确映射到sRem
        } catch (sremError) {
          console.error('从用户token集合中移除token时出错:', sremError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('登出时清理缓存失败:', error);
      // 即使清理缓存失败，也要将token加入黑名单
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
          try {
            await redis.setex(`token:blacklist:${token}`, expiryTime, '1');
          } catch (blacklistError) {
            console.error('将token加入黑名单失败:', blacklistError);
          }
          
          // 尝试从用户token集合中移除该token
          if (decoded.id) {
            const userTokensKey = `user:${decoded.id}:tokens`;
            try {
              await redis.srem(userTokensKey, token); // 注意：在redis.js中已正确映射到sRem
            } catch (sremError) {
              console.error('从用户token集合中移除token失败:', sremError);
            }
          }
        }
      } catch (innerError) {
        console.error('登出异常处理中出错:', innerError);
      }
      return true;
    }
  }

  /**
   * 获取当前用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  async getCurrentUser(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * 发送验证码
   * @param {string} email - 目标邮箱
   * @param {string} type - 验证码类型
   * @returns {Promise<boolean>} 发送结果
   */
  async sendVerificationCode(email, type) {
    try {
      // 添加详细的方法调用日志
      console.log(`开始发送验证码流程：邮箱=${email}, 类型=${type}`);
      
      // 根据验证码类型进行不同的验证
      console.log('验证邮箱是否已存在...');
      const userExists = await this.userRepository.isEmailExists(email);
      
      // 注册类型：邮箱必须不存在
      if (type === 'register' && userExists) {
        console.error(`注册验证失败：邮箱已存在: ${email}`);
        throw new Error('Email already exists');
      }
      // 重置密码类型：邮箱必须已存在
      else if (type === 'reset_password' && !userExists) {
        console.error(`重置密码验证失败：邮箱未注册: ${email}`);
        throw new Error('Email not registered');
      }

      // 生成6位数字验证码
      console.log('生成6位数字验证码...');
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`验证码生成成功: ${code}`);
      
      // 计算过期时间（5分钟后）
      const expiryTime = 5 * 60;
      console.log(`验证码有效期设置为: ${expiryTime}秒`);

      // 构建Redis键名
      const redisKey = `verify:code:${email}:${type}`;
      console.log(`构建Redis键名: ${redisKey}`);
      
      // 存储验证码到Redis，设置过期时间
      console.log(`开始存储验证码到Redis...`);
      await redis.set(redisKey, code, expiryTime);
      console.log(`验证码成功存储到Redis: ${redisKey}`);
      
      // 验证存储结果
      console.log(`验证验证码存储结果...`);
      const storedCode = await redis.get(redisKey);
      
      // 添加详细的类型和值检查
      console.log(`从Redis读取的验证码: ${storedCode}, 类型: ${typeof storedCode}`);
      console.log(`原始验证码: ${code}, 类型: ${typeof code}`);
      
      // 转换为字符串进行比较，避免类型不匹配问题
      const storedCodeStr = String(storedCode);
      const codeStr = String(code);
      
      if (storedCodeStr !== codeStr) {
        console.error(`验证码存储异常：读取值与存储值不匹配`);
        console.error(`字符串比较结果: 存储=${storedCodeStr}, 原始=${codeStr}`);
        throw new Error('Failed to verify stored verification code');
      }
      
      console.log(`验证码存储验证成功：读取值与存储值匹配`);

      // 发送验证码邮件
      console.log(`准备发送验证码邮件...`);
      await emailUtil.sendVerificationCode(email, code, type);
      console.log(`验证码邮件发送成功: ${email}`);
      
      return true;
    } catch (error) {
      // 记录详细错误信息
      console.error('发送验证码失败:', error);
      console.error('邮件配置检查:', {
        email: email,
        type: type,
        smtpConfigured: config.email.user && config.email.password ? true : false,
        smtpHost: config.email.host
      });
      
      // 重新抛出错误，保留原始错误信息
      throw error;
    }
  }

  /**
   * 验证验证码
   * @param {string} email - 用户邮箱
   * @param {string} code - 用户输入的验证码
   * @param {string} type - 验证码类型
   * @returns {Promise<Object>} 包含重置token的对象
   */
  async verifyCode(email, code, type = 'register') {
    try {
      // 构建验证码的Redis键名
      const redisKey = `verify:code:${email}:${type}`;
      
      // 添加调试日志
      console.log(`验证验证码：邮箱=${email}, 类型=${type}, 键名=${redisKey}`);
      
      // 从Redis获取验证码，使用type区分不同场景的验证码
      const storedCode = await redis.get(redisKey);
      
      // 添加类型检查日志
      console.log(`从Redis获取到的验证码: ${storedCode}, 类型: ${typeof storedCode}`);
      console.log(`用户输入的验证码: ${code}, 类型: ${typeof code}`);
      
      if (!storedCode) {
        console.log(`验证码不存在或已过期：${redisKey}`);
        throw new Error('Verification code has expired or does not exist');
      }

      // 转换为字符串进行比较，避免类型不匹配问题
      const storedCodeStr = String(storedCode);
      const codeStr = String(code);
      
      if (storedCodeStr !== codeStr) {
        console.log(`验证码不匹配：存储的=${storedCodeStr}, 输入的=${codeStr}`);
        throw new Error('Invalid verification code');
      }
      
      console.log(`验证码验证成功：存储值与输入值匹配`);

      // 验证成功后删除验证码，防止重复使用
      await redis.del(redisKey);
      console.log(`验证码验证成功，已删除：${redisKey}`);
      
      // 生成一个临时token用于重置密码验证
      const resetToken = jwt.sign(
        { email },
        config.jwt.secret,
        { expiresIn: '10m' }
      );

      return { resetToken };
    } catch (error) {
      throw new Error(error.message || 'Verification failed');
    }
  }

  /**
   * 重置密码
   * @param {string} resetToken - 重置密码token
   * @param {string} newPassword - 新密码
   * @returns {Promise<boolean>} 重置结果
   */
  async resetPassword(resetToken, newPassword) {
    try {
      // 验证重置token
      const decoded = jwt.verify(resetToken, config.jwt.secret);
      const email = decoded.email;

      // 查找用户
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

      // 更新密码
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Reset token has expired');
      }
      throw new Error('Invalid reset token');
    }
  }

  /**
   * 刷新token
   * @param {string} oldToken - 旧的token
   * @returns {Promise<Object>} 新的token
   */
  async refreshToken(oldToken) {
    try {
      // 验证旧token
      const decoded = jwt.verify(oldToken, config.jwt.secret);
      
      // 检查token是否在黑名单中
      const isBlacklisted = await redis.exists(`token:blacklist:${oldToken}`);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }
      
      // 尝试从Redis获取用户信息
      const oldUserCacheKey = `user:${decoded.id}:${oldToken.substring(0, 10)}`;
      let userInfo = await redis.get(oldUserCacheKey);
      
      // 如果缓存中没有用户信息，从数据库获取
      if (!userInfo) {
        userInfo = await this.userRepository.findById(decoded.id);
      }

      // 生成新token
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // 解析expiresIn字符串，转换为秒
      let expireSeconds = 3600; // 默认1小时
      if (config.jwt.expiresIn) {
        const match = config.jwt.expiresIn.match(/(\d+)([hmd])/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          switch (unit) {
            case 'h':
              expireSeconds = value * 3600;
              break;
            case 'd':
              expireSeconds = value * 86400;
              break;
            case 'm':
              expireSeconds = value * 60;
              break;
          }
        }
      }
      
      // 更新用户缓存，使用新token
      const newUserCacheKey = `user:${decoded.id}:${newToken.substring(0, 10)}`;
      await redis.set(newUserCacheKey, userInfo, expireSeconds);
      
      // 存储新token与用户缓存键的映射
      const newTokenMapKey = `token:map:${newToken}`;
      await redis.set(newTokenMapKey, newUserCacheKey, expireSeconds);

      // 清理旧token的缓存映射
      const oldTokenMapKey = `token:map:${oldToken}`;
      await redis.del(oldTokenMapKey);

      // 将旧token加入黑名单
      const oldExpiryTime = decoded.exp - Math.floor(Date.now() / 1000);
      await redis.setex(`token:blacklist:${oldToken}`, oldExpiryTime, '1');
      
      // 更新用户token集合，移除旧token，添加新token
      const userTokensKey = `user:${decoded.id}:tokens`;
      
      // 从集合中移除旧token
      await redis.srem(userTokensKey, oldToken); // 注意：在redis.js中已正确映射到sRem
      
      // 添加新token到集合
      await redis.sadd(userTokensKey, newToken); // 注意：在redis.js中已正确映射到sAdd
      
      // 确保集合设置了过期时间
      await redis.expire(userTokensKey, expireSeconds);

      return { token: newToken };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;