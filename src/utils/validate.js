/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} - 验证结果
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号码格式（中国大陆）
 * @param {string} phone - 手机号码
 * @returns {boolean} - 验证结果
 */
export function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码复杂度
 * @param {string} password - 密码
 * @returns {Object} - 验证结果
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('密码长度不能少于6个字符');
  }
  
  if (password && password.length > 50) {
    errors.push('密码长度不能超过50个字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {Object} - 验证结果
 */
export function validateUsername(username) {
  const errors = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('用户名不能为空');
  }
  
  if (username && username.length < 2) {
    errors.push('用户名长度不能少于2个字符');
  }
  
  if (username && username.length > 20) {
    errors.push('用户名长度不能超过20个字符');
  }
  
  // 检查用户名格式（只允许字母、数字、下划线、中文）
  const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (username && !usernameRegex.test(username)) {
    errors.push('用户名只能包含字母、数字、下划线和中文');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证URL格式
 * @param {string} url - URL地址
 * @returns {boolean} - 验证结果
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证是否为有效的日期
 * @param {any} date - 日期
 * @returns {boolean} - 验证结果
 */
export function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

/**
 * 验证是否为数字
 * @param {any} value - 要验证的值
 * @returns {boolean} - 验证结果
 */
export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * 验证是否为整数
 * @param {any} value - 要验证的值
 * @returns {boolean} - 验证结果
 */
export function isInteger(value) {
  return Number.isInteger(parseFloat(value));
}

/**
 * 验证是否为正整数
 * @param {any} value - 要验证的值
 * @returns {boolean} - 验证结果
 */
export function isPositiveInteger(value) {
  return isInteger(value) && parseFloat(value) > 0;
}

/**
 * 验证字符串长度范围
 * @param {string} str - 字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {Object} - 验证结果
 */
export function validateStringLength(str, min = 0, max = Infinity) {
  const errors = [];
  
  if (str === undefined || str === null) {
    errors.push('字符串不能为空');
  } else if (str.length < min) {
    errors.push(`字符串长度不能少于${min}个字符`);
  } else if (str.length > max) {
    errors.push(`字符串长度不能超过${max}个字符`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证数组
 * @param {any} arr - 要验证的数组
 * @param {number} minLength - 最小长度
 * @param {number} maxLength - 最大长度
 * @returns {Object} - 验证结果
 */
export function validateArray(arr, minLength = 0, maxLength = Infinity) {
  const errors = [];
  
  if (!Array.isArray(arr)) {
    errors.push('必须是数组');
  } else if (arr.length < minLength) {
    errors.push(`数组长度不能少于${minLength}`);
  } else if (arr.length > maxLength) {
    errors.push(`数组长度不能超过${maxLength}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证请求参数
 * @param {Object} data - 要验证的数据
 * @param {Object} rules - 验证规则
 * @returns {Object} - 验证结果
 */
export function validateData(data, rules) {
  const errors = {};
  let isValid = true;
  
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    
    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = errors[field] || [];
      errors[field].push(rule.message || `${field}不能为空`);
      isValid = false;
      return;
    }
    
    // 如果不是必填且值为空，跳过其他验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return;
    }
    
    // 类型验证
    if (rule.type && typeof value !== rule.type) {
      errors[field] = errors[field] || [];
      errors[field].push(rule.typeMessage || `${field}类型错误`);
      isValid = false;
    }
    
    // 自定义验证函数
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value, data);
      if (result !== true) {
        errors[field] = errors[field] || [];
        errors[field].push(result || `${field}验证失败`);
        isValid = false;
      }
    }
    
    // 正则验证
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = errors[field] || [];
      errors[field].push(rule.patternMessage || `${field}格式错误`);
      isValid = false;
    }
    
    // 长度验证
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = errors[field] || [];
      errors[field].push(`长度不能少于${rule.minLength}个字符`);
      isValid = false;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = errors[field] || [];
      errors[field].push(`长度不能超过${rule.maxLength}个字符`);
      isValid = false;
    }
  });
  
  return {
    isValid,
    errors
  };
}