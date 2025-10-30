const { redis } = require('../core/redis');
const CommentRepository = require('../repositories/comment.repository');

class CommentService {
  constructor() {
    this.commentRepository = new CommentRepository();
  }

  /**
   * 获取文章评论列表（支持分页和树形结构）
   * @param {number} postId 文章ID
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   * @param {number|null} userId 当前用户ID（用于判断点赞状态）
   * @returns {Promise<Object>} 评论列表和分页信息
   */
  async getCommentsByPostId(postId, page = 1, pageSize = 20, userId = null) {
    try {
      // 使用repository获取评论列表
      const result = await this.commentRepository.findCommentsByPostId(postId, page, pageSize);
      
      // 构建评论树
      const commentTree = [];
      for (const comment of result.list) {
        // 查询子评论
        const children = await this.getCommentChildren(comment.id, userId);
        
        const commentData = this.formatComment(comment, userId);
        commentData.children = children;
        commentTree.push(commentData);
      }
      
      return {
        list: commentTree,
        count: result.count,
        page,
        pageSize,
        totalPages: result.totalPages
      };
    } catch (error) {
      console.error('获取文章评论失败:', error);
      throw error;
    }
  }

  /**
   * 递归获取评论的子评论
   * @param {number} parentId 父评论ID
   * @param {number|null} userId 当前用户ID
   * @returns {Promise<Array>} 子评论列表
   */
  async getCommentChildren(parentId, userId = null) {
    // 使用repository获取子评论
    const children = await this.commentRepository.findChildrenByParentId(parentId);
    
    // 递归处理子评论
    const formattedChildren = [];
    for (const child of children) {
      const childComments = await this.getCommentChildren(child.id, userId);
      const formattedChild = this.formatComment(child, userId);
      formattedChild.children = childComments;
      formattedChildren.push(formattedChild);
    }
    
    return formattedChildren;
  }

  /**
   * 创建评论
   * @param {Object} commentData 评论数据
   * @param {Object} userInfo 用户信息
   * @param {Object} requestInfo 请求信息
   * @returns {Promise<Object>} 创建的评论
   */
  async createComment(commentData, userInfo, requestInfo = {}) {
    try {
      // 构建评论对象
      const comment = {
        content: commentData.content,
        parent_id: commentData.parent_id || null,
        user_id: userInfo.id,
        post_id: commentData.post_id,
        user_agent: requestInfo.userAgent || null,
        ip_address: requestInfo.ip || null,
        status: 1 // 默认审核通过
      };
      
      // 保存评论
      const savedComment = await this.commentRepository.create(comment);
      
      // 清除缓存
      await this.clearPostCommentsCache(commentData.post_id);
      
      return this.formatComment(savedComment);
    } catch (error) {
      console.error('创建评论失败:', error);
      throw error;
    }
  }

  /**
   * 点赞评论
   * @param {number} commentId 评论ID
   * @param {number} userId 用户ID
   * @returns {Promise<Object>} 更新后的点赞信息
   */
  async likeComment(commentId, userId) {
    try {
      // 使用Redis存储点赞关系
      const likeKey = `comment:like:${commentId}:${userId}`;
      const countKey = `comment:like:count:${commentId}`;
      
      // 检查是否已点赞
      const isLiked = await redis.exists(likeKey);
      if (isLiked) {
        return { like_count: await redis.get(countKey) || 0, is_liked: true };
      }
      
      // 记录点赞
      await redis.setex(likeKey, 7776000, '1'); // 90天过期
      
      // 增加点赞数
      const likeCount = await redis.incr(countKey);
      
      // 更新数据库中的点赞数（异步，不阻塞）
      this.updateCommentLikeCount(commentId, likeCount);
      
      return { like_count: likeCount, is_liked: true };
    } catch (error) {
      console.error('点赞评论失败:', error);
      throw error;
    }
  }

  /**
   * 取消点赞评论
   * @param {number} commentId 评论ID
   * @param {number} userId 用户ID
   * @returns {Promise<Object>} 更新后的点赞信息
   */
  async unlikeComment(commentId, userId) {
    try {
      const likeKey = `comment:like:${commentId}:${userId}`;
      const countKey = `comment:like:count:${commentId}`;
      
      // 检查是否已点赞
      const isLiked = await redis.exists(likeKey);
      if (!isLiked) {
        return { like_count: await redis.get(countKey) || 0, is_liked: false };
      }
      
      // 删除点赞记录
      await redis.del(likeKey);
      
      // 减少点赞数
      const likeCount = Math.max(0, (await redis.decr(countKey)) || 0);
      
      // 更新数据库中的点赞数（异步，不阻塞）
      this.updateCommentLikeCount(commentId, likeCount);
      
      return { like_count: likeCount, is_liked: false };
    } catch (error) {
      console.error('取消点赞失败:', error);
      throw error;
    }
  }

  /**
   * 删除评论
   * @param {number} commentId 评论ID
   * @param {number} userId 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteComment(commentId, userId) {
    try {
      // 查找评论
      const comment = await this.commentRepository.findById(commentId);
      
      if (!comment) {
        throw new Error('评论不存在');
      }
      
      // 检查权限（只能删除自己的评论）
      if (comment.user_id !== userId) {
        throw new Error('无权删除该评论');
      }
      
      // 标记为已删除（软删除）
      await this.commentRepository.update(commentId, { status: 0 });
      
      // 清除相关缓存
      await this.clearPostCommentsCache(comment.post_id);
      
      return true;
    } catch (error) {
      console.error('删除评论失败:', error);
      throw error;
    }
  }

  /**
   * 格式化评论数据
   * @param {Object} comment 原始评论对象
   * @param {number|null} userId 当前用户ID
   * @returns {Object} 格式化后的评论数据
   */
  formatComment(comment, userId = null) {
    return {
      id: comment.id,
      content: comment.content,
      like_count: 0, // 默认点赞数，实际会从Redis获取
      is_liked: false, // 默认未点赞
      user: comment.user ? {
        id: comment.user.id,
        name: comment.user.name,
        avatar: comment.user.avatar || null
      } : null,
      parent_id: comment.parent_id,
      created_at: comment.created_at
    };
  }

  /**
   * 更新评论点赞数
   * @param {number} commentId 评论ID
   * @param {number} likeCount 点赞数
   * @private
   */
  async updateCommentLikeCount(commentId, likeCount) {
    try {
      await this.commentRepository.update(commentId, { like_count: likeCount });
    } catch (error) {
      console.error('更新评论点赞数失败:', error);
    }
  }

  /**
   * 清除文章评论缓存
   * @param {number} postId 文章ID
   * @private
   */
  async clearPostCommentsCache(postId) {
    try {
      // 清除该文章所有评论相关缓存
      const keys = await redis.keys(`comments:post:${postId}:*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('清除评论缓存失败:', error);
    }
  }

  /**
   * 检查评论是否存在
   * @param {number} commentId 评论ID
   * @returns {Promise<Object|null>} 评论对象或null
   */
  async getCommentById(commentId) {
    return await this.commentRepository.findById(commentId);
  }
}

module.exports = CommentService;
