const PostRepository = require('../repositories/post.repository');
const TagRepository = require('../repositories/tag.repository');
const { paginationUtil } = require('../utils/pagination');
const { cacheGet, cacheSet, cacheDel } = require('../utils/cache');

class PostService {
  constructor() {
    this.postRepository = new PostRepository();
    this.tagRepository = new TagRepository();
  }
  /**
   * 获取文章列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {object} filters - 筛选条件
   * @returns {Promise<{list: Array, pagination: object}>}
   */
  async getPosts(page = 1, pageSize = 10, filters = {}) {
    try {
      // 尝试从缓存获取
      const cacheKey = `post:list:${page}:${pageSize}:${JSON.stringify(filters)}`;
      const cachedData = await cacheGet(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const { offset, limit } = paginationUtil.calculatePagination(page, pageSize);
      const { list: posts, total } = await this.postRepository.findWithFilters(offset, limit, filters);

      const result = {
        list: posts,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      };

      // 设置缓存（300秒）
      await cacheSet(cacheKey, JSON.stringify(result), 300);

      return result;
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取文章详情
   * @param {number} id - 文章ID
   * @returns {Promise<Object>}
   */
  async getPostById(id) {
    try {
      // 尝试从缓存获取
      const cacheKey = `post:detail:id:${id}`;
      const cachedPost = await cacheGet(cacheKey);
      if (cachedPost) {
        return JSON.parse(cachedPost);
      }

      const post = await this.postRepository.findById(id);
      if (!post) {
        return null;
      }

      const postDetail = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary, // 对应数据库中的summary字段
        content: post.content,
        cover_image: post.cover_image,
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        is_top: post.is_top || 0,
        is_hot: post.view_count > 1000 ? true : false,
        published_at: post.published_at || post.created_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        category: post.category ? {
          id: post.category.id,
          name: post.category.name,
          slug: post.category.slug
        } : null,
        tags: post.tags ? post.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug
        })) : [],
        user: post.user ? {
          id: post.user.id,
          name: post.user.display_name || post.user.username,
          avatar: post.user.avatar
        } : null
      };

      // 设置缓存（10分钟）
      await cacheSet(cacheKey, JSON.stringify(postDetail), 600);

      return postDetail;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门文章
   * @param {number} limit - 返回数量
   * @returns {Promise<Array>}
   */
  async getHotPosts(limit = 5) {
    try {
      // 参数验证
      let parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        parsedLimit = 5;
      }
      
      // 限制最大查询数量
      const finalLimit = Math.min(parsedLimit, 100);
      
      // 缓存键名
      const cacheKey = `hot_posts:limit_${finalLimit}`;
      
      // 尝试从缓存获取
      const cachedData = await cacheGet(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 通过repository获取热门文章
      const posts = await this.postRepository.getHotPosts(finalLimit);
      
      // 格式化数据
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        cover: post.cover_image || null,
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        published_at: post.published_at,
        user: post.user ? {
          id: post.user.id,
          name: post.user.username || '',
          display_name: post.user.display_name  || '',
          avatar: post.user.avatar || ''
        } : null
      }));

      // 设置缓存
      await cacheSet(cacheKey, JSON.stringify(formattedPosts), 3600);

      return formattedPosts;
    } catch (error) {
      console.error('获取热门文章失败:', error);
      throw new Error('获取热门文章失败: ' + error.message);
    }
  }

  /**
   * 点赞文章
   * @param {number} postId - 文章ID
   * @param {number} userId - 用户ID
   * @returns {Promise<{like_count: number, is_liked: boolean}>}
   */
  async likePost(postId, userId) {
    try {
      // 通过repository检查文章是否存在
      const post = await this.postRepository.findByIdWithAllStatus(postId);
      if (!post || post.status !== 'published') {
        throw new Error('文章不存在');
      }

      // 调用repository层的方法处理点赞逻辑
      const result = await this.postRepository.incrementLikeCount(postId);
      
      if (!result) {
        throw new Error('点赞失败');
      }

      // 清除相关缓存
      await cacheDel(`post:detail:id:${postId}`);
      await cacheDel(`post:detail:slug:${post.slug}`);
      
      // 注意：完整的点赞功能需要PostRepository中添加相应方法
      return {
        like_count: post.like_count + 1,
        is_liked: true
      };
    } catch (error) {
      console.error('Like post error:', error);
      throw new Error(error.message || '点赞操作失败');
    }
  }

  /**
   * 获取最新文章
   * @param {number} limit - 返回数量
   * @returns {Promise<Array>}
   */
  async getLatestPosts(limit = 10) {
    try {
      // 缓存键名
      const cacheKey = `latest_posts:limit_${limit}`;
      
      // 尝试从缓存获取
      const cachedData = await cacheGet(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // 通过repository获取最新文章
      const posts = await this.postRepository.getLatestPosts(limit);
      
      // 格式化数据
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        cover: post.cover_image || null,
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        published_at: post.published_at || post.created_at,
        user: post.user ? {
          id: post.user.id,
          name: post.user.nickname || post.user.username || '',
          avatar: post.user.avatar || null
        } : null
      }));

      // 设置缓存
      await cacheSet(cacheKey, JSON.stringify(formattedPosts), 300);

      return formattedPosts;
    } catch (error) {
      console.error('获取最新文章失败:', error);
      throw new Error('获取最新文章失败: ' + error.message);
    }
  }

  /**
   * 获取文章详情（通过slug）
   * @param {string} slug - 文章别名
   * @returns {Promise<Object>}
   */
  async getPostBySlug(slug) {
    try {
      // 尝试从缓存获取
      const cacheKey = `post:detail:slug:${slug}`;
      const cachedPost = await cacheGet(cacheKey);
      if (cachedPost) {
        return JSON.parse(cachedPost);
      }

      const post = await this.postRepository.findBySlug(slug);
      if (!post) {
        return null;
      }

      const postDetail = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary, // 对应数据库中的summary字段
        content: post.content,
        cover_image: post.cover_image,
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        is_top: post.is_top || 0,
        is_hot: post.view_count > 1000 ? true : false,
        published_at: post.published_at || post.created_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        category: post.category ? {
          id: post.category.id,
          name: post.category.name,
          slug: post.category.slug
        } : null,
        tags: post.tags ? post.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug
        })) : [],
        user: post.user ? {
          id: post.user.id,
          name: post.user.nickname || post.user.username,
          avatar: post.user.avatar
        } : null
      };

      // 设置缓存（10分钟）
      await cacheSet(cacheKey, JSON.stringify(postDetail), 600);

      return postDetail;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      throw error;
    }
  }

  /**
   * 增加文章浏览量
   * @param {number} id - 文章ID
   * @returns {Promise<boolean>}
   */
  async incrementViewCount(id) {
    try {
      const success = await this.postRepository.incrementViewCount(id);
      if (success) {
        // 清除缓存
        await cacheDel(`post:detail:id:${id}`);
      }
      return success;
    } catch (error) {
      console.error('增加浏览量失败:', error);
      return false;
    }
  }

  /**
   * 增加文章点赞数
   * @param {number} id - 文章ID
   * @returns {Promise<boolean>}
   */
  async incrementLikeCount(id) {
    try {
      const success = await this.postRepository.incrementLikeCount(id);
      if (success) {
        // 清除缓存
        await cacheDel(`post:detail:id:${id}`);
      }
      return success;
    } catch (error) {
      console.error('增加点赞数失败:', error);
      return false;
    }
  }
}

module.exports = new PostService();