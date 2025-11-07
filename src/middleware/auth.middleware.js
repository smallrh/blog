const jwt = require('jsonwebtoken');
const redis = require('../core/redis');
const { config } = require('../core/config');
const { unauthorizedResponse } = require('../core/response');
const { logger } = require('../core/logger');

/**
 * 核心认证验证逻辑
 * @param {Object} req - Express请求对象
 * @param {string} token - JWT token
 * @returns {Object} 解析后的用户信息
 * @throws {Error} 认证相关错误
 */
const verifyToken = async (req, token) => {
  try {
    // 验证JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 检查token是否在Redis中被列入黑名单（已登出）
    let isBlacklisted = false;
    try {
      isBlacklisted = await redis.exists(`token:blacklist:${token}`);
    } catch (redisError) {
      logger.error('检查token黑名单状态时Redis错误:', redisError);
      // 继续验证，但记录错误
    }
    
    if (isBlacklisted) {
      throw new Error('Token已被吊销');
    }
    
    // 检查token是否在用户的有效token列表中
    let isTokenValid = true; // 默认有效，以防Redis操作失败
    try {
      isTokenValid = await redis.sismember(`user:${decoded.id}:tokens`, token);
    } catch (redisError) {
      logger.error('检查token有效性时Redis错误:', redisError);
      // 继续验证，但记录错误
    }
    
    if (!isTokenValid) {
      throw new Error('Token已失效，请重新登录');
    }
    
    // 尝试从Redis获取完整用户信息
    let userInfo = null;
    try {
      const userCacheKey = `user:${decoded.id}:${token.substring(0, 10)}`;
      userInfo = await redis.get(userCacheKey);
    } catch (redisError) {
      logger.error('获取用户缓存信息时Redis错误:', redisError);
      // 继续使用JWT信息
    }
    
    if (userInfo) {
      // 如果Redis中有缓存，使用缓存的用户信息
      return {
        id: decoded.id,
        ...userInfo
      };
    } else {
      // 如果Redis中没有缓存，使用JWT中的信息
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user'
      };
    }
  } catch (error) {
    // 重新抛出错误，保留原始错误类型
    throw error;
  }
};

/**
 * JWT认证中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件函数
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return unauthorizedResponse(res, '请先登录');
    }

    // 检查Bearer前缀
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return unauthorizedResponse(res, '无效的认证格式');
    }

    // 验证token并获取用户信息
    const userInfo = await verifyToken(req, token);
    
    // 设置统一的用户信息格式，确保限流中间件能正确识别
    req.auth = userInfo; // 用于限流中间件识别
    req.user = userInfo; // 兼容现有代码
    req.userId = userInfo.id; // 明确设置用户ID

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token已过期');
    } else if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, '无效的Token');
    }
    logger.error('认证过程中发生错误:', error);
    return unauthorizedResponse(res, error.message || '认证失败');
  }
};

/**
 * 认证中间件 - 兼容旧的函数名
 * 直接调用authMiddleware，保持向后兼容性
 */
const authenticateToken = authMiddleware;

/**
 * 可选的认证中间件
 * 如果有token则验证，没有也可以继续
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');
      if (bearer === 'Bearer' && token) {
        try {
          // 使用共享的verifyToken函数验证token
          const userInfo = await verifyToken(req, token);
          
          // 设置统一的用户信息格式，确保限流中间件能正确识别
          req.auth = userInfo; // 用于限流中间件识别
          req.user = userInfo; // 兼容现有代码
          req.userId = userInfo.id; // 明确设置用户ID
          
          logger.debug('可选认证成功，用户已识别:', userInfo.id);
        } catch (tokenError) {
          // 可选认证中，验证失败时仅记录日志，不中断流程
          logger.debug('可选认证中token验证失败，但允许继续:', tokenError.message);
          // 不设置用户信息，让请求继续
        }
      }
    }
  } catch (error) {
    // 忽略所有错误，确保请求继续执行
    logger.debug('可选认证过程中发生错误，但允许继续:', error.message);
  }
  
  next();
};

/**
 * 权限检查中间件
 * @param {Array} requiredRoles - 所需角色列表
 */
const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    // 优先从req.auth获取用户信息，兼容req.user
    const userInfo = req.auth || req.user;
    
    if (!userInfo) {
      return unauthorizedResponse(res, 'Authentication required');
    }
    
    // 确保角色字段存在，如果不存在默认为'user'
    const userRole = userInfo.role || 'user';
    
    if (!requiredRoles.includes(userRole)) {
      logger.warn(`用户 ${userInfo.id} 尝试访问受限资源，所需角色: ${requiredRoles.join(', ')}, 用户角色: ${userRole}`);
      return res.status(403).json({
        code: 403,
        message: 'Insufficient permissions'
      });
    }
    
    logger.debug(`用户 ${userInfo.id} 角色验证通过，角色: ${userRole}`);
    next();
  };
};

// 统一导出所有认证相关中间件
module.exports = {
  // 主认证中间件，处理强制认证
  authMiddleware,
  // 保持与旧代码的兼容性，别名指向authMiddleware
  authenticateToken: authMiddleware,
  // 可选认证中间件，用于不强制要求登录的接口
  optionalAuthMiddleware,
  // 角色验证中间件，用于权限控制
  roleMiddleware
};