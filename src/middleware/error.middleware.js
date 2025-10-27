import { log } from '../core/logger.js';
import { serverErrorResponse, errorResponse, notFoundResponse } from '../core/response.js';

/**
 * 错误处理中间件
 * 捕获所有未处理的错误并统一响应格式
 * @param {Error} err - 错误对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件函数
 */
export const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  log.error('Unhandled error', err);

  // 根据错误类型返回不同的响应
  if (err.name === 'ValidationError') {
    // 请求参数验证错误
    return errorResponse(res, 'Validation error', 400, {
      errors: Object.values(err.errors).map(e => e.message)
    });
  } else if (err.name === 'UnauthorizedError') {
    // JWT认证错误
    return errorResponse(res, 'Unauthorized', 401);
  } else if (err.code === 'ER_DUP_ENTRY') {
    // 数据库唯一约束错误
    return errorResponse(res, 'Duplicate entry', 409);
  } else if (err.code === 'ER_NO_SUCH_TABLE') {
    // 表不存在错误
    return serverErrorResponse(res, 'Database schema error');
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // JSON解析错误
    return errorResponse(res, 'Invalid JSON format', 400);
  }

  // 默认返回服务器错误
  return serverErrorResponse(res);
};

/**
 * 404错误处理中间件
 * 捕获所有未匹配的路由
 */
export const notFoundHandler = (req, res, next) => {
  return notFoundResponse(res, 'API endpoint not found');
};

/**
 * 日志记录中间件
 * 记录请求信息
 */
export const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // 记录请求开始
  log.info(`[${req.method}] ${req.url}`);

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // 根据状态码选择日志级别
    if (statusCode >= 500) {
      log.error(`[${req.method}] ${req.url} ${statusCode} ${duration}ms`);
    } else if (statusCode >= 400) {
      log.warn(`[${req.method}] ${req.url} ${statusCode} ${duration}ms`);
    } else {
      log.info(`[${req.method}] ${req.url} ${statusCode} ${duration}ms`);
    }
  });

  next();
};

/**
 * 跨域中间件
 * 设置CORS头
 */
export const corsMiddleware = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '3600');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};