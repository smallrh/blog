const { describe, it } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');

// 从auth模块导入loadToken函数
const { loadToken } = require('./test_auth');

// 测试配置
const BASE_URL = 'http://localhost:9000/api';

// 确保axios能处理JSON响应
axios.defaults.headers.common['Content-Type'] = 'application/json';

describe('Category Module Tests', () => {
  let testCategorySlug = null;
  let testCategoryName = null;
  let testCategoryId = null;
  
  describe('获取分类树', () => {
    it('should get category tree with hierarchical structure', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/categories/tree`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      assert.ok(response.data.data, 'Data should exist');
      assert.ok(Array.isArray(response.data.data.list), 'Category tree should be an array');
      
      console.log(`分类树测试通过，返回 ${response.data.data.list.length} 个根分类`);
    });
  });
  
  describe('获取分类列表 - 基础功能', () => {
    it('should get categories list with pagination', async () => {
      const response = await axios.get(`${BASE_URL}/frontend/categories?page=1&pageSize=50`);
      
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
      
      // 保存第一个分类的信息用于后续测试
      if (response.data.data.list.length > 0) {
        const firstCategory = response.data.data.list[0];
        testCategorySlug = firstCategory.slug;
        testCategoryName = firstCategory.name;
        testCategoryId = firstCategory.id;
        console.log(`保存分类信息: ${testCategoryName} (${testCategorySlug}, ID: ${testCategoryId})`);
      }
      
      console.log(`分类列表测试通过，共 ${response.data.data.count} 个分类`);
    });
  });
  
  describe('获取分类列表 - 父级筛选', () => {
    it('should get categories with parent filter', async () => {
      // 先获取分类树找到父分类
      const treeResponse = await axios.get(`${BASE_URL}/frontend/categories/tree`);
      
      if (treeResponse.data.data.list.length > 0) {
        const firstCategory = treeResponse.data.data.list[0];
        
        // 使用父分类ID进行筛选
        const response = await axios.get(`${BASE_URL}/frontend/categories?parent_id=${firstCategory.id}&page=1&pageSize=50`);
        
        // 验证响应格式
        assert.strictEqual(response.data.code, 200);
        assert.strictEqual(response.data.message, 'Success');
        
        console.log(`父级筛选测试通过，父分类 ${firstCategory.name} 下找到 ${response.data.data.count} 个子分类`);
      }
    });
  });
  
  describe('获取分类详情', () => {
    it('should get category detail by slug', async () => {
      if (!testCategorySlug) {
        console.warn('跳过分类详情测试：未找到分类样本');
        return;
      }
      
      // 获取分类详情
      const response = await axios.get(`${BASE_URL}/frontend/categories/${testCategorySlug}`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      const categoryData = response.data.data;
      assert.ok(categoryData, 'Category data should exist');
      assert.ok(categoryData.id, 'Category should have id');
      assert.ok(categoryData.name, 'Category should have name');
      assert.ok(categoryData.slug, 'Category should have slug');
      assert.ok(Number.isInteger(categoryData.post_count), 'Category should have post_count');
      assert.ok(categoryData.created_at, 'Category should have created_at');
      
      console.log(`分类详情测试通过，分类名: ${categoryData.name}`);
    });
  });
  
  describe('获取分类下的文章', () => {
    it('should get posts under a category', async () => {
      if (!testCategoryId) {
        console.warn('跳过分类下文章测试：未找到分类样本');
        return;
      }
      
      // 使用文章列表接口，通过category_id筛选
      const response = await axios.get(`${BASE_URL}/frontend/posts?category_id=${testCategoryId}&page=1&pageSize=10`);
      
      // 验证响应格式
      assert.strictEqual(response.data.code, 200);
      assert.strictEqual(response.data.message, 'Success');
      
      // 验证数据结构
      assert.ok(response.data.data, 'Data should exist');
      assert.ok(Array.isArray(response.data.data.list), 'List should be an array');
      assert.ok(response.data.page, 'Page info should exist');
      
      console.log(`分类下文章测试通过，分类: ${testCategoryName}，找到 ${response.data.data.count} 篇文章`);
    });
  });
});

