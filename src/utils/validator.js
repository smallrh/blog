import validator from 'validator';
import { errorResponse } from '../core/response.js';

/**
 * 请求参数验证器
 */
export const requestValidator = {
  // 登录验证
  login: {
    account: { required: true, email: true, message: '请输入有效的邮箱' },
    password: { required: true, min: 6, message: '密码长度不能少于6位' }
  },
  
  // 注册验证
  register: {
    name: { required: true, message: '用户名不能为空', min: 2, max: 50 },
    email: { required: true, message: '邮箱不能为空', email: true },
    password: { required: true, message: '密码不能为空', min: 6 }
  },
  
  // 邮箱验证
  email: {
    email: { required: true, message: '邮箱不能为空', email: true }
  },
  
  // 重置密码验证
  resetPassword: {
    email: { required: true, message: '邮箱不能为空', email: true },
    verify_code: { required: true, message: '验证码不能为空' },
    new_password: { required: true, message: '新密码不能为空', min: 6 }
  },
  
  // 发送验证码验证
  sendCode: {
    email: { required: true, message: '邮箱不能为空', email: true },
    type: { required: true, enum: ['register', 'reset_password'], message: '验证码类型错误' }
  }
};

/**
 * 创建验证方法对象
 */
const validateMethods = {
  /**
   * 验证邮箱
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  email(email) {
    return validator.isEmail(email);
  },

  /**
   * 验证密码强度
   * @param {string} password - 密码
   * @returns {boolean} 是否有效
   */
  password(password) {
    // 密码至少8位，包含字母和数字
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  },

  /**
   * 验证手机号码（中国）
   * @param {string} phone - 手机号码
   * @returns {boolean} 是否有效
   */
  phone(phone) {
    return validator.isMobilePhone(phone, 'zh-CN');
  },

  /**
   * 验证URL
   * @param {string} url - URL地址
   * @returns {boolean} 是否有效
   */
  url(url) {
    return validator.isURL(url);
  },

  /**
   * 验证是否为空
   * @param {*} value - 要检查的值
   * @returns {boolean} 是否为空
   */
  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  /**
   * 验证字符串长度
   * @param {string} str - 字符串
   * @param {number} min - 最小长度
   * @param {number} max - 最大长度
   * @returns {boolean} 是否有效
   */
  length(str, min, max) {
    return str.length >= min && str.length <= max;
  },

  /**
   * 验证验证码
   * @param {string} code - 验证码
   * @returns {boolean} 是否有效
   */
  verificationCode(code) {
    return /^\d{6}$/.test(code);
  },

  /**
   * 验证整数
   * @param {*} value - 要检查的值
   * @returns {boolean} 是否为整数
   */
  isInteger(value) {
    return Number.isInteger(Number(value));
  },

  /**
   * 验证正整数
   * @param {*} value - 要检查的值
   * @returns {boolean} 是否为正整数
   */
  isPositiveInteger(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  }
};

/**
 * 请求参数验证中间件生成器函数
 * @param {string} type - 验证类型
 * @returns {Function} 中间件函数
 */
function createValidatorMiddleware(type) {
  return (req, res, next) => {
    const rules = requestValidator[type];
    if (!rules) {
      return next();
    }

    const errors = [];
    
    // 遍历规则进行验证
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = req.body[field];
      
      // 必填验证
      if (fieldRules.required && !value) {
        errors.push(fieldRules.message);
        continue;
      }
      
      // 邮箱验证
      if (value && fieldRules.email && !validateMethods.email(value)) {
        errors.push(fieldRules.message || '邮箱格式错误');
        continue;
      }
      
      // 最小长度验证
      if (value && fieldRules.min && value.length < fieldRules.min) {
        errors.push(fieldRules.message || `${field} 长度不能少于 ${fieldRules.min} 位`);
        continue;
      }
      
      // 最大长度验证
      if (value && fieldRules.max && value.length > fieldRules.max) {
        errors.push(fieldRules.message || `${field} 长度不能超过 ${fieldRules.max} 位`);
        continue;
      }
      
      // 枚举验证
      if (value && fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors.push(fieldRules.message || `${field} 必须是 ${fieldRules.enum.join(', ')} 中的一个`);
        continue;
      }
    }
    
    if (errors.length > 0) {
      return errorResponse(res, errors[0], 400);
    }

    next();
  };
}

/**
 * 验证器对象
 */
export const validate = {
  // 各种验证中间件
  login: createValidatorMiddleware('login'),
  register: createValidatorMiddleware('register'),
  email: createValidatorMiddleware('email'),
  resetPassword: createValidatorMiddleware('resetPassword'),
  sendCode: createValidatorMiddleware('sendCode'),
  
  // 各种验证方法
  ...validateMethods
};

export default validate;