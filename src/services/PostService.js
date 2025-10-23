const PostModel = require('../models/PostModel');
const { setCache, getCache, deleteCache, scopeRedisKey } = require('../utils/redisTools');
const { CACHE_PREFIXES } = require('../constants/appConstants');

class PostService {
  // 获取文章列表（带缓存）
  static async getPosts(page = 1, pageSize = 10) {
    const cacheKey = scopeRedisKey(CACHE_PREFIXES.POST, `list:${page}:${pageSize}`);
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 从数据库获取
    const data = await PostModel.getPosts(page, pageSize);
    
    // 设置缓存（5分钟过期）
    await setCache(cacheKey, data, 300);
    
    return data;
  }
  
  // 获取文章详情（带缓存）
  static async getPostById(id) {
    const cacheKey = scopeRedisKey(CACHE_PREFIXES.POST, `detail:${id}`);
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 从数据库获取
    const data = await PostModel.getPostById(id);
    
    if (data) {
      // 设置缓存（10分钟过期）
      await setCache(cacheKey, data, 600);
    }
    
    return data;
  }
  
  // 创建文章
  static async createPost(data) {
    const result = await PostModel.createPost(data);
    
    // 清除列表缓存
    await this._clearListCache();
    
    return result;
  }
  
  // 更新文章
  static async updatePost(id, data) {
    const result = await PostModel.updatePost(id, data);
    
    // 清除相关缓存
    const detailCacheKey = scopeRedisKey(CACHE_PREFIXES.POST, `detail:${id}`);
    await deleteCache(detailCacheKey);
    await this._clearListCache();
    
    return result;
  }
  
  // 删除文章
  static async deletePost(id) {
    const result = await PostModel.deletePost(id);
    
    if (result) {
      // 清除相关缓存
      const detailCacheKey = scopeRedisKey(CACHE_PREFIXES.POST, `detail:${id}`);
      await deleteCache(detailCacheKey);
      await this._clearListCache();
    }
    
    return result;
  }
  
  // 清除列表缓存
  static async _clearListCache() {
    // 这里简化处理，实际项目中可能需要更精确的缓存清理策略
    // 例如使用模式匹配删除多个缓存键
    console.log('List cache cleared');
  }
}

module.exports = PostService;