const CategoryRepository = require('../repositories/category.repository');
const { redis } = require('../core/redis');
const { config } = require('../core/config');
const { cacheGet, cacheSet, cacheDel } = require('../utils/cache');

class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * 获取分类树
   * @returns {Promise<Array>} 分类树数组
   */
  async getCategoryTree() {
    try {
      // 尝试从缓存获取
      const cacheKey = 'category:tree';
      const cachedData = await cacheGet(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // 获取所有分类
      const categories = await this.categoryRepository.findAllForTree();

      // 构建分类树
      const tree = this._buildCategoryTree(categories);

      // 设置缓存（10分钟）
      await cacheSet(cacheKey, JSON.stringify(tree), 600);

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
      // 尝试从缓存获取
      const cacheKey = `category:list:${parent_id || 'all'}:${page}:${pageSize}`;
      const cachedData = await cacheGet(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // 计算分页
      const skip = (page - 1) * pageSize;
      const { list: categories, count } = await this.categoryRepository.findWithPagination({
        parent_id,
        skip,
        take: pageSize
      });

      const result = {
        list: categories,
        count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      };

      // 设置缓存（5分钟）
      await cacheSet(cacheKey, JSON.stringify(result), 300);

      return result;
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
      const cachedData = await cacheGet(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const category = await this.categoryRepository.findBySlug(slug);

      if (category) {
        // 设置缓存（5分钟）
        await cacheSet(cacheKey, JSON.stringify(category), 300);
      }

      return category;
    } catch (error) {
      console.error('通过slug获取分类详情失败:', error);
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
      const cachedData = await cacheGet(cacheKey);
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
      await cacheSet(cacheKey, JSON.stringify(result), 300);

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
   * 创建分类
   * @param {Object} categoryData 分类数据
   * @returns {Promise<Object>} 创建的分类
   */
  async createCategory(categoryData) {
    try {
      // 检查slug是否已存在
      const existingCategory = await this.categoryRepository.findBySlug(categoryData.slug);
      
      if (existingCategory) {
        throw new Error('分类别名已存在');
      }
      
      // 创建分类
      const category = {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || '',
        parent_id: categoryData.parent_id || null,
        sort_order: categoryData.sort_order || 0,
        status: categoryData.status !== undefined ? categoryData.status : 1
      };
      
      const createdCategory = await this.categoryRepository.create(category);
      
      // 清除缓存
      await this.clearCache();
      
      return createdCategory;
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  }

  /**
   * 更新分类
   * @param {number} id 分类ID
   * @param {Object} categoryData 分类数据
   * @returns {Promise<Object>} 更新后的分类
   */
  async updateCategory(id, categoryData) {
    try {
      // 检查分类是否存在
      const category = await this.categoryRepository.findById(id);
      
      if (!category) {
        throw new Error('分类不存在');
      }
      
      // 检查slug是否与其他分类重复
      if (categoryData.slug && categoryData.slug !== category.slug) {
        const existingCategory = await this.categoryRepository.findBySlug(categoryData.slug);
        
        if (existingCategory) {
          throw new Error('分类别名已存在');
        }
      }
      
      // 更新分类
      const updatedCategory = await this.categoryRepository.update(id, categoryData);
      
      // 清除缓存
      await this.clearCache();
      
      return updatedCategory;
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  }

  /**
   * 清除分类相关缓存
   * @param {string} type 缓存类型
   * @param {string} key 缓存键
   */
  async clearCache(type = 'all', key = '') {
    try {
      if (type === 'slug') {
        // 清除特定slug的分类缓存
        await cacheDel(`category:slug:${key}`);
      } else if (type === 'id') {
        // 清除特定ID的分类缓存
        await cacheDel(`category:id:${key}`);
      } else {
        // 清除所有分类缓存
        // 由于redisTools.js中没有cacheDelPattern方法，这里简单实现清除几个关键缓存
        // 直接使用redis实例删除所有匹配的键
         const keys = await redis.keys('category:*');
         if (keys.length > 0) {
           await redis.del(keys);
         }
      }
    } catch (error) {
      console.error('清除分类缓存失败:', error);
    }
  }
  
  /**
   * 删除分类
   * @param {number} id 分类ID
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    try {
      // 检查分类是否存在
      const category = await this.categoryRepository.findById(id);
      
      if (!category) {
        throw new Error('分类不存在');
      }
      
      // 检查是否有子分类
      const hasChildren = await this.categoryRepository.hasChildren(id);
      
      if (hasChildren) {
        throw new Error('该分类下有子分类，无法删除');
      }
      
      // 检查是否有文章
      if (category.post_count > 0) {
        throw new Error('该分类下有文章，无法删除');
      }
      
      // 删除分类
      await this.categoryRepository.delete(id);
      
      // 清除缓存
      await this.clearCache();
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  }
}

module.exports = CategoryService;
