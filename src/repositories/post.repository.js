const { AppDataSource } = require('../core/database');
const PostEntity = require('../models/post.entity');
const CategoryEntity = require('../models/category.entity');
const UserEntity = require('../models/user.entity');
const PostTagEntity = require('../models/postTag.entity');
const TagEntity = require('../models/tag.entity');

/**
 * 文章数据访问层
 */
class PostRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(PostEntity);
    this.tagRepo = AppDataSource.getRepository(TagEntity);
    this.postTagRepo = AppDataSource.getRepository(PostTagEntity);
  }

  /**
   * 获取文章列表（支持分页和筛选）
   * @param {number} offset - 偏移量
   * @param {number} limit - 限制数量
   * @param {object} filters - 筛选条件
   * @returns {Promise<{list: Array, total: number}>}
   */
  async findWithFilters(offset, limit, filters = {}) {
    const queryBuilder = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.user', 'u')
      .where('p.status = 1');

    // 添加筛选条件
    if (filters.categoryId) {
      queryBuilder.andWhere('c.id = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters.tagId) {
      queryBuilder.innerJoin('p.tags', 't')
        .andWhere('t.id = :tagId', { tagId: filters.tagId });
    }

    if (filters.search) {
      queryBuilder.andWhere('p.title LIKE :search OR p.content LIKE :search', 
        { search: `%${filters.search}%` });
    }

    // 计算总数
    const total = await queryBuilder.getCount();

    // 查询列表
    const posts = await queryBuilder
      .orderBy('p.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return { list: posts, total };
  }

  /**
   * 通过ID获取文章详情
   * @param {number} id - 文章ID
   * @returns {Promise<PostEntity|null>}
   */
  async findById(id) {
    return this.repo.findOne({
      where: { id, status: 1 },
      relations: ['category', 'user', 'tags']
    });
  }

  /**
   * 通过slug获取文章详情
   * @param {string} slug - 文章别名
   * @returns {Promise<PostEntity|null>}
   */
  async findBySlug(slug) {
    return this.repo.findOne({
      where: { slug, status: 1 },
      relations: ['category', 'user', 'tags']
    });
  }

  /**
   * 增加文章浏览量
   * @param {number} id - 文章ID
   * @returns {Promise<boolean>}
   */
  async incrementViewCount(id) {
    const result = await this.repo.increment({ id }, 'view_count', 1);
    return result.affected > 0;
  }

  /**
   * 增加文章点赞数
   * @param {number} id - 文章ID
   * @returns {Promise<boolean>}
   */
  async incrementLikeCount(id) {
    const result = await this.repo.increment({ id }, 'like_count', 1);
    return result.affected > 0;
  }

  /**
   * 创建文章
   * @param {object} data - 文章数据
   * @returns {Promise<PostEntity>}
   */
  async create(data) {
    const post = this.repo.create(data);
    return this.repo.save(post);
  }

  /**
   * 更新文章
   * @param {number} id - 文章ID
   * @param {object} data - 更新数据
   * @returns {Promise<PostEntity|null>}
   */
  async update(id, data) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  /**
   * 删除文章
   * @param {number} id - 文章ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    // 先删除文章标签关联
    await this.postTagRepo.delete({ post_id: id });
    // 删除文章
    const result = await this.repo.delete({ id });
    return result.affected > 0;
  }

  /**
   * 获取文章标签
   * @param {number} postId - 文章ID
   * @returns {Promise<Array>}
   */
  async getPostTags(postId) {
    return this.tagRepo
      .createQueryBuilder('t')
      .innerJoin('post_tag', 'pt', 'pt.tag_id = t.id')
      .where('pt.post_id = :postId', { postId })
      .select(['t.id', 't.name'])
      .getMany();
  }

  /**
   * 获取热门文章
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>}
   */
  async getHotPosts(limit = 10) {
    return this.repo.find({
      where: { status: 1 },
      order: { view_count: 'DESC', created_at: 'DESC' },
      take: limit
    });
  }

  /**
   * 获取最新文章
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>}
   */
  async getLatestPosts(limit = 10) {
    return this.repo.find({
      where: { status: 1 },
      order: { created_at: 'DESC' },
      take: limit
    });
  }
}

module.exports = PostRepository;