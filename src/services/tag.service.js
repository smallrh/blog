const { redis } = require('../core/redis');
const { cacheGet, cacheSet, cacheDel, cacheDelPattern } = require('../utils/cache');
const TagRepository = require('../repositories/tag.repository');
const PostRepository = require('../repositories/post.repository');

class TagService {
  constructor() {
    this.tagRepository = new TagRepository();
    this.postRepository = new PostRepository();
  }

  // 作用域缓存键
  getCacheKey(key) {
    return `blog:tag:${key}`;
  }

  // 获取标签列表
  async getTags(page = 1, pageSize = 50, hot = false) {
    const result = await this.tagRepository.findTags(page, pageSize, hot);
    return result;
  }

  // 获取热门标签
  async getHotTags(limit = 20) {
    const cacheKey = this.getCacheKey(`hot:${limit}`);
    
    // 尝试从缓存获取
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const tags = await this.tagRepository.findHotTags(limit);

    // 设置缓存，600秒过期
    await cacheSet(cacheKey, JSON.stringify(tags), 600);

    return tags;
  }

  // 根据slug获取标签详情
  async getTagBySlug(slug) {
    const cacheKey = this.getCacheKey(`slug:${slug}`);
    
    // 尝试从缓存获取
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const tag = await this.tagRepository.findBySlug(slug);

    if (tag) {
      // 设置缓存，300秒过期
      await cacheSet(cacheKey, JSON.stringify(tag), 300);
    }

    return tag;
  }

  // 根据ID获取标签
  async getTagById(id) {
    const cacheKey = this.getCacheKey(`id:${id}`);
    
    // 尝试从缓存获取
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const tag = await this.tagRepository.findById(id);

    if (tag) {
      // 设置缓存，300秒过期
      await cacheSet(cacheKey, JSON.stringify(tag), 300);
    }

    return tag;
  }

  // 获取标签下的文章
  async getPostsByTagSlug(slug, page = 1, pageSize = 10) {
    const tag = await this.getTagBySlug(slug);
    if (!tag) {
      throw new Error('Tag not found');
    }

    const cacheKey = this.getCacheKey(`${slug}:posts:${page}:${pageSize}`);
    
    // 尝试从缓存获取
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      const result = JSON.parse(cachedData);
      result.tag = tag;
      return result;
    }

    // 使用repository查询该标签下的文章
    const result = await this.tagRepository.findPostsByTagSlug(slug, page, pageSize);
    result.tag = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug
    };

    // 设置缓存，300秒过期
    await cacheSet(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  // 清除标签相关缓存
  async clearCache() {
    await cacheDelPattern('blog:tag:*');
  }

  // 更新标签文章数量
  async updatePostCount(tagId) {
    await this.tagRepository.updatePostCount(tagId);
    await this.clearCache();
  }
}

module.exports = new TagService();