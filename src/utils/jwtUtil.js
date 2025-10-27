import jwt from 'jsonwebtoken';
import { config } from '../core/config.js';
import { logger } from '../core/logger.js';

/**
 * 生成JWT令牌
 * @param {Object} payload - 令牌载荷
 * @param {number} expiresIn - 过期时间（秒）
 * @returns {Promise<string>} - JWT令牌
 */
export async function generateToken(payload, expiresIn = null) {
  try {
    // 使用配置中的密钥
    const secret = config.jwt.secret;
    
    // 如果未指定过期时间，使用配置中的默认值
    const expiry = expiresIn || config.jwt.expiresIn || '24h';
    
    // 生成令牌
    const token = jwt.sign(payload, secret, {
      expiresIn: expiry,
      algorithm: 'HS256'
    });
    
    logger.info('Token generated successfully');
    return token;
  } catch (error) {
    logger.error('Token generation failed:', error);
    throw new Error('生成令牌失败');
  }
}

/**
 * 验证JWT令牌
 * @param {string} token - JWT令牌
 * @returns {Promise<Object>} - 验证结果
 */
export async function verifyToken(token) {
  try {
    const secret = config.jwt.secret;
    
    // 验证令牌
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256']
    });
    
    logger.info('Token verified successfully');
    return {
      isValid: true,
      decoded,
      error: null
    };
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    // 处理不同类型的错误
    let errorMessage = '令牌无效';
    if (error.name === 'TokenExpiredError') {
      errorMessage = '令牌已过期';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = '令牌格式错误';
    }
    
    return {
      isValid: false,
      decoded: null,
      error: errorMessage
    };
  }
}

/**
 * 解析JWT令牌（不验证）
 * @param {string} token - JWT令牌
 * @returns {Object|null} - 解析后的令牌
 */
export function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    logger.error('Token decoding failed:', error);
    return null;
  }
}

/**
 * 生成刷新令牌
 * @param {Object} payload - 令牌载荷
 * @returns {Promise<string>} - 刷新令牌
 */
export async function generateRefreshToken(payload) {
  // 刷新令牌通常有效期较长
  const expiresIn = config.jwt.refreshExpiresIn || '7d';
  return generateToken(payload, expiresIn);
}

/**
 * 从请求头提取令牌
 * @param {import('express').Request} req - Express请求对象
 * @returns {string|null} - 令牌
 */
export function extractTokenFromHeader(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    
    // 检查Bearer前缀
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return null;
    }
    
    return token;
  } catch (error) {
    logger.error('Failed to extract token from header:', error);
    return null;
  }
}

/**
 * 生成用户令牌对（访问令牌和刷新令牌）
 * @param {Object} userInfo - 用户信息
 * @returns {Promise<Object>} - 令牌对
 */
export async function generateTokenPair(userInfo) {
  try {
    // 准备载荷数据
    const payload = {
      id: userInfo.id,
      email: userInfo.email,
      role: userInfo.role
    };
    
    // 生成访问令牌
    const accessToken = await generateToken(payload);
    
    // 生成刷新令牌（可以只包含必要信息）
    const refreshPayload = {
      id: userInfo.id
    };
    const refreshToken = await generateRefreshToken(refreshPayload);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn || '24h'
    };
  } catch (error) {
    logger.error('Failed to generate token pair:', error);
    throw new Error('生成令牌失败');
  }
}