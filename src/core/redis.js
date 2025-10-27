require('dotenv/config');
const { createClient } = require('redis');

// 创建Redis客户端
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB) || 0,
});

// 初始化Redis连接
const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection failed:', error);
    process.exit(1);
  }
};

// Redis操作封装
const redis = {
  async set(key, value, expireTime = 3600) {
    try {
      const jsonValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await redisClient.set(key, jsonValue, { EX: expireTime });
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      
      // 尝试解析JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  async exists(key) {
    try {
      return await redisClient.exists(key) > 0;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }
};

// 导出redis客户端和初始化函数
module.exports = {
  redisClient,
  initializeRedis,
  redis
};