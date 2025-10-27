import jwt from 'jsonwebtoken';
import { redis } from '../core/redis.js';
import { config } from '../core/config.js';
import { unauthorizedResponse } from '../core/response.js';

/**
 * JWT认证中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件函数
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return unauthorizedResponse(res, 'Authorization header is required');
    }

    // 检查Bearer前缀
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return unauthorizedResponse(res, 'Invalid authorization format');
    }

    // 验证JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 检查token是否在Redis中被列入黑名单（已登出）
    const isBlacklisted = await redis.exists(`token:blacklist:${token}`);
    if (isBlacklisted) {
      return unauthorizedResponse(res, 'Token has been revoked');
    }

    // 将用户信息存储到请求对象中
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Invalid token');
    }
    return unauthorizedResponse(res, 'Authentication failed');
  }
};

/**
 * 可选的认证中间件
 * 如果有token则验证，没有也可以继续
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');
      if (bearer === 'Bearer' && token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        const isBlacklisted = await redis.exists(`token:blacklist:${token}`);
        
        if (!isBlacklisted) {
          req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'user'
          };
        }
      }
    }
  } catch (error) {
    // 忽略错误，继续执行
  }
  
  next();
};

/**
 * 权限检查中间件
 * @param {Array} requiredRoles - 所需角色列表
 */
export const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};