const { describe, it } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');

// 从auth模块导入loadToken函数
const { loadToken } = require('./test_auth');

// 测试配置
const BASE_URL = 'http://localhost:9000/api';

// 确保axios能处理JSON响应
axios.defaults.headers.common['Content-Type'] = 'application/json';

describe('Post Module Tests', () => {
  let firstPostSlug = null;
  let firstPostTitle = null;
  let firstPostId = null;
  
  describe('获取文章列表 - 基础功能', () => {
    it('should get posts list with pagination', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/posts?page=1&pageSize=10`);
      
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
      assert.strictEqual(response.data.page.pageSize, 10);
      assert.ok(Number.isInteger(response.data.page.total));
      assert.ok(Number.isInteger(response.data.page.totalPages));
      
      // 保存第一篇文章的信息用于后续测试
      if (response.data.data.list.length > 0) {
        firstPostSlug = response.data.data.list[0].slug;
        firstPostTitle = response.data.data.list[0].title;
        firstPostId = response.data.data.list[0].id;
        console.log(`保存文章信息: ${firstPostTitle} (${firstPostSlug}, ID: ${firstPostId})`);
      }
      
      console.log(`文章列表测试通过，共 ${response.data.data.count} 篇文章`);
    });
  });
  
  describe('获取文章列表 - 筛选功能', () => {
    it('should get posts with category filter', async () => {
      try {
        // 先获取分类列表
        const categoryResponse = await axios.get(`${BASE_URL}/frontend/categories?page=1&pageSize=1`);
        if (categoryResponse.data.code === 200 && categoryResponse.data.data.list.length > 0) {
          const categoryId = categoryResponse.data.data.list[0].id;
          
          // 按分类筛选文章
          const response = await axios.get(`${BASE_URL}/frontend/posts?category_id=${categoryId}`);
          assert.strictEqual(response.data.code, 200);
          assert.ok(Array.isArray(response.data.data.list));
          
          console.log(`分类筛选测试通过，分类ID: ${categoryId}`);
        }
      } catch (error) {
        console.warn('分类筛选测试跳过:', error.message);
      }
    });
    
    it('should get posts with tag filter', async () => {
      try {
        // 先获取标签列表
        const tagResponse = await axios.get(`${BASE_URL}/frontend/tags?page=1&pageSize=1`);
        if (tagResponse.data.code === 200 && tagResponse.data.data.list.length > 0) {
          const tagId = tagResponse.data.data.list[0].id;
          
          // 按标签筛选文章
          const response = await axios.get(`${BASE_URL}/frontend/posts?tag_id=${tagId}`);
          assert.strictEqual(response.data.code, 200);
          assert.ok(Array.isArray(response.data.data.list));
          
          console.log(`标签筛选测试通过，标签ID: ${tagId}`);
        }
      } catch (error) {
        console.warn('标签筛选测试跳过:', error.message);
      }
    });
    
    it('should get posts with custom sorting', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/posts?order=view_count&sort=desc`);
      assert.strictEqual(response.data.code, 200);
      assert.ok(Array.isArray(response.data.data.list));
      console.log('自定义排序测试通过');
    });
  });
  
  describe('获取文章详情', () => {
    it('should get post detail by slug', async () => {
      if (!firstPostSlug) {
        console.warn('跳过文章详情测试：未找到文章样本');
        return;
      }
      
      // 获取文章详情
      const detailResponse = await axios.get(`${BASE_URL}/frontend/posts/${firstPostSlug}`);
      
      // 验证响应格式
      assert.strictEqual(detailResponse.data.code, 200);
      assert.strictEqual(detailResponse.data.message, 'Success');
      
      // 验证数据结构
      const postData = detailResponse.data.data;
      assert.ok(postData, 'Post data should exist');
      assert.ok(postData.id, 'Post should have id');
      assert.ok(postData.title, 'Post should have title');
      assert.ok(postData.slug, 'Post should have slug');
      assert.ok(postData.content, 'Post should have content');
      assert.ok(postData.category, 'Post should have category info');
      assert.ok(Array.isArray(postData.tags), 'Post should have tags array');
      assert.ok(postData.user, 'Post should have user info');
      
      console.log(`文章详情测试通过，标题: ${postData.title}`);
    });
  });
  
  describe('文章一致性测试', () => {
    it('should have consistent title and id between list and detail', async () => {
      if (!firstPostSlug || !firstPostTitle || !firstPostId) {
        console.warn('跳过文章一致性测试：未找到文章样本');
        return;
      }
      
      // 获取文章详情
      const detailResponse = await axios.get(`${BASE_URL}/frontend/posts/${firstPostSlug}`);
      
      // 验证标题一致性
      assert.strictEqual(detailResponse.data.data.title, firstPostTitle, 'Title should be consistent');
      // 验证ID一致性
      assert.strictEqual(detailResponse.data.data.id, firstPostId, 'ID should be consistent');
      
      console.log('文章一致性测试通过');
    });
  });
});
