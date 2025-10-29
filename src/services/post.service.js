const database = require('../core/database');
const redis = require('../core/redis');
const { paginationUtil } = require('../utils/pagination');

class PostService {
  /**
   * 获取文章列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {object} filters - 筛选条件
   * @returns {Promise<{list: Array, pagination: object}>}
   */
  static async getPosts(page = 1, pageSize = 10, filters = {}) {
    try {
      const { offset, limit } = paginationUtil.calculatePagination(page, pageSize);
      const params = [];
      let whereClause = 'p.status = 1';
      let joinClause = '';

      // 添加筛选条件
      if (filters.categoryId) {
        joinClause += ' JOIN post_category pc ON p.id = pc.post_id';
        whereClause += ' AND pc.category_id = ?';
        params.push(filters.categoryId);
      }

      if (filters.tagId) {
        joinClause += ' JOIN post_tag pt ON p.id = pt.post_id';
        whereClause += ' AND pt.tag_id = ?';
        params.push(filters.tagId);
      }

      if (filters.search) {
        whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // 查询总数
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as total 
        FROM posts p
        ${joinClause}
        WHERE ${whereClause}
      `;
      const [countResult] = await database.query(countQuery, params);
      const total = countResult[0].total;

      // 查询文章列表
      const query = `
        SELECT 
          p.id, p.title, p.slug, p.excerpt, p.cover, p.view_count, p.like_count,
          c.id as category_id, c.name as category_name,
          u.id as user_id, u.username as user_name, u.avatar as user_avatar,
          p.created_at
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.user_id = u.id
        ${joinClause}
        WHERE ${whereClause}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(limit, offset);
      const [posts] = await database.query(query, params);

      // 获取每个文章的标签
      const postIds = posts.map(post => post.id);
      const tagsQuery = `
        SELECT pt.post_id, t.id, t.name 
        FROM post_tag pt 
        JOIN tags t ON pt.tag_id = t.id 
        WHERE pt.post_id IN (?)`;
      
      const [tagsResult] = await database.query(tagsQuery, [postIds]);
      const tagsMap = {};
      
      tagsResult.forEach(tag => {
        if (!tagsMap[tag.post_id]) {
          tagsMap[tag.post_id] = [];
        }
        tagsMap[tag.post_id].push({ id: tag.id, name: tag.name });
      });

      // 组装结果
      const list = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        cover: post.cover,
        view_count: post.view_count,
        like_count: post.like_count,
        category: post.category_id ? {
          id: post.category_id,
          name: post.category_name
        } : null,
        tags: tagsMap[post.id] || [],
        user: {
          id: post.user_id,
          name: post.user_name,
          avatar: post.user_avatar
        },
        created_at: post.created_at
      }));

      return {
        list,
        pagination: paginationUtil.generatePagination(page, pageSize, total)
      };
    } catch (error) {
      console.error('Get posts error:', error);
      throw new Error('获取文章列表失败');
    }
  }

  /**
   * 获取文章详情
   * @param {string|number} identifier - 文章ID或slug
   * @returns {Promise<object>}
   */
  static async getPostDetail(identifier) {
    try {
      const isSlug = isNaN(identifier);
      const query = `
        SELECT 
          p.id, p.title, p.slug, p.content, p.cover, p.view_count, p.like_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND parent_id IS NULL) as comment_count,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          u.id as user_id, u.username as user_name, u.avatar as user_avatar,
          p.created_at, p.updated_at
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.status = 1 AND ${isSlug ? 'p.slug = ?' : 'p.id = ?'}
      `;
      
      const [posts] = await database.query(query, [identifier]);
      
      if (!posts || posts.length === 0) {
        return null;
      }

      const post = posts[0];

      // 获取文章标签
      const tagsQuery = `
        SELECT t.id, t.name, t.slug 
        FROM post_tag pt 
        JOIN tags t ON pt.tag_id = t.id 
        WHERE pt.post_id = ?`;
      
      const [tags] = await database.query(tagsQuery, [post.id]);

      // 增加浏览量
      await database.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        cover: post.cover,
        view_count: post.view_count + 1, // 返回增加后的值
        like_count: post.like_count,
        comment_count: post.comment_count,
        category: post.category_id ? {
          id: post.category_id,
          name: post.category_name,
          slug: post.category_slug
        } : null,
        tags: tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug
        })),
        user: {
          id: post.user_id,
          name: post.user_name,
          avatar: post.user_avatar
        },
        created_at: post.created_at,
        updated_at: post.updated_at
      };
    } catch (error) {
      console.error('Get post detail error:', error);
      throw new Error('获取文章详情失败');
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
}

module.exports = PostService;