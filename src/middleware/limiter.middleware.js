import rateLimit from 'express-rate-limit';
import { config } from '../core/config.js';

/**
 * 通用限流中间件
 * 限制每个IP在指定时间窗口内的请求次数
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: 'Too many requests, please try again later'
  }
});

/**
 * 登录接口限流
 * 更严格的限制，防止暴力破解
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每IP最多5次登录尝试
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: 'Too many login attempts, please try again later'
  }
});

/**
 * 注册接口限流
 * 限制注册频率
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 每IP最多注册3个账号
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: 'Too many registrations, please try again later'
  }
});

/**
 * 验证码接口限流
 * 防止验证码轰炸
 */
export const verifyCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每IP每小时最多发送5次验证码
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: 'Too many verification code requests, please try again later'
  }
});

/**
 * 自定义限流配置生成器
 * @param {Object} options - 限流选项
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {number} options.max - 最大请求数
 * @param {string} options.message - 限流消息
 */
export const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 429,
      message: options.message || 'Too many requests, please try again later'
    }
  });
};