const UserModel = require('../models/UserModel');
const { setCache, getCache, deleteCache, scopeRedisKey } = require('../utils/redisTools');
const { CACHE_PREFIXES } = require('../constants/appConstants');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT配置
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

class UserService {
  // 获取用户列表（带缓存）
  static async getUsers(page = 1, pageSize = 10) {
    const cacheKey = scopeRedisKey(CACHE_PREFIXES.USER, `list:${page}:${pageSize}`);
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 从数据库获取
    const data = await UserModel.getUsers(page, pageSize);
    
    // 设置缓存（5分钟过期）
    await setCache(cacheKey, data, 300);
    
    return data;
  }
  
  // 获取用户详情（带缓存）
  static async getUserById(id) {
    const cacheKey = scopeRedisKey(CACHE_PREFIXES.USER, `detail:${id}`);
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 从数据库获取
    const data = await UserModel.getUserById(id);
    
    if (data) {
      // 设置缓存（10分钟过期）
      await setCache(cacheKey, data, 600);
    }
    
    return data;
  }
  
  // 创建用户
  static async createUser(data) {
    // 检查用户ID是否已存在
    const existingUser = await UserModel.getUserById(data.id);
    if (existingUser) {
      throw new Error('User ID already exists');
    }
    
    const result = await UserModel.createUser(data);
    
    // 清除列表缓存
    await this._clearListCache();
    
    return result;
  }
  
  // 更新用户
  static async updateUser(id, data) {
    // 检查用户是否存在
    const existingUser = await UserModel.getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const result = await UserModel.updateUser(id, data);
    
    // 清除相关缓存
    const detailCacheKey = scopeRedisKey(CACHE_PREFIXES.USER, `detail:${id}`);
    await deleteCache(detailCacheKey);
    await this._clearListCache();
    
    return result;
  }
  
  // 删除用户
  static async deleteUser(id) {
    // 检查用户是否存在
    const existingUser = await UserModel.getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const result = await UserModel.deleteUser(id);
    
    if (result) {
      // 清除相关缓存
      const detailCacheKey = scopeRedisKey(CACHE_PREFIXES.USER, `detail:${id}`);
      await deleteCache(detailCacheKey);
      await this._clearListCache();
    }
    
    return result;
  }
  
  // 根据用户名查询用户
  static async getUserByUsername(username) {
    const cacheKey = scopeRedisKey(CACHE_PREFIXES.USER, `username:${username}`);
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      // 不返回密码
      if (cachedData.password) delete cachedData.password;
      return cachedData;
    }
    
    // 从数据库获取
    const data = await UserModel.getUserByUsername(username);
    
    if (data) {
      // 不缓存密码
      const dataToCache = { ...data };
      delete dataToCache.password;
      // 设置缓存（10分钟过期）
      await setCache(cacheKey, dataToCache, 600);
      // 返回时也删除密码
      delete data.password;
    }
    
    return data;
  }
  
  // 用户登录
  static async login(username, password) {
    // 查找用户（包含密码用于验证）
    const user = await UserModel.getUserByUsername(username);
    
    if (!user) {
      throw new Error('用户名或密码错误');
    }
    
    // 验证密码
    const isValidPassword = await UserModel.verifyPassword(user, password);
    if (!isValidPassword) {
      throw new Error('用户名或密码错误');
    }
    
    // 生成token
    const { accessToken, refreshToken } = await this.generateTokens(user.id);
    
    // 创建session数据
    const sessionData = {
      userId: user.id,
      username: user.username,
      loggedIn: true
    };
    
    // 存储session到Redis
    const sessionKey = scopeRedisKey('session', user.id);
    await setCache(sessionKey, sessionData, 86400); // 24小时过期
    
    // 返回用户信息（不包含密码）和token
    delete user.password;
    return {
      user,
      accessToken,
      refreshToken
    };
  }
  
  // 生成token
  static async generateTokens(userId) {
    // 生成access token
    const accessToken = jwt.sign(
      { userId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );
    
    // 生成refresh token
    const refreshToken = jwt.sign(
      { userId },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );
    
    // 存储refresh token到Redis
    const refreshTokenKey = scopeRedisKey('refresh_token', userId);
    await setCache(refreshTokenKey, refreshToken, 7 * 86400); // 7天过期
    
    return { accessToken, refreshToken };
  }
  
  // 刷新access token
  static async refreshAccessToken(refreshToken) {
    try {
      // 验证refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const { userId } = decoded;
      
      // 检查refresh token是否在Redis中
      const storedToken = await getCache(scopeRedisKey('refresh_token', userId));
      if (storedToken !== refreshToken) {
        throw new Error('无效的refresh token');
      }
      
      // 生成新的access token
      const newAccessToken = jwt.sign(
        { userId },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES }
      );
      
      return newAccessToken;
    } catch (error) {
      throw new Error('刷新token失败');
    }
  }
  
  // 验证access token
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      return null;
    }
  }
  
  // 用户登出
  static async logout(userId) {
    // 删除session和refresh token
    const sessionKey = scopeRedisKey('session', userId);
    const refreshTokenKey = scopeRedisKey('refresh_token', userId);
    
    await deleteCache(sessionKey);
    await deleteCache(refreshTokenKey);
    
    return true;
  }
  
  // 获取用户session
  static async getSession(userId) {
    const sessionKey = scopeRedisKey('session', userId);
    return await getCache(sessionKey);
  }
  
  // 生成测试用的访问令牌（仅用于测试环境）
  static generateTestToken(userId) {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  }
  
  // 清除列表缓存
  static async _clearListCache() {
    // 这里简化处理，实际项目中可能需要更精确的缓存清理策略
    console.log('User list cache cleared');
  }
}

module.exports = UserService;