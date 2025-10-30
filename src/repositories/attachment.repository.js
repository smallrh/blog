const { AppDataSource } = require('../core/database');
const AttachmentEntity = require('../models/attachment.entity');

/**
 * 附件数据访问层
 */
class AttachmentRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(AttachmentEntity);
  }

  /**
   * 获取附件列表（支持分页）
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {object} filters - 筛选条件
   * @returns {Promise<{list: Array, count: number}>}
   */
  async findWithPagination(page = 1, pageSize = 20, filters = {}) {
    const queryBuilder = this.repo.createQueryBuilder('attachment');
    
    // 添加筛选条件
    if (filters.userId) {
      queryBuilder.where('attachment.user_id = :userId', { userId: filters.userId });
    }

    if (filters.type) {
      queryBuilder.andWhere('attachment.type = :type', { type: filters.type });
    }

    if (filters.status !== undefined) {
      queryBuilder.andWhere('attachment.status = :status', { status: filters.status });
    }

    // 计算总数
    const count = await queryBuilder.getCount();
    
    // 分页查询
    const skip = (page - 1) * pageSize;
    const attachments = await queryBuilder
      .orderBy('attachment.created_at', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();

    return { list: attachments, count };
  }

  /**
   * 通过ID获取附件
   * @param {number} id - 附件ID
   * @returns {Promise<AttachmentEntity|null>}
   */
  async findById(id) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * 通过文件路径获取附件
   * @param {string} path - 文件路径
   * @returns {Promise<AttachmentEntity|null>}
   */
  async findByPath(path) {
    return this.repo.findOne({ where: { path } });
  }

  /**
   * 通过用户ID获取附件列表
   * @param {number} userId - 用户ID
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>}
   */
  async findByUserId(userId, limit = 50) {
    return this.repo.find({
      where: { user_id: userId, status: 1 },
      order: { created_at: 'DESC' },
      take: limit
    });
  }

  /**
   * 创建附件记录
   * @param {object} data - 附件数据
   * @returns {Promise<AttachmentEntity>}
   */
  async create(data) {
    const attachment = this.repo.create(data);
    return this.repo.save(attachment);
  }

  /**
   * 更新附件
   * @param {number} id - 附件ID
   * @param {object} data - 更新数据
   * @returns {Promise<AttachmentEntity|null>}
   */
  async update(id, data) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  /**
   * 删除附件
   * @param {number} id - 附件ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await this.repo.delete({ id });
    return result.affected > 0;
  }

  /**
   * 软删除附件（更新状态）
   * @param {number} id - 附件ID
   * @returns {Promise<boolean>}
   */
  async softDelete(id) {
    const result = await this.repo.update({ id }, { status: 0 });
    return result.affected > 0;
  }

  /**
   * 更新附件状态
   * @param {number} id - 附件ID
   * @param {number} status - 状态值
   * @returns {Promise<boolean>}
   */
  async updateStatus(id, status) {
    const result = await this.repo.update({ id }, { status });
    return result.affected > 0;
  }

  /**
   * 批量删除附件
   * @param {Array<number>} ids - 附件ID列表
   * @returns {Promise<boolean>}
   */
  async deleteBatch(ids) {
    const result = await this.repo.delete(ids);
    return result.affected > 0;
  }

  /**
   * 获取附件统计信息
   * @param {number} userId - 用户ID
   * @returns {Promise<object>}
   */
  async getStatistics(userId) {
    const queryBuilder = this.repo.createQueryBuilder('attachment')
      .select('type, COUNT(*) as count, SUM(size) as totalSize')
      .where('status = 1')
      .groupBy('type');

    if (userId) {
      queryBuilder.andWhere('user_id = :userId', { userId });
    }

    const statistics = await queryBuilder.getRawMany();
    
    return statistics.reduce((acc, item) => {
      acc[item.type] = {
        count: parseInt(item.count),
        totalSize: parseInt(item.totalSize)
      };
      return acc;
    }, {});
  }
}