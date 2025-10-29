const { getRepository } = require('typeorm');
const CategoryEntity = require('../models/category.entity');
const PostEntity = require('../models/post.entity');
const { redis } = require('../core/redis');
const { config } = require('../core/config');

class CategoryService {
  constructor() {
    // 暂时不在构造函数中获取仓库，避免连接问题
  }
  
  // 获取分类仓库
  getCategoryRepository() {
    return getRepository(CategoryEntity);
  }
  
  // 获取文章仓库
  getPostRepository() {
    return getRepository(PostEntity);
  }

  /**
   * 获取分类树
   * @returns {Promise<Array>} 分类树数组
   */
  async getCategoryTree() {
    try {
      // 尝试从缓存获取
      const cacheKey = 'category:tree';
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // 获取所有分类
      const categories = await this.getCategoryRepository().find({
        where: { status: 1 },
        order: { sort_order: 'ASC', created_at: 'DESC' }
      });

      // 构建分类树
      const tree = this._buildCategoryTree(categories);

      // 设置缓存（10分钟）
      await redis.setex(cacheKey, 600, JSON.stringify(tree));

      return tree;
    } catch (error) {
      console.error('获取分类树失败:', error);
      throw error;
    }
  }

  /**
   * 获取分类列表
   * @param {Object} params 查询参数
   * @param {number|null} params.parent_id 父分类ID
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   * @returns {Promise<Object>} 包含分类列表和分页信息的对象
   */
  async getCategories({ parent_id = null, page = 1, pageSize = 20 }) {
    try {
      // 构建查询条件
      const where = { status: 1 };
      if (parent_id !== null) {
        where.parent_id = parent_id;
      }

      // 查询总数
      const count = await this.getCategoryRepository().count({ where });
      
      // 计算分页
      const skip = (page - 1) * pageSize;
      const categories = await this.getCategoryRepository().find({
        where,
        skip,
        take: pageSize,
        order: { sort_order: 'ASC', created_at: 'DESC' }
      });

      return {
        list: categories,
        count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      };
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  }

  /**
   * 通过slug获取分类详情
   * @param {string} slug 分类别名
   * @returns {Promise<Object|null>} 分类详情或null
   */
  async getCategoryBySlug(slug) {
    try {
      // 尝试从缓存获取
      const cacheKey = `category:slug:${slug}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const category = await this.getCategoryRepository().findOne({
        where: { slug, status: 1 }
      });

      if (category) {
        // 设置缓存（10分钟）
        await redis.setex(cacheKey, 600, JSON.stringify(category));
      }

      return category;
    } catch (error) {
      console.error('通过slug获取分类失败:', error);
      throw error;
    }
  }

  /**
   * 获取分类下的文章列表
   * @param {string} slug 分类别名
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<Object>} 包含文章列表和分类信息的对象
   */
  async getPostsByCategory(slug, page = 1, pageSize = 10) {
    try {
      // 获取分类信息
      const category = await this.getCategoryBySlug(slug);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 构建缓存键
      const cacheKey = `category:posts:${slug}:${page}:${pageSize}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return {
          ...JSON.parse(cachedData),
          category: { id: category.id, name: category.name, slug: category.slug }
        };
      }

      // 计算分页
      const skip = (page - 1) * pageSize;

      // 查询文章数量
      const count = await this.getPostRepository().count({
        where: { category_id: category.id, status: 1 }
      });

      // 查询文章列表
      const posts = await this.getPostRepository().find({
        where: { category_id: category.id, status: 1 },
        skip,
        take: pageSize,
        order: { created_at: 'DESC' },
        relations: ['user']
      });

      // 格式化文章数据
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        cover: post.cover_image,
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        user: post.user ? {
          id: post.user.id,
          name: post.user.name,
          avatar: post.user.avatar
        } : null,
        created_at: post.created_at
      }));

      const result = {
        list: formattedPosts,
        count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      };

      // 设置缓存（5分钟）
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return {
        ...result,
        category: { id: category.id, name: category.name, slug: category.slug }
      };
    } catch (error) {
      console.error('获取分类文章失败:', error);
      throw error;
    }
  }

  /**
   * 构建分类树结构
   * @param {Array} categories 分类列表
   * @returns {Array} 分类树
   * @private
   */
  _buildCategoryTree(categories) {
    const map = new Map();
    const roots = [];

    // 创建ID到分类对象的映射
    categories.forEach(category => {
      map.set(category.id, { ...category, children: [] });
    });

    // 构建树结构
    categories.forEach(category => {
      const node = map.get(category.id);
      if (category.parent_id === null || category.parent_id === 0) {
        // 根分类
        roots.push(node);
      } else {
        // 子分类
        const parent = map.get(category.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return roots;
  }

  /**
   * 清除分类相关缓存
   * @param {string} type 缓存类型
   * @param {string} key 缓存键
   */
  async clearCache(type = 'all', key = '') {
    try {
      if (type === 'all') {
        // 清除所有分类相关缓存
        const keys = await redis.keys('category:*');
        if (keys.length > 0) {
          await redis.del(keys);
        }
      } else {
        // 清除特定缓存
        await redis.del(`category:${type}:${key}`);
      }
    } catch (error) {
      console.error('清除分类缓存失败:', error);
    }
  }
}

module.exports = CategoryService;
