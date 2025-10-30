const { AppDataSource } = require('../core/database');
const CategoryEntity = require('../models/category.entity');

/**
 * 分类数据访问层
 */
class CategoryRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(CategoryEntity);
  }

  /**
   * 获取所有分类
   * @param {object} options - 查询选项
   * @returns {Promise<Array>}
   */
  async findAll(options = {}) {
    const query = {
      where: { status: 1 },
      order: { sort_order: 'ASC', created_at: 'DESC' },
      ...options
    };
    return this.repo.find(query);
  }

  /**
   * 获取分类树
   * @returns {Promise<Array>}
   */
  async findAllForTree() {
    return this.repo.find({
      where: { status: 1 },
      order: { sort_order: 'ASC', created_at: 'DESC' }
    });
  }

  /**
   * 获取分类列表（支持分页和父分类筛选）
   * @param {object} params - 查询参数
   * @returns {Promise<{list: Array, count: number}>}
   */
  async findWithPagination(params = {}) {
    const { parent_id = null, skip = 0, take = 20 } = params;
    
    const where = { status: 1 };
    if (parent_id !== null) {
      where.parent_id = parent_id;
    }

    // 查询总数
    const count = await this.repo.count({ where });
    
    // 查询列表
    const categories = await this.repo.find({
      where,
      skip,
      take,
      order: { sort_order: 'ASC', created_at: 'DESC' }
    });

    return { list: categories, count };
  }

  /**
   * 通过ID获取分类
   * @param {number} id - 分类ID
   * @returns {Promise<CategoryEntity|null>}
   */
  async findById(id) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * 通过slug获取分类
   * @param {string} slug - 分类别名
   * @returns {Promise<CategoryEntity|null>}
   */
  async findBySlug(slug) {
    return this.repo.findOne({
      where: { slug, status: 1 },
      select: ['id', 'name', 'slug', 'post_count', 'created_at']
    });
  }

  /**
   * 创建分类
   * @param {object} data - 分类数据
   * @returns {Promise<CategoryEntity>}
   */
  async create(data) {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }

  /**
   * 更新分类
   * @param {number} id - 分类ID
   * @param {object} data - 更新数据
   * @returns {Promise<CategoryEntity|null>}
   */
  async update(id, data) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  /**
   * 删除分类
   * @param {number} id - 分类ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await this.repo.delete({ id });
    return result.affected > 0;
  }

  /**
   * 更新分类状态
   * @param {number} id - 分类ID
   * @param {number} status - 状态值
   * @returns {Promise<boolean>}
   */
  async updateStatus(id, status) {
    const result = await this.repo.update({ id }, { status });
    return result.affected > 0;
  }

  /**
   * 更新分类排序
   * @param {number} id - 分类ID
   * @param {number} sortOrder - 排序值
   * @returns {Promise<boolean>}
   */
  async updateSortOrder(id, sortOrder) {
    const result = await this.repo.update({ id }, { sort_order: sortOrder });
    return result.affected > 0;
  }

  /**
   * 增加文章数量
   * @param {number} id - 分类ID
   * @returns {Promise<boolean>}
   */
  async incrementPostCount(id) {
    const result = await this.repo.increment({ id }, 'post_count', 1);
    return result.affected > 0;
  }

  /**
   * 减少文章数量
   * @param {number} id - 分类ID
   * @returns {Promise<boolean>}
   */
  async decrementPostCount(id) {
    const result = await this.repo.increment({ id }, 'post_count', -1);
    return result.affected > 0;
  }

  /**
   * 获取子分类
   * @param {number} parentId - 父分类ID
   * @returns {Promise<Array>}
   */
  async findChildren(parentId) {
    return this.repo.find({
      where: { parent_id: parentId, status: 1 },
      order: { sort_order: 'ASC', created_at: 'DESC' }
    });
  }
}

module.exports = CategoryRepository;