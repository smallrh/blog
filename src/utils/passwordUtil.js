import bcrypt from 'bcrypt';
import { logger } from '../core/logger.js';

// 盐的轮数
const SALT_ROUNDS = 12;

/**
 * 加密密码
 * @param {string} plainPassword - 明文密码
 * @returns {Promise<string>} - 加密后的密码
 */
export async function hashPassword(plainPassword) {
  try {
    // 生成盐并哈希密码
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    logger.error('密码加密失败:', error);
    throw new Error('密码加密失败');
  }
}

/**
 * 验证密码
 * @param {string} plainPassword - 明文密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} - 验证结果
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    // 比较密码
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    return isValid;
  } catch (error) {
    logger.error('密码验证失败:', error);
    return false;
  }
}

/**
 * 生成随机密码
 * @param {number} length - 密码长度
 * @returns {string} - 随机生成的密码
 */
export function generateRandomPassword(length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  
  // 确保密码包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符
  password += charset[Math.floor(Math.random() * 26) + 26]; // 大写字母
  password += charset[Math.floor(Math.random() * 26)]; // 小写字母
  password += charset[Math.floor(Math.random() * 10) + 52]; // 数字
  password += charset[Math.floor(Math.random() * 22) + 62]; // 特殊字符
  
  // 填充剩余字符
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // 打乱密码字符顺序
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  return password;
}

/**
 * 检查密码强度
 * @param {string} password - 要检查的密码
 * @returns {Object} - 密码强度信息
 */
export function checkPasswordStrength(password) {
  const strength = {
    score: 0,
    message: '',
    isStrong: false,
    suggestions: []
  };
  
  // 检查长度
  if (password.length < 6) {
    strength.suggestions.push('密码长度至少6个字符');
  } else if (password.length >= 10) {
    strength.score += 2;
  } else {
    strength.score += 1;
  }
  
  // 检查是否包含小写字母
  if (/[a-z]/.test(password)) {
    strength.score += 1;
  } else {
    strength.suggestions.push('包含至少一个小写字母');
  }
  
  // 检查是否包含大写字母
  if (/[A-Z]/.test(password)) {
    strength.score += 1;
  } else {
    strength.suggestions.push('包含至少一个大写字母');
  }
  
  // 检查是否包含数字
  if (/[0-9]/.test(password)) {
    strength.score += 1;
  } else {
    strength.suggestions.push('包含至少一个数字');
  }
  
  // 检查是否包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength.score += 1;
  } else {
    strength.suggestions.push('包含至少一个特殊字符');
  }
  
  // 评估密码强度
  if (strength.score <= 2) {
    strength.message = '弱';
    strength.isStrong = false;
  } else if (strength.score <= 4) {
    strength.message = '中';
    strength.isStrong = false;
  } else {
    strength.message = '强';
    strength.isStrong = true;
  }
  
  return strength;
}

/**
 * 密码复杂度验证
 * @param {string} password - 要验证的密码
 * @returns {Object} - 验证结果
 */
export function validatePasswordComplexity(password) {
  const errors = [];
  
  // 密码长度验证
  if (!password || password.length < 6) {
    errors.push('密码长度不能少于6个字符');
  }
  
  // 可以根据需要添加更多验证规则
  if (password && password.length > 50) {
    errors.push('密码长度不能超过50个字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}