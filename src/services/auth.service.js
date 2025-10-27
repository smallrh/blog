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
    // 检查邮箱是否已存在
    const isEmailExists = await this.userRepository.isEmailExists(userData.email);
    if (isEmailExists) {
      throw new Error('Email already exists');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, config.bcrypt.saltRounds);

    // 创建用户
    const newUser = await this.userRepository.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      avatar: '',
      bio: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 重新获取用户信息（不包含密码）
    return this.userRepository.findById(newUser.id);
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
    if (user.status !== 'active') {
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
    // 获取token过期时间
    const decoded = jwt.decode(token);
    const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);

    // 将token加入黑名单，过期时间设置为token剩余有效期
    await redis.setex(`token:blacklist:${token}`, expiryTime, '1');
    return true;
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
    // 检查邮箱是否存在用户
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email not registered');
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 计算过期时间（5分钟后）
    const expiryTime = 5 * 60;

    // 存储验证码到Redis，设置过期时间
    await redis.setex(`verify:code:${email}`, expiryTime, code);

    // 发送验证码邮件
    await emailUtil.sendVerificationCode(email, code, type || 'reset_password');
    return true;
  }

  /**
   * 验证验证码
   * @param {string} email - 用户邮箱
   * @param {string} code - 用户输入的验证码
   * @returns {Promise<Object>} 包含重置token的对象
   */
  async verifyCode(email, code) {
    try {
      // 从Redis获取验证码
      const storedCode = await redis.get(`verify:code:${email}`);
      
      if (!storedCode) {
        throw new Error('Verification code has expired or does not exist');
      }

      if (storedCode !== code) {
        throw new Error('Invalid verification code');
      }

      // 验证成功后删除验证码，防止重复使用
      await redis.del(`verify:code:${email}`);
      
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

      // 生成新token
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // 将旧token加入黑名单
      const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
      await redis.setex(`token:blacklist:${oldToken}`, expiryTime, '1');

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