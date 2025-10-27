const UserRepository = require('../repositories/user.repository');
const { passwordUtil, jwtUtil, generateVerificationCode } = require('../utils/crypto');
const { emailUtil, verificationCodeUtil } = require('../utils/email');
const { redis } = require('../core/redis');
const { config } = require('../core/config');
const { log } = require('../core/logger');

/**
 * 用户服务层
 */
class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @returns {Promise<Object>}
   */
  async register(data) {
    // 验证验证码
    const isCodeValid = await this.verifyCode(data.email, data.verify_code, 'register');
    if (!isCodeValid) {
      throw new Error('Invalid verification code');
    }

    // 检查邮箱是否已存在
    const isEmailExists = await this.userRepository.isEmailExists(data.email);
    if (isEmailExists) {
      throw new Error('Email already exists');
    }

    // 加密密码
    const hashedPassword = await passwordUtil.hash(data.password);

    // 创建用户
    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      avatar: data.avatar || null,
      role: 'user',
      status: 1
    });

    // 注册成功后发送欢迎邮件
    try {
      await emailUtil.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      log.error('Failed to send welcome email', error);
    }

    // 清除验证码缓存
    await this.clearVerificationCode(data.email, 'register');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
  }

  /**
   * 用户登录
   * @param {string} account - 账号（邮箱）
   * @param {string} password - 密码
   * @param {string} ip - IP地址
   * @returns {Promise<Object>}
   */
  async login(account, password, ip) {
    // 查找用户
    const user = await this.userRepository.findByAccount(account);
    if (!user) {
      throw new Error('Invalid account or password');
    }

    // 检查用户状态
    if (user.status === 0) {
      throw new Error('Account has been disabled');
    }

    // 验证密码
    const isPasswordValid = await passwordUtil.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid account or password');
    }

    // 更新最后登录信息
    await this.userRepository.updateLastLogin(user.id, ip);

    // 生成JWT token
    const token = jwtUtil.generateLoginToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    };
  }

  /**
   * 登出
   * @param {string} token - JWT token
   * @returns {Promise<boolean>}
   */
  async logout(token) {
    // 将token加入黑名单
    const decoded = jwtUtil.decodeToken(token);
    if (decoded && decoded.exp) {
      const expireTime = decoded.exp - Math.floor(Date.now() / 1000);
      await redis.set(`token:blacklist:${token}`, 1, expireTime);
    }
    return true;
  }

  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>}
   */
  async getUserInfo(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * 发送验证码
   * @param {string} email - 邮箱
   * @param {string} type - 验证码类型
   * @returns {Promise<boolean>}
   */
  async sendVerificationCode(email, type) {
    // 检查发送频率
    const cooldownKey = verificationCodeUtil.getCooldownKey(email);
    const isInCooldown = await redis.exists(cooldownKey);
    if (isInCooldown) {
      throw new Error('Please try again later');
    }

    // 检查每日发送次数
    const sendCountKey = verificationCodeUtil.getSendCountKey(email);
    const sendCount = await redis.get(sendCountKey) || 0;
    if (sendCount >= config.verification.maxSendCount) {
      throw new Error('Exceeded daily limit');
    }

    // 生成验证码
    const code = generateVerificationCode();
    const key = verificationCodeUtil.getVerificationKey(email, type);

    // 存储验证码到Redis
    await redis.set(key, code, config.verification.codeExpireTime);
    
    // 增加发送计数
    await redis.set(sendCountKey, parseInt(sendCount) + 1, 86400); // 24小时
    
    // 设置冷却时间
    await redis.set(cooldownKey, 1, config.verification.minInterval);

    // 发送邮件
    await emailUtil.sendVerificationCode(email, code, type);
    
    return true;
  }

  /**
   * 验证验证码
   * @param {string} email - 邮箱
   * @param {string} code - 验证码
   * @param {string} type - 验证码类型
   * @returns {Promise<boolean>}
   */
  async verifyCode(email, code, type) {
    const key = verificationCodeUtil.getVerificationKey(email, type);
    const storedCode = await redis.get(key);
    
    return storedCode === code;
  }

  /**
   * 清除验证码
   * @param {string} email - 邮箱
   * @param {string} type - 验证码类型
   */
  async clearVerificationCode(email, type) {
    const key = verificationCodeUtil.getVerificationKey(email, type);
    await redis.del(key);
  }

  /**
   * 重置密码
   * @param {Object} data - 重置密码数据
   * @returns {Promise<boolean>}
   */
  async resetPassword(data) {
    // 验证验证码
    const isCodeValid = await this.verifyCode(data.email, data.verify_code, 'reset_password');
    if (!isCodeValid) {
      throw new Error('Invalid verification code');
    }

    // 查找用户
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Email not found');
    }

    // 加密新密码
    const hashedPassword = await passwordUtil.hash(data.new_password);

    // 更新密码
    await this.userRepository.update(user.id, { password: hashedPassword });

    // 清除验证码
    await this.clearVerificationCode(data.email, 'reset_password');

    return true;
  }

  /**
   * 修改密码（邮箱验证）
   * @param {number} userId - 用户ID
   * @param {string} email - 邮箱
   * @param {string} verifyCode - 验证码
   * @param {string} newPassword - 新密码
   * @returns {Promise<boolean>}
   */
  async changePassword(userId, email, verifyCode, newPassword) {
    // 获取用户信息
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 验证邮箱是否匹配
    if (user.email !== email) {
      throw new Error('Email does not match user account');
    }

    // 验证验证码
    const isCodeValid = await this.verifyCode(email, verifyCode, 'reset_password');
    if (!isCodeValid) {
      throw new Error('Invalid verification code');
    }

    // 加密新密码
    const hashedPassword = await passwordUtil.hash(newPassword);

    // 更新密码
    await this.userRepository.update(userId, { password: hashedPassword });

    // 清除验证码
    await this.clearVerificationCode(email, 'reset_password');

    return true;
  }

  /**
   * 更新用户资料
   * @param {number} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async updateProfile(userId, updateData) {
    // 获取用户信息
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 更新用户信息
    await this.userRepository.update(userId, updateData);

    // 清除Redis缓存
    await redis.del(`blog:user:${userId}`);

    // 返回更新后的用户信息
    return await this.getUserInfo(userId);
  }

  /**
   * 获取用户收藏的文章
   * @param {number} userId - 用户ID
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise<Object>} 用户收藏的文章列表
   */
  async getUserCollections(userId, page = 1, pageSize = 10) {
    // 暂时返回空数据，实际实现需要查询数据库
    return {
      count: 0,
      list: []
    };
  }

  /**
   * 获取用户发布的文章
   * @param {number} userId - 用户ID
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise<Object>} 用户发布的文章列表
   */
  async getUserPosts(userId, page = 1, pageSize = 10) {
    // 暂时返回空数据，实际实现需要查询数据库
    return {
      count: 0,
      list: []
    };
  }
}

module.exports = UserService;