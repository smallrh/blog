const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../core/config.js').config;

/**
 * 密码加密工具
 */
const passwordUtil = {
  /**
   * 加密密码
   * @param {string} password - 原始密码
   * @returns {Promise<string>} 加密后的密码
   */
  async hash(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  /**
   * 验证密码
   * @param {string} password - 原始密码
   * @param {string} hashedPassword - 加密后的密码
   * @returns {Promise<boolean>} 密码是否正确
   */
  async verify(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
};

/**
 * JWT工具
 */
const jwtUtil = {
  /**
   * 生成JWT token
   * @param {Object} payload - JWT载荷
   * @param {string} expiresIn - 过期时间
   * @returns {string} 生成的token
   */
  generateToken(payload, expiresIn = config.jwt.expiresIn) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  },

  /**
   * 验证JWT token
   * @param {string} token - 要验证的token
   * @returns {Object|null} 解码后的payload或null
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return null;
    }
  },

  /**
   * 解码JWT token（不验证签名）
   * @param {string} token - 要解码的token
   * @returns {Object|null} 解码后的payload或null
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  },

  /**
   * 生成用户登录token
   * @param {Object} user - 用户信息
   * @returns {string} 登录token
   */
  generateLoginToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      name: user.name
    };
    return this.generateToken(payload);
  },

  /**
   * 生成管理员登录token
   * @param {Object} admin - 管理员信息
   * @returns {string} 管理员token
   */
  generateAdminToken(admin) {
    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'admin',
      username: admin.username
    };
    return this.generateToken(payload);
  }
};

/**
 * 生成随机验证码
 * @param {number} length - 验证码长度
 * @returns {string} 随机验证码
 */
const generateVerificationCode = (length = 6) => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
const generateRandomString = (length = 32) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  passwordUtil,
  jwtUtil,
  generateVerificationCode,
  generateRandomString
};