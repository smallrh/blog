const PostRepository = require('../repositories/post.repository');
const TagRepository = require('../repositories/tag.repository');
const redis = require('../core/redis');
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
        list: formattedPosts,
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
        excerpt: post.excerpt,
        content: post.content,
        cover: post.cover,
        view_count: post.view_count,
        like_count: post.like_count,
        is_top: post.is_top,
        is_hot: post.is_hot,
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
          name: post.user.name,
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
  static async getHotPosts(limit = 5) {
    try {
      // 尝试从缓存获取
      const cacheKey = `hot_posts:${limit}`;
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const query = `
        SELECT id, title, slug, cover, view_count 
        FROM posts 
        WHERE status = 1 
        ORDER BY view_count DESC 
        LIMIT ?
      `;
      
      const [posts] = await database.query(query, [limit]);

      // 缓存结果，有效期1小时
      await redis.setex(cacheKey, 3600, JSON.stringify(posts));

      return posts;
    } catch (error) {
      console.error('Get hot posts error:', error);
      throw new Error('获取热门文章失败');
    }
  }

  /**
   * 点赞文章
   * @param {number} postId - 文章ID
   * @param {number} userId - 用户ID
   * @returns {Promise<{like_count: number, is_liked: boolean}>}
   */
  static async likePost(postId, userId) {
    try {
      // 检查文章是否存在
      const [posts] = await database.query('SELECT id, like_count FROM posts WHERE id = ? AND status = 1', [postId]);
      
      if (!posts || posts.length === 0) {
        throw new Error('文章不存在');
      }

      const post = posts[0];
      const cacheKey = `post_likes:${postId}:${userId}`;
      const likeKey = `post_like_count:${postId}`;

      // 检查是否已点赞
      const isLiked = await redis.get(cacheKey);
      
      if (isLiked) {
        // 已点赞，取消点赞
        await redis.del(cacheKey);
        await database.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
        await database.query('UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = ?', [postId]);
        
        // 更新缓存
        await redis.decr(likeKey);
        
        return {
          like_count: Math.max(0, post.like_count - 1),
          is_liked: false
        };
      } else {
        // 未点赞，添加点赞
        await redis.setex(cacheKey, 86400, '1'); // 缓存1天
        await database.query('INSERT IGNORE INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, NOW())', [postId, userId]);
        await database.query('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [postId]);
        
        // 更新缓存
        await redis.incr(likeKey);
        
        return {
          like_count: post.like_count + 1,
          is_liked: true
        };
      }
    } catch (error) {
      console.error('Like post error:', error);
      throw new Error(error.message || '点赞操作失败');
    }
  }

  /**
   * 取消点赞
   * @param {number} postId - 文章ID
   * @param {number} userId - 用户ID
   * @returns {Promise<{like_count: number, is_liked: boolean}>}
   */
  static async unlikePost(postId, userId) {
    try {
      // 检查文章是否存在
      const [posts] = await database.query('SELECT id, like_count FROM posts WHERE id = ? AND status = 1', [postId]);
      
      if (!posts || posts.length === 0) {
        throw new Error('文章不存在');
      }

      const post = posts[0];
      const cacheKey = `post_likes:${postId}:${userId}`;
      const likeKey = `post_like_count:${postId}`;

      // 检查是否已点赞
      const isLiked = await redis.get(cacheKey);
      
      if (isLiked) {
        // 已点赞，取消点赞
        await redis.del(cacheKey);
        await database.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
        await database.query('UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = ?', [postId]);
        
        // 更新缓存
        await redis.decr(likeKey);
      }
      
      // 获取最新的点赞数
      const [updatedPosts] = await database.query('SELECT like_count FROM posts WHERE id = ?', [postId]);
      
      return {
        like_count: updatedPosts[0].like_count,
        is_liked: false
      };
    } catch (error) {
      console.error('Unlike post error:', error);
      throw new Error(error.message || '取消点赞操作失败');
    }
  }

  /**
   * 收藏文章
   * @param {number} postId - 文章ID
   * @param {number} userId - 用户ID
   * @returns {Promise<{is_collected: boolean}>}
   */
  static async collectPost(postId, userId) {
    try {
      // 检查文章是否存在
      const [posts] = await database.query('SELECT id FROM posts WHERE id = ? AND status = 1', [postId]);
      
      if (!posts || posts.length === 0) {
        throw new Error('文章不存在');
      }

      // 检查是否已收藏
      const [collections] = await database.query(
        'SELECT id FROM post_collections WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      
      if (collections && collections.length > 0) {
        // 已收藏，取消收藏
        await database.query(
          'DELETE FROM post_collections WHERE post_id = ? AND user_id = ?',
          [postId, userId]
        );
        
        return {
          is_collected: false
        };
      } else {
        // 未收藏，添加收藏
        await database.query(
          'INSERT INTO post_collections (post_id, user_id, created_at) VALUES (?, ?, NOW())',
          [postId, userId]
        );
        
        return {
          is_collected: true
        };
      }
    } catch (error) {
      console.error('Collect post error:', error);
      throw new Error(error.message || '收藏操作失败');
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
        excerpt: post.excerpt,
        content: post.content,
        cover: post.cover,
        view_count: post.view_count,
        like_count: post.like_count,
        is_top: post.is_top,
        is_hot: post.is_hot,
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
          name: post.user.name,
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

module.exports = PostService;