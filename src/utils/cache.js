import { redis } from '../core/redis.js';
import { log } from '../core/logger.js';

/**
 * 缓存工具
 * 提供自动缓存和缓存失效控制
 */
export const cacheUtil = {
  /**
   * 生成缓存键
   * @param {string} prefix - 缓存键前缀
   * @param {*} id - 唯一标识符
   * @returns {string} 缓存键
   */
  createKey(prefix, id) {
    return `${prefix}:${id}`;
  },

  /**
   * 获取缓存，如果不存在则执行回调并缓存结果
   * @param {string} key - 缓存键
   * @param {Function} fetchFn - 获取数据的回调函数
   * @param {number} ttl - 缓存过期时间（秒）
   * @returns {Promise<any>} 数据
   */
  async getOrSet(key, fetchFn, ttl = 3600) {
    try {
      // 尝试从缓存获取
      const cachedData = await redis.get(key);
      if (cachedData !== null) {
        log.debug(`Cache hit: ${key}`);
        return cachedData;
      }

      // 缓存未命中，执行回调获取数据
      log.debug(`Cache miss: ${key}`);
      const data = await fetchFn();

      // 缓存数据
      if (data !== null && data !== undefined) {
        await redis.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      log.error(`Cache operation failed for key: ${key}`, error);
      // 缓存出错时，直接返回原始数据
      return await fetchFn();
    }
  },

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 过期时间（秒）
   * @returns {Promise<boolean>} 是否成功
   */
  async set(key, value, ttl = 3600) {
    try {
      await redis.set(key, value, ttl);
      log.debug(`Cache set: ${key}`);
      return true;
    } catch (error) {
      log.error(`Cache set failed for key: ${key}`, error);
      return false;
    }
  },

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Promise<any>} 缓存值
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      if (value !== null) {
        log.debug(`Cache get: ${key}`);
      }
      return value;
    } catch (error) {
      log.error(`Cache get failed for key: ${key}`, error);
      return null;
    }
  },

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>} 是否成功
   */
  async del(key) {
    try {
      await redis.del(key);
      log.debug(`Cache delete: ${key}`);
      return true;
    } catch (error) {
      log.error(`Cache delete failed for key: ${key}`, error);
      return false;
    }
  },

  /**
   * 批量删除缓存
   * @param {Array<string>} keys - 缓存键数组
   * @returns {Promise<boolean>} 是否成功
   */
  async delBatch(keys) {
    try {
      await Promise.all(keys.map(key => redis.del(key)));
      log.debug(`Cache batch delete: ${keys.length} keys`);
      return true;
    } catch (error) {
      log.error(`Cache batch delete failed`, error);
      return false;
    }
  },

  /**
   * 缓存双删策略
   * 先删除缓存，再更新数据库，再延迟删除缓存
   * @param {string} key - 缓存键
   * @param {Function} updateFn - 更新数据库的回调
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Promise<any>} 更新结果
   */
  async doubleDelete(key, updateFn, delay = 500) {
    try {
      // 第一次删除缓存
      await this.del(key);

      // 更新数据库
      const result = await updateFn();

      // 延迟再次删除缓存（防止并发问题）
      setTimeout(async () => {
        await this.del(key);
      }, delay);

      return result;
    } catch (error) {
      log.error(`Cache double delete failed for key: ${key}`, error);
      throw error;
    }
  },

  /**
   * 清除匹配模式的缓存
   * @param {string} pattern - 键模式（如 user:*）
   * @returns {Promise<boolean>} 是否成功
   */
  async clearPattern(pattern) {
    try {
      // 注意：Redis客户端版本不同，scan方法可能有所不同
      // 这里使用兼容的方式
      const client = await redis.getClient(); // 假设redis模块有这个方法
      const keys = [];
      let cursor = '0';

      do {
        const reply = await client.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
        cursor = reply[0];
        keys.push(...reply[1]);
      } while (cursor !== '0');

      if (keys.length > 0) {
        await client.del(keys);
        log.debug(`Cache pattern cleared: ${pattern}, ${keys.length} keys`);
      }

      return true;
    } catch (error) {
      log.error(`Cache clear pattern failed for: ${pattern}`, error);
      return false;
    }
  }
};

/**
 * 缓存键生成器
 */
export const cacheKeys = {
  // 用户相关缓存键
  user(id) {
    return cacheUtil.createKey('user', id);
  },
  
  // 文章相关缓存键
  post(id) {
    return cacheUtil.createKey('post', id);
  },
  posts(page, pageSize) {
    return cacheUtil.createKey('posts', `${page}_${pageSize}`);
  },
  
  // 分类相关缓存键
  category(id) {
    return cacheUtil.createKey('category', id);
  },
  categories() {
    return 'categories:all';
  },
  
  // 标签相关缓存键
  tag(id) {
    return cacheUtil.createKey('tag', id);
  },
  tags() {
    return 'tags:all';
  },
  
  // 设置相关缓存键
  settings() {
    return 'settings:all';
  },
  
  // 验证码相关缓存键
  verification(email, type) {
    return `verification:${type}:${email}`;
  },
  
  // Token黑名单
  tokenBlacklist(token) {
    return `token:blacklist:${token}`;
  }
};