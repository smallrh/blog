require('dotenv/config');
const { createClient } = require('redis');

// 创建Redis客户端
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB) || 0,
  // 添加重连策略
  socket: {
    reconnectStrategy: (retries) => {
      // 最大重试次数为10次，每次间隔指数增长但不超过5秒
      if (retries > 10) {
        console.error('Redis重连次数超过限制，放弃重连');
        return new Error('Redis connection failed after multiple retries');
      }
      const delay = Math.min(retries * 100, 5000);
      console.log(`Redis将在 ${delay}ms 后进行第 ${retries} 次重连`);
      return delay;
    },
    // 设置连接超时时间为5秒
    connectTimeout: 5000,
  },
});

// 添加Redis事件监听
redisClient.on('error', (err) => {
  console.error('Redis客户端错误:', err);
});

redisClient.on('connect', () => {
  console.log('Redis正在连接...');
});

redisClient.on('ready', () => {
  console.log('Redis连接就绪，可以开始操作');
});

redisClient.on('end', () => {
  console.log('Redis连接已关闭');
});

redisClient.on('reconnecting', (params) => {
  console.log(`Redis正在重连: 尝试次数=${params.attempt}, 延迟=${params.delay}ms`);
});

// 检查Redis连接状态
const isRedisConnected = () => {
  return redisClient.isReady;
};

// 确保Redis连接正常的辅助函数
const ensureRedisConnection = async () => {
  if (!isRedisConnected()) {
    console.warn('Redis未连接，尝试重新连接...');
    try {
      await redisClient.connect();
      console.log('Redis重新连接成功');
      return true;
    } catch (error) {
      console.error('Redis重新连接失败:', error);
      return false;
    }
  }
  return true;
};

// 初始化Redis连接
const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection failed:', error);
    // 不直接退出进程，而是让应用尝试在运行时恢复连接
    // process.exit(1);
  }
};

// Redis操作封装
const redis = {
  async set(key, value, expireTime = 3600) {
    try {
      // 操作前确保连接正常
      if (!(await ensureRedisConnection())) {
        console.error(`Redis连接异常，无法设置键: ${key}`);
        return false;
      }
      
      console.log(`执行Redis set操作: 键=${key}, 过期时间=${expireTime}s`);
      const jsonValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await redisClient.set(key, jsonValue, { EX: expireTime });
      console.log(`Redis set操作成功: 键=${key}`);
      return true;
    } catch (error) {
      console.error(`Redis set error [${key}]:`, error);
      return false;
    }
  },

  async get(key) {
    try {
      // 操作前确保连接正常
      if (!(await ensureRedisConnection())) {
        console.error(`Redis连接异常，无法获取键: ${key}`);
        return null;
      }
      
      console.log(`执行Redis get操作: 键=${key}`);
      const value = await redisClient.get(key);
      console.log(`Redis get操作完成: 键=${key}, 是否存在=${value !== null}`);
      
      if (!value) return null;
      
      // 尝试解析JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Redis get error [${key}]:`, error);
      return null;
    }
  },

  async del(key) {
    try {
      // 操作前确保连接正常
      if (!(await ensureRedisConnection())) {
        console.error(`Redis连接异常，无法删除键: ${key}`);
        return false;
      }
      
      console.log(`执行Redis del操作: 键=${key}`);
      await redisClient.del(key);
      console.log(`Redis del操作成功: 键=${key}`);
      return true;
    } catch (error) {
      console.error(`Redis del error [${key}]:`, error);
      return false;
    }
  },

  async exists(key) {
    try {
      // 操作前确保连接正常
      if (!(await ensureRedisConnection())) {
        console.error(`Redis连接异常，无法检查键是否存在: ${key}`);
        return false;
      }
      
      console.log(`执行Redis exists操作: 键=${key}`);
      const result = await redisClient.exists(key) > 0;
      console.log(`Redis exists操作完成: 键=${key}, 存在=${result}`);
      return result;
    } catch (error) {
      console.error(`Redis exists error [${key}]:`, error);
      return false;
    }
  },
  
  // 获取连接状态的方法
  isConnected() {
    return isRedisConnected();
  }
};

// 导出redis客户端和初始化函数
module.exports = {
  redisClient,
  initializeRedis,
  redis,
  isRedisConnected,
  ensureRedisConnection
};