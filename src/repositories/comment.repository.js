const { AppDataSource } = require('../core/database');
const CommentEntity = require('../models/comment.entity');

/**
 * 评论数据访问层
 */
class CommentRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(CommentEntity);
  }

  /**
   * 获取文章的顶级评论列表（支持分页）
   * @param {number} postId - 文章ID
   * @param {number} skip - 偏移量
   * @param {number} take - 限制数量
   * @returns {Promise<{list: Array, count: number}>}
   */
  async findTopCommentsByPostId(postId, skip = 0, take = 20) {
    // 查询总数
    const count = await this.repo.count({
      where: { post_id: postId, parent_id: null, status: 1 }
    });
    
    // 查询评论列表
    const comments = await this.repo.find({
      where: { post_id: postId, parent_id: null, status: 1 },
      skip,
      take,
      order: { created_at: 'DESC' },
      relations: ['user']
    });

    return { list: comments, count };
  }

  /**
   * 获取评论的子评论
   * @param {number} parentId - 父评论ID
   * @returns {Promise<Array>}
   */
  async findChildrenByParentId(parentId) {
    return this.repo.find({
      where: { parent_id: parentId, status: 1 },
      order: { created_at: 'ASC' },
      relations: ['user']
    });
  }

  /**
   * 通过ID获取评论
   * @param {number} id - 评论ID
   * @returns {Promise<CommentEntity|null>}
   */
  async findById(id) {
    return this.repo.findOne({
      where: { id },
      relations: ['user']
    });
  }

  /**
   * 创建评论
   * @param {object} data - 评论数据
   * @returns {Promise<CommentEntity>}
   */
  async create(data) {
    const comment = this.repo.create(data);
    return this.repo.save(comment);
  }

  /**
   * 更新评论
   * @param {number} id - 评论ID
   * @param {object} data - 更新数据
   * @returns {Promise<CommentEntity|null>}
   */
  async update(id, data) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  /**
   * 删除评论
   * @param {number} id - 评论ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await this.repo.delete({ id });
    return result.affected > 0;
  }

  /**
   * 软删除评论（更新状态）
   * @param {number} id - 评论ID
   * @returns {Promise<boolean>}
   */
  async softDelete(id) {
    const result = await this.repo.update({ id }, { status: 0 });
    return result.affected > 0;
  }

  /**
   * 更新评论状态
   * @param {number} id - 评论ID
   * @param {number} status - 状态值
   * @returns {Promise<boolean>}
   */
  async updateStatus(id, status) {
    const result = await this.repo.update({ id }, { status });
    return result.affected > 0;
  }

  /**
   * 增加点赞数
   * @param {number} id - 评论ID
   * @returns {Promise<boolean>}
   */
  async incrementLikeCount(id) {
    const result = await this.repo.increment({ id }, 'like_count', 1);
    return result.affected > 0;
  }

  /**
   * 减少点赞数
   * @param {number} id - 评论ID
   * @returns {Promise<boolean>}
   */
  async decrementLikeCount(id) {
    const result = await this.repo.increment({ id }, 'like_count', -1);
    return result.affected > 0;
  }

  /**
   * 获取用户的评论列表
   * @param {number} userId - 用户ID
   * @param {number} skip - 偏移量
   * @param {number} take - 限制数量
   * @returns {Promise<{list: Array, count: number}>}
   */
  async findCommentsByUserId(userId, skip = 0, take = 20) {
    // 查询总数
    const count = await this.repo.count({
      where: { user_id: userId, status: 1 }
    });
    
    // 查询评论列表
    const comments = await this.repo.find({
      where: { user_id: userId, status: 1 },
      skip,
      take,
      order: { created_at: 'DESC' },
      relations: ['post']
    });

    return { list: comments, count };
  }

  /**
   * 统计文章的评论数量
   * @param {number} postId - 文章ID
   * @returns {Promise<number>}
   */
  async countCommentsByPostId(postId) {
    return this.repo.count({
      where: { post_id: postId, status: 1 }
    });
  }

  /**
   * 检查评论是否属于用户
   * @param {number} commentId - 评论ID
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>}
   */
  async isCommentOwnedByUser(commentId, userId) {
    const comment = await this.repo.findOne({
      where: { id: commentId, user_id: userId }
    });
    return comment !== null;
  }

  /**
   * 获取最新评论
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>}
   */
  async findLatestComments(limit = 10) {
    return this.repo.find({
      where: { status: 1, parent_id: null },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['user', 'post']
    });
  }
}

module.exports = CommentRepository;