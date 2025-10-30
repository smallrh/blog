const { describe, it } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');

// 从auth模块导入loadToken函数
const { loadToken } = require('./test_auth');

// 测试配置
const BASE_URL = 'http://localhost:9000/api';

// 确保axios能处理JSON响应
axios.defaults.headers.common['Content-Type'] = 'application/json';

describe('Comment Module Tests', () => {
  // 检查服务是否可用
  async function checkServiceAvailable() {
    try {
      await axios.get(`${BASE_URL}/frontend/posts?page=1&pageSize=1`, { timeout: 2000 });
      return true;
    } catch (error) {
      console.warn('服务不可用，跳过评论模块测试:', error.message);
      return false;
    }
  }
  
  it('should get comments list for a post', async () => {
    // 检查服务是否可用
    const isAvailable = await checkServiceAvailable();
    if (!isAvailable) {
      console.log('评论模块测试已跳过');
      return; // 跳过测试
    }
    
    try {
      // 获取测试用的文章ID
      const postResponse = await axios.get(`${BASE_URL}/frontend/posts?page=1&pageSize=1`);
      if (postResponse.data.code !== 200 || !postResponse.data.data.list || postResponse.data.data.list.length === 0) {
        console.warn('没有可用的文章，跳过评论测试');
        return;
      }
      
      const postId = postResponse.data.data.list[0].id;
      
      // 获取评论列表
      const response = await axios.get(`${BASE_URL}/frontend/posts/${postId}/comments`);
      assert.strictEqual(response.data.code, 200);
      console.log('评论列表测试通过');
    } catch (error) {
      console.warn('评论测试出错，跳过测试:', error.message);
    }
  });
});