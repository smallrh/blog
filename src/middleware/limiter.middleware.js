const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { config } = require('../core/config.js');
const { redisClient, ensureRedisConnection } = require('../core/redis.js');
const { log: logger } = require('../core/logger');

// 创建Redis存储实例
const createRedisStore = (endpointName) => {
  // 确保endpointName有效
  const validEndpointName = endpointName && typeof endpointName === 'string' ? endpointName : 'unknown';
  
  return new RedisStore({
    // 修改sendCommand以确保Redis连接正常
    sendCommand: async (...args) => {
      try {
        // 确保Redis连接正常
        const isConnected = await ensureRedisConnection();
        if (!isConnected) {
          logger.error('Redis connection failed, cannot perform rate limiting operation');
          // 在Redis连接失败的情况下，我们仍然尝试执行命令，让rate-limit-redis库处理错误
        }
        
        // 执行Redis命令
        return redisClient.sendCommand(args);
      } catch (error) {
        logger.error(`Rate limit Redis command error: ${error.message}`);
        // 重新抛出错误，让rate-limit-redis库处理
        throw error;
      }
    },
    // 使用指定的key格式: ratelimit:{接口}:user_id
    prefix: 'ratelimit:',
    // 自定义生成key的函数
    generateKey: (req) => {
      // 尝试获取用户ID（假设用户已认证并将用户信息存储在req.user或req.auth中）
      let userId = 'anonymous';
      
      // 检查常见的用户信息存储位置
      if (req.user && req.user.id) {
        userId = req.user.id;
      } else if (req.auth && req.auth.id) {
        userId = req.auth.id;
      } else if (req.decoded && req.decoded.id) {
        userId = req.decoded.id;
      } else {
        // 对于未认证的请求，回退到IP地址
        let ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
        // 清理IP地址，移除IPv6前缀
        if (ip && ip.startsWith('::ffff:')) {
          ip = ip.substring(7);
        }
        userId = `ip:${ip}`;
      }
      
      // 生成完整的key
      const key = `${validEndpointName}:${userId}`;
      
      // 添加日志以调试
      logger.info(`Rate limit key generated: ${key}`);
      
      return key;
    }
  });
};

/**
 * 通用限流中间件
 * 限制每个IP在指定时间窗口内的请求次数
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('api'),
  message: {
    code: 429,
    message: 'Too many requests, please try again later'
  }
});

/**
 * 登录接口限流
 * 更严格的限制，防止暴力破解
 */
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 10, // 每IP最多10次登录尝试
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('login'),
  message: {
    code: 429,
    message: 'Too many login attempts, please try again later'
  }
});

/**
 * 注册接口限流
 * 限制注册频率
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 每IP最多注册3个账号
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('register'),
  message: {
    code: 429,
    message: 'Too many registrations, please try again later'
  }
});

/**
 * 验证码接口限流 - Redis优先，内存存储作为后备
 * 防止验证码轰炸
 */
const createVerifyCodeLimiter = () => {
  try {
    // 尝试使用Redis存储（首选方案）
    logger.info('Creating verify code limiter with Redis store');
    
    // 自定义一个中间件链，先检查限流，再记录限流事件
    const limiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1小时
      max: 5, // 每IP每小时最多发送5次验证码
      standardHeaders: true,
      legacyHeaders: false,
      store: createRedisStore('verify-code'),
      message: {
        code: 429,
        message: 'Too many verification code requests, please try again later'
      }
      // 移除自定义keyGenerator，使用默认实现来正确处理IPv6地址
    });
    
    // 创建一个包装中间件，处理限流事件记录
    return (req, res, next) => {
      // 保存原始的send方法
      const originalSend = res.send;
      
      // 重写send方法来检测限流响应
      res.send = function(body) {
        // 检查是否是限流响应（状态码429）
        if (res.statusCode === 429) {
          // 使用request对象上的IP地址，让express-rate-limit正确处理IPv6
          const clientIp = req.ip || 'unknown';
          logger.warn(`Rate limit reached for verification code: verify-code:${clientIp}`);
        }
        
        // 调用原始的send方法
        return originalSend.call(this, body);
      };
      
      // 调用原始的limiter中间件
      limiter(req, res, next);
    };
  } catch (error) {
    // 如果Redis初始化失败，使用内存存储作为后备方案
    logger.error(`Failed to create Redis-backed limiter, falling back to memory store: ${error.message}`);
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1小时
      max: 5, // 每IP每小时最多发送5次验证码
      standardHeaders: true,
      legacyHeaders: false,
      // 使用默认内存存储和默认的IP处理逻辑
      message: {
        code: 429,
        message: 'Too many verification code requests, please try again later'
      }
    });
  }
};

// 创建验证码限流中间件
const verifyCodeLimiter = createVerifyCodeLimiter();

/**
 * 自定义限流配置生成器
 * @param {Object} options - 限流选项
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {number} options.max - 最大请求数
 * @param {string} options.message - 限流消息
 */
const createLimiter = (options) => {
  const endpointName = options.endpointName || 'custom';
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(endpointName),
    message: {
      code: 429,
      message: options.message || 'Too many requests, please try again later'
    }
  });
};

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  verifyCodeLimiter,
  createLimiter
};