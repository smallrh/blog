const redisClient = require('../config/redis');

// 设置缓存
async function setCache(key, value, expire = 3600) {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const jsonValue = JSON.stringify(value);
    await redisClient.set(key, jsonValue, { EX: expire });
    return true;
  } catch (error) {
    console.error('Set cache error:', error);
    return false;
  }
}

// 获取缓存
async function getCache(key) {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Get cache error:', error);
    return null;
  }
}

// 删除缓存
async function deleteCache(key) {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Delete cache error:', error);
    return false;
  }
}

// 生成作用域缓存键
function scopeRedisKey(prefix, key) {
  return `blog:${prefix}:${key}`;
}

module.exports = {
  setCache,
  getCache,
  deleteCache,
  scopeRedisKey
};