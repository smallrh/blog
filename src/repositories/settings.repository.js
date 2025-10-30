const { AppDataSource } = require('../core/database');
const SettingsEntity = require('../models/settings.entity');

/**
 * 设置数据访问层
 */
class SettingsRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(SettingsEntity);
  }

  /**
   * 获取所有设置
   * @returns {Promise<Array>}
   */
  async findAll() {
    return this.repo.find();
  }

  /**
   * 通过键获取设置
   * @param {string} key - 设置键名
   * @returns {Promise<SettingsEntity|null>}
   */
  async findByKey(key) {
    return this.repo.findOne({ where: { key } });
  }

  /**
   * 通过键列表获取设置
   * @param {Array<string>} keys - 设置键名列表
   * @returns {Promise<Array>}
   */
  async findByKeys(keys) {
    return this.repo.find({ where: keys.map(key => ({ key })) });
  }

  /**
   * 创建或更新设置
   * @param {string} key - 设置键名
   * @param {*} value - 设置值
   * @param {string} description - 描述
   * @returns {Promise<SettingsEntity>}
   */
  async upsert(key, value, description = '') {
    const existing = await this.findByKey(key);
    
    if (existing) {
      existing.value = value;
      existing.description = description;
      existing.updated_at = new Date();
      return this.repo.save(existing);
    } else {
      const setting = this.repo.create({
        key,
        value,
        description
      });
      return this.repo.save(setting);
    }
  }

  /**
   * 批量创建或更新设置
   * @param {Array<{key: string, value: *, description?: string}>} settings - 设置列表
   * @returns {Promise<Array<SettingsEntity>>}
   */
  async upsertBatch(settings) {
    const results = [];
    
    for (const setting of settings) {
      const result = await this.upsert(
        setting.key,
        setting.value,
        setting.description || ''
      );
      results.push(result);
    }
    
    return results;
  }

  /**
   * 删除设置
   * @param {string} key - 设置键名
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    const result = await this.repo.delete({ key });
    return result.affected > 0;
  }

  /**
   * 获取设置作为对象
   * @returns {Promise<object>}
   */
  async findAllAsObject() {
    const settings = await this.findAll();
    
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }

  /**
   * 检查设置是否存在
   * @param {string} key - 设置键名
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    const setting = await this.findByKey(key);
    return setting !== null;
  }
}