const { AppDataSource } = require('../core/database');
const TagEntity = require('../models/tag.entity');
const PostTagEntity = require('../models/postTag.entity');

/**
 * 标签数据访问层
 */
class TagRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(TagEntity);
    this.postTagRepo = AppDataSource.getRepository(PostTagEntity);
  }

  /**
   * 获取标签列表（支持分页）
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {boolean} hot - 是否按热门排序
   * @returns {Promise<{list: Array, count: number}>}
   */
  async findWithPagination(page = 1, pageSize = 50, hot = false) {
    const queryBuilder = this.repo.createQueryBuilder('tag');
    
    // 设置排序
    if (hot) {
      queryBuilder.orderBy('tag.post_count', 'DESC');
    } else {
      queryBuilder.orderBy('tag.id', 'DESC');
    }

    // 计算总数
    const total = await queryBuilder.getCount();
    
    // 分页查询
    const skip = (page - 1) * pageSize;
    const tags = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getMany();

    return { list: tags, count: total };
  }

  /**
   * 获取热门标签
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>}
   */
  async findHotTags(limit = 20) {
    return this.repo.createQueryBuilder('tag')
      .select(['tag.id', 'tag.name', 'tag.slug', 'tag.post_count'])
      .orderBy('tag.post_count', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 通过ID获取标签
   * @param {number} id - 标签ID
   * @returns {Promise<TagEntity|null>}
   */
  async findById(id) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * 通过slug获取标签
   * @param {string} slug - 标签别名
   * @returns {Promise<TagEntity|null>}
   */
  async findBySlug(slug) {
    return this.repo.findOne({
      where: { slug },
      select: ['id', 'name', 'slug', 'post_count', 'created_at']
    });
  }

  /**
   * 通过名称获取标签
   * @param {string} name - 标签名称
   * @returns {Promise<TagEntity|null>}
   */
  async findByName(name) {
    return this.repo.findOne({ where: { name } });
  }

  /**
   * 通过ID列表获取标签
   * @param {Array<number>} ids - 标签ID列表
   * @returns {Promise<Array>}
   */
  async findByIds(ids) {
    return this.repo.findByIds(ids);
  }

  /**
   * 创建标签
   * @param {object} data - 标签数据
   * @returns {Promise<TagEntity>}
   */
  async create(data) {
    const tag = this.repo.create(data);
    return this.repo.save(tag);
  }

  /**
   * 批量创建标签
   * @param {Array<object>} tagsData - 标签数据列表
   * @returns {Promise<Array<TagEntity>>}
   */
  async createBatch(tagsData) {
    const tags = this.repo.create(tagsData);
    return this.repo.save(tags);
  }

  /**
   * 更新标签
   * @param {number} id - 标签ID
   * @param {object} data - 更新数据
   * @returns {Promise<TagEntity|null>}
   */
  async update(id, data) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  /**
   * 删除标签
   * @param {number} id - 标签ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    // 先删除文章标签关联
    await this.postTagRepo.delete({ tag_id: id });
    // 删除标签
    const result = await this.repo.delete({ id });
    return result.affected > 0;
  }

  /**
   * 增加文章数量
   * @param {number} id - 标签ID
   * @returns {Promise<boolean>}
   */
  async incrementPostCount(id) {
    const result = await this.repo.increment({ id }, 'post_count', 1);
    return result.affected > 0;
  }

  /**
   * 减少文章数量
   * @param {number} id - 标签ID
   * @returns {Promise<boolean>}
   */
  async decrementPostCount(id) {
    const result = await this.repo.increment({ id }, 'post_count', -1);
    return result.affected > 0;
  }

  /**
   * 关联文章和标签
   * @param {number} postId - 文章ID
   * @param {number} tagId - 标签ID
   * @returns {Promise<void>}
   */
  async createPostTagRelation(postId, tagId) {
    const postTag = this.postTagRepo.create({ post_id: postId, tag_id: tagId });
    await this.postTagRepo.save(postTag);
  }

  /**
   * 删除文章和标签的关联
   * @param {number} postId - 文章ID
   * @returns {Promise<void>}
   */
  async deletePostTagRelations(postId) {
    await this.postTagRepo.delete({ post_id: postId });
  }

  /**
   * 获取文章的标签
   * @param {number} postId - 文章ID
   * @returns {Promise<Array>}
   */
  async findTagsByPostId(postId) {
    return this.repo
      .createQueryBuilder('t')
      .innerJoin('post_tag', 'pt', 'pt.tag_id = t.id')
      .where('pt.post_id = :postId', { postId })
      .select(['t.id', 't.name'])
      .getMany();
  }
}

module.exports = TagRepository;