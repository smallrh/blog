const { describe, it } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');

// 从auth模块导入loadToken函数
const { loadToken } = require('./test_auth');

// 测试配置
const BASE_URL = 'http://localhost:9000/api';

// 确保axios能处理JSON响应
axios.defaults.headers.common['Content-Type'] = 'application/json';

describe('Tag Module Tests', () => {
  let testTagSlug = null;
  let testTagName = null;
  let testTagId = null;
  
  describe('获取标签列表 - 基础功能', () => {
    it('should get tags list with pagination', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/tags?page=1&pageSize=50`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      assert.ok(response.data.data, 'Data should exist');
      assert.ok(Number.isInteger(response.data.data.count), 'Count should be a number');
      assert.ok(Array.isArray(response.data.data.list), 'List should be an array');
      
      // 验证分页信息
      assert.ok(response.data.page, 'Page info should exist');
      assert.strictEqual(response.data.page.current, 1);
      assert.strictEqual(response.data.page.pageSize, 50);
      assert.ok(Number.isInteger(response.data.page.total));
      assert.ok(Number.isInteger(response.data.page.totalPages));
      
      // 保存第一个标签的信息用于后续测试
      if (response.data.data.list.length > 0) {
        const firstTag = response.data.data.list[0];
        testTagSlug = firstTag.slug;
        testTagName = firstTag.name;
        testTagId = firstTag.id;
        console.log(`保存标签信息: ${testTagName} (${testTagSlug}, ID: ${testTagId})`);
      }
      
      console.log(`标签列表测试通过，共 ${response.data.data.count} 个标签`);
    });
  });
  
  describe('获取标签列表 - 热门筛选', () => {
    it('should get hot tags using hot parameter', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/tags?hot=true&page=1&pageSize=50`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      assert.ok(response.data.data, 'Data should exist');
      assert.ok(Array.isArray(response.data.data.list), 'List should be an array');
      
      console.log(`热门标签筛选测试通过，返回 ${response.data.data.list.length} 个热门标签`);
    });
  });
  
  describe('获取热门标签 - 独立接口', () => {
    it('should get hot tags with default limit', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/tags/hot`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      assert.ok(response.data.data, 'Data should exist');
      assert.ok(Array.isArray(response.data.data.list), 'List should be an array');
      
      console.log(`热门标签默认限制测试通过，返回 ${response.data.data.list.length} 个热门标签`);
    });
    
    it('should get hot tags with custom limit', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/tags/hot?limit=5`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      assert.ok(response.data.data, 'Data should exist');
      assert.ok(Array.isArray(response.data.data.list), 'List should be an array');
      
      console.log(`热门标签自定义限制测试通过，返回 ${response.data.data.list.length} 个热门标签`);
    });
  });
  
  describe('获取标签详情', () => {
    it('should get tag detail by slug', async () => {
      if (!testTagSlug) {
        console.warn('跳过标签详情测试：未找到标签样本');
        return;
      }
      
      // 获取标签详情
      const response = await axios.get(`${BASE_URL}/frontend/tags/${testTagSlug}`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      const tagData = response.data.data;
      assert.ok(tagData, 'Tag data should exist');
      assert.ok(tagData.id, 'Tag should have id');
      assert.ok(tagData.name, 'Tag should have name');
      assert.ok(tagData.slug, 'Tag should have slug');
      assert.ok(Number.isInteger(tagData.post_count), 'Tag should have post_count');
      assert.ok(tagData.created_at, 'Tag should have created_at');
      
      console.log(`标签详情测试通过，标签名: ${tagData.name}`);
    });
  });
  
  describe('获取标签下的文章', () => {
    it('should get posts under a tag', async () => {
      if (!testTagSlug) {
        console.warn('跳过标签下文章测试：未找到标签样本');
        return;
      }
      
      // 使用文章列表接口，通过tag_id筛选
      const response = await axios.get(`${BASE_URL}/frontend/posts?tag_id=${testTagId}&page=1&pageSize=10`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      assert.ok(response.data.data, 'Data should exist');
      assert.ok(Array.isArray(response.data.data.list), 'List should be an array');
      assert.ok(response.data.page, 'Page info should exist');
      
      console.log(`标签下文章测试通过，标签: ${testTagName}，找到 ${response.data.data.count} 篇文章`);
    });
  });
});
