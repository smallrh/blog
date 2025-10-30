const { AppDataSource } = require('../core/database');
const PostTagEntity = require('../models/postTag.entity');

/**
 * PostTag仓库类
 * 处理Post和Tag关联表的数据库操作
 */
class PostTagRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(PostTagEntity);
  }

  /**
   * 根据文章ID查找关联的标签ID列表
   * @param {number} postId 文章ID
   * @returns {Promise<Array<number>>} 标签ID列表
   */
  async findTagIdsByPostId(postId) {
    try {
      const postTags = await this.repository.find({
        where: { post_id: postId },
        select: ['tag_id']
      });
      return postTags.map(item => item.tag_id);
    } catch (error) {
      console.error('根据文章ID查找标签ID失败:', error);
      throw error;
    }
  }

  /**
   * 根据标签ID查找关联的文章ID列表
   * @param {number} tagId 标签ID
   * @returns {Promise<Array<number>>} 文章ID列表
   */
  async findPostIdsByTagId(tagId) {
    try {
      const postTags = await this.repository.find({
        where: { tag_id: tagId },
        select: ['post_id']
      });
      return postTags.map(item => item.post_id);
    } catch (error) {
      console.error('根据标签ID查找文章ID失败:', error);
      throw error;
    }
  }

  /**
   * 为文章添加标签关联
   * @param {number} postId 文章ID
   * @param {Array<number>} tagIds 标签ID列表
   * @returns {Promise<void>}
   */
  async createPostTags(postId, tagIds) {
    try {
      const postTagEntities = tagIds.map(tagId => ({
        post_id: postId,
        tag_id: tagId
      }));
      await this.repository.insert(postTagEntities);
    } catch (error) {
      console.error('创建文章标签关联失败:', error);
      throw error;
    }
  }

  /**
   * 删除文章的所有标签关联
   * @param {number} postId 文章ID
   * @returns {Promise<void>}
   */
  async deletePostTags(postId) {
    try {
      await this.repository.delete({ post_id: postId });
    } catch (error) {
      console.error('删除文章标签关联失败:', error);
      throw error;
    }
  }

  /**
   * 更新文章的标签关联（删除旧关联，创建新关联）
   * @param {number} postId 文章ID
   * @param {Array<number>} tagIds 新的标签ID列表
   * @returns {Promise<void>}
   */
  async updatePostTags(postId, tagIds) {
    try {
      // 开启事务
      await AppDataSource.transaction(async transactionalEntityManager => {
        const transactionalRepository = transactionalEntityManager.getRepository(PostTagEntity);
        
        // 删除旧的关联
        await transactionalRepository.delete({ post_id: postId });
        
        // 创建新的关联
        if (tagIds && tagIds.length > 0) {
          const postTagEntities = tagIds.map(tagId => ({
            post_id: postId,
            tag_id: tagId
          }));
          await transactionalRepository.insert(postTagEntities);
        }
      });
    } catch (error) {
      console.error('更新文章标签关联失败:', error);
      throw error;
    }
  }

  /**
   * 统计标签的文章数量
   * @param {number} tagId 标签ID
   * @returns {Promise<number>} 文章数量
   */
  async countPostsByTagId(tagId) {
    try {
      return await this.repository.count({ where: { tag_id: tagId } });
    } catch (error) {
      console.error('统计标签文章数量失败:', error);
      throw error;
    }
  }

  /**
   * 删除特定标签的所有关联
   * @param {number} tagId 标签ID
   * @returns {Promise<void>}
   */
  async deleteByTagId(tagId) {
    try {
      await this.repository.delete({ tag_id: tagId });
    } catch (error) {
      console.error('删除标签关联失败:', error);
      throw error;
    }
  }
}

module.exports = PostTagRepository;