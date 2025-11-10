const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../core/config');
const { redis } = require('../core/redis');
const UserRepository = require('../repositories/user.repository');
const emailUtil = require('../utils/email');
const { log: logger } = require('../core/logger');

/**
 * 认证服务类
 * 处理用户认证相关的业务逻辑
 */
class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * 验证密码是否符合策略要求
   * @param {string} password - 待验证的密码
   * @returns {boolean} 密码是否有效
   * @throws {Error} 当密码不符合要求时抛出错误
   */
  validatePassword(password) {
    const policy = config.passwordPolicy;
    
    // 检查密码是否存在
    if (!password || typeof password !== 'string') {
      throw new Error('密码不能为空');
    }
    
    // 检查密码长度
    if (password.length < policy.minLength) {
      throw new Error(`密码长度不能少于${policy.minLength}位`);
    }
    
    // 检查是否包含小写字母
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      throw new Error('密码必须包含至少一个小写字母');
    }
    
    // 检查是否包含数字
    if (policy.requireNumber && !/[0-9]/.test(password)) {
      throw new Error('密码必须包含至少一个数字');
    }
    
    // 检查是否包含大写字母
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      throw new Error('密码必须包含至少一个大写字母');
    }
    
    // 检查是否包含特殊字符
    if (policy.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
      throw new Error('密码必须包含至少一个特殊字符');
    }
    
    return true;
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.name - 用户名（兼容旧接口）
   * @param {string} userData.email - 邮箱
   * @param {string} userData.display_name - 显示名称
   * @param {string} userData.password - 密码
   * @returns {Promise<Object>} 注册成功的用户信息
   */
  async register(userData) {
    try {
      logger.info('开始用户注册流程', { email: userData.email });
      
      // 参数验证
      if (!userData || typeof userData !== 'object') {
        throw new Error('无效的用户数据');
      }
      
      // 验证邮箱
      const email = userData.email;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('请输入有效的邮箱地址');
      }
      
      // 检查邮箱是否已存在
      logger.debug('检查邮箱是否已存在', { email });
      const isEmailExists = await this.userRepository.isEmailExists(email);
      if (isEmailExists) {
        logger.warn('邮箱已存在', { email });
        throw new Error('邮箱已被注册');
      }

      // 验证密码
      logger.debug('验证密码强度');
      this.validatePassword(userData.password);
      
      // 确保config.bcrypt存在，使用默认值以防配置缺失
      const saltRounds = config.bcrypt?.saltRounds || 10;
      
      // 加密密码
      logger.debug('加密密码');
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // 获取用户名，优先使用username，如果没有则使用name
      const username = userData.username || userData.name;
      
      if (!username || username.trim().length === 0) {
        throw new Error('用户名不能为空');
      }
      
      // 确保用户名不包含敏感字符
      if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/.test(username)) {
        throw new Error('用户名只能包含字母、数字、下划线和中文，长度2-20位');
      }

      // 创建用户数据对象
      const userDataToCreate = {
        username: username.trim(),
        display_name: userData.display_name?.trim() || username.trim(),
        email: email.toLowerCase(), // 邮箱统一转为小写
        password: hashedPassword,
        role: 'subscriber',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      // 创建用户
      logger.info('准备创建用户', { username: userDataToCreate.username, email: userDataToCreate.email });
      const newUser = await this.userRepository.create(userDataToCreate);
      logger.info('用户创建成功', { userId: newUser.id, username: newUser.username });

      // 重新获取用户信息（不包含密码）
      const userInfo = await this.userRepository.findById(newUser.id);
      
      // 可选：发送欢迎邮件
      // 这里可以调用邮件服务发送欢迎邮件，但不影响注册流程
      if (userInfo) {
        try {
          if (emailUtil?.emailUtil?.sendVerificationCode) {
            logger.debug('发送欢迎邮件', { userId: userInfo.id });
            // 注意：这里不等待邮件发送完成，避免影响注册流程
            emailUtil.emailUtil.sendVerificationCode(
              userInfo.email,
              '欢迎注册我们的平台！',
              'welcome'
            ).catch(err => {
              logger.error('发送欢迎邮件失败', { userId: userInfo.id, error: err.message });
            });
          }
        } catch (emailError) {
          logger.error('处理欢迎邮件时出错', { error: emailError.message });
          // 不影响主流程，继续返回用户信息
        }
      }

      return userInfo;
    } catch (error) {
      // 详细记录错误信息
      logger.error('注册过程中发生错误', { error: error.message, stack: error.stack });
      
      // 处理数据库字段错误
      if (error.message && error.message.includes('Unknown column')) {
        const dbError = new Error('数据库表结构可能未正确初始化，请确保运行了SQL脚本创建表');
        dbError.status = 500;
        throw dbError;
      }
      
      // 为错误添加状态码
      if (!error.status) {
        error.status = error.message.includes('已被注册') || error.message.includes('无效') ? 400 : 500;
      }
      
      // 重新抛出错误
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
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
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
    // 参数验证
    if (!email || !type) {
      logger.error('缺少必要参数: email=', email, 'type=', type);
      throw new Error('Invalid parameters');
    }
    
    // 验证type参数值
    if (!['register', 'reset_password'].includes(type)) {
      logger.error('无效的验证码类型:', type);
      throw new Error('Invalid verification code type');
    }
    
    try {
      logger.info(`开始发送验证码流程：邮箱=${email}, 类型=${type}`);
      
      // 1. 邮箱存在性验证 - 简化错误处理
      try {
        logger.debug(`验证邮箱存在性: ${email}, 类型: ${type}`);
        
        // 直接调用仓库方法，添加try-catch来捕获任何数据库操作异常
        const userExists = await this.userRepository.isEmailExists(email);
        logger.debug(`邮箱查询结果: ${userExists}`);
        
        // 业务逻辑验证
        if (type === 'register' && userExists) {
          logger.warn(`注册验证失败：邮箱已存在: ${email}`);
          throw new Error('邮箱已被注册');
        } else if (type === 'reset_password' && !userExists) {
          logger.warn(`重置密码验证失败：邮箱未注册: ${email}`);
          throw new Error('邮箱未注册');
        }
        
        logger.debug('邮箱验证通过');
      } catch (error) {
        // 记录完整错误信息
        logger.error('邮箱验证失败', error);
        
        // 区分业务错误和系统错误
        if (error.message === '邮箱已被注册' || error.message === '邮箱未注册') {
          throw error; // 直接抛出业务逻辑错误
        }
        
        // 对于系统错误，提供友好的错误消息
        throw new Error('验证邮箱信息失败');
      }

      // 2. 生成验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      logger.debug(`验证码生成成功: ${code}`);
      
      // 计算过期时间（5分钟）
      const expiryTime = 5 * 60;

      // 3. Redis存储操作（添加独立try-catch和更健壮的错误处理）
      const redisKey = `verify:code:${email}:${type}`;
      logger.debug(`构建Redis键名: ${redisKey}`);
      
      try {
        logger.debug(`开始存储验证码到Redis...`);
        
        // 检查redis实例是否有效
        if (!redis || typeof redis.set !== 'function') {
          logger.error('Redis实例不可用');
          // 对于验证码功能，Redis是必需的，无法降级到其他存储
          throw new Error('验证码服务暂时不可用，请稍后再试');
        }
        
        // 首先尝试使用封装的set方法
        let storeSuccess;
        try {
          // 使用我们封装的redis.set方法（它包含了连接检查和重试逻辑）
          storeSuccess = await redis.set(redisKey, code, expiryTime);
        } catch (setError) {
          // 如果封装方法失败，尝试直接使用redis模块的底层方法（备用方案）
          logger.warn(`封装的Redis set方法失败，尝试直接使用setex: ${setError.message}`);
          try {
            // 尝试直接使用redis模块中的setex方法
            await redis.setex(redisKey, expiryTime, code);
            storeSuccess = true;
          } catch (fallbackError) {
            logger.error(`Redis setex备用方法失败: ${fallbackError.message}`);
            storeSuccess = false;
          }
        }
        
        // 检查存储是否成功
        if (!storeSuccess) {
          throw new Error('验证码存储失败：Redis操作未确认成功');
        }
        
        // 验证存储结果（添加重试逻辑）
        let storedCode;
        const maxRetries = 3;
        let retryCount = 0;
        
        while (!storedCode && retryCount < maxRetries) {
          try {
            storedCode = await redis.get(redisKey);
            if (storedCode) break;
          } catch (getError) {
            logger.warn(`获取存储的验证码失败，重试中(${retryCount+1}/${maxRetries}): ${getError.message}`);
          }
          retryCount++;
          // 短暂延迟后重试
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
          }
        }
        
        logger.debug(`从Redis读取的验证码: ${storedCode || 'null'}`);
        
        // 验证存储成功
        if (!storedCode) {
          throw new Error('验证码存储失败：无法读取存储的验证码');
        }
        
        // 确保进行类型安全的比较
        const storedCodeStr = String(storedCode);
        const codeStr = String(code);
        
        if (storedCodeStr !== codeStr) {
          throw new Error(`验证码存储不一致：存储=${storedCode}, 生成=${code}`);
        }
        
        logger.info(`验证码存储验证成功: ${redisKey}`);
      } catch (redisError) {
        logger.error('Redis操作错误:', redisError);
        // 使用更友好的错误消息
        throw new Error('验证码服务暂时不可用，请稍后再试');
      }

      // 4. 邮件发送操作（添加独立try-catch和更健壮的错误处理）
      try {
        logger.debug(`准备发送验证码邮件...`);
        
        // 检查邮件配置是否有效
        if (!config.email || !config.email.host || !config.email.user || !config.email.password) {
          logger.error('邮件配置不完整');
          // 对于邮件发送失败，但验证码已经存储成功的情况，我们仍然返回成功
          // 因为用户可能仍然可以通过其他方式获取验证码
          logger.warn('邮件配置不完整，但验证码已成功存储');
          return true;
        }
        
        await emailUtil.emailUtil.sendVerificationCode(email, code, type);
        logger.info(`验证码邮件发送成功: ${email}`);
      } catch (emailError) {
        logger.error('邮件发送错误:', emailError);
        // 即使邮件发送失败，也不阻止流程继续，因为验证码已经存储在Redis中
        logger.warn('邮件发送失败，但验证码已成功存储，返回成功响应');
        // 可以选择抛出错误或返回成功，这里选择返回成功
        return true;
      }
      
      return true;
    } catch (error) {
      // 记录详细错误信息
      logger.error('发送验证码失败:', error);
      logger.error('请求详情:', {
        email: email,
        type: type,
        timestamp: new Date().toISOString()
      });
      
      // 确保错误消息不泄露敏感信息
      const safeErrorMessage = error.message.includes('Redis') || error.message.includes('Email') 
        ? '验证码服务暂时不可用，请稍后再试' 
        : error.message;
      
      // 重新抛出错误，使用安全的错误消息
      throw new Error(safeErrorMessage);
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
        config.jwt.accessSecret, // 使用accessSecret
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
      console.log('开始重置密码流程');
      
      // 验证重置token
      console.log('验证重置token...');
      const decoded = jwt.verify(resetToken, config.jwt.accessSecret); // 使用accessSecret
      const email = decoded.email;
      console.log(`Token验证成功，邮箱: ${email}`);

      // 查找用户
      console.log(`查找用户: ${email}`);
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        console.log(`用户不存在: ${email}`);
        throw new Error('User not found');
      }
      console.log(`用户找到: ID=${user.id}, 邮箱=${user.email}`);
      
      // 验证密码长度
      console.log(`新密码长度: ${newPassword.length}`);
      if (newPassword.length < 6) {
        console.log('密码长度不足6位');
        throw new Error('密码长度不能少于6位');
      }

      // 加密新密码
      console.log('加密新密码...');
      const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
      console.log('密码加密完成');

      // 更新密码
      console.log(`更新用户密码: ID=${user.id}`);
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        updated_at: new Date()
      });
      console.log('密码更新成功');

      return true;
    } catch (error) {
      console.error('重置密码错误:', error);
      if (error.name === 'TokenExpiredError') {
        throw new Error('Reset token has expired');
      }
      if (error.message === 'User not found') {
        throw new Error('用户不存在');
      }
      if (error.message === '密码长度不能少于6位') {
        throw new Error('密码长度不能少于6位');
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
    const decoded = jwt.verify(oldToken, config.jwt.refreshSecret);
      
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
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn }
      );

      // 解析expiresIn字符串，转换为秒
      let expireSeconds = 3600; // 默认1小时
      if (config.jwt.accessExpiresIn) {
        const match = config.jwt.accessExpiresIn.match(/(\d+)([hmd])/);
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