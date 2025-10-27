const { AppDataSource } = require('../core/database');
const User = require('../models/user.entity');

/**
 * 用户数据访问层
 */
class UserRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  /**
   * 根据ID查找用户
   * @param {number} id - 用户ID
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    return this.repo.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'avatar', 'bio', 'role', 'status', 'createdAt', 'updatedAt']
    });
  }

  /**
   * 根据邮箱查找用户（包含密码）
   * @param {string} email - 邮箱
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    return this.repo.findOne({
      where: { email }
    });
  }

  /**
   * 查找用户（支持账号或邮箱登录）
   * @param {string} account - 账号（邮箱）
   * @returns {Promise<User|null>}
   */
  async findByAccount(account) {
    // 假设账号就是邮箱
    return this.findByEmail(account);
  }

  /**
   * 创建用户
   * @param {Object} data - 用户数据
   * @returns {Promise<User>}
   */
  async create(data) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  /**
   * 更新用户
   * @param {number} id - 用户ID
   * @param {Object} data - 更新数据
   * @returns {Promise<User|null>}
   */
  async update(id, data) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  /**
   * 删除用户
   * @param {number} id - 用户ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await this.repo.delete({ id });
    return result.affected > 0;
  }

  /**
   * 更新用户状态
   * @param {number} id - 用户ID
   * @param {number} status - 状态值
   * @returns {Promise<boolean>}
   */
  async updateStatus(id, status) {
    const result = await this.repo.update({ id }, { status });
    return result.affected > 0;
  }

  /**
   * 更新用户最后登录信息
   * @param {number} id - 用户ID
   * @param {string} ip - IP地址
   * @returns {Promise<boolean>}
   */
  async updateLastLogin(id, ip) {
    const result = await this.repo.update({ id }, { last_login_ip: ip });
    return result.affected > 0;
  }

  /**
   * 分页获取用户列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @param {Object} query - 查询条件
   * @returns {Promise<{data: User[], total: number}>}
   */
  async findAll(page = 1, pageSize = 10, query = {}) {
    const where = {};
    
    if (query.email) {
      where.email = Like(`%${query.email}%`);
    }
    
    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    
    if (query.role) {
      where.role = query.role;
    }
    
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' }
    });

    return { data, total };
  }

  /**
   * 统计用户数量
   * @param {Object} where - 统计条件
   * @returns {Promise<number>}
   */
  async count(where = {}) {
    return this.repo.count({ where });
  }

  /**
   * 检查邮箱是否已存在
   * @param {string} email - 邮箱
   * @param {number} excludeId - 排除的用户ID
   * @returns {Promise<boolean>}
   */
  async isEmailExists(email, excludeId = null) {
    const where = { email };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    return this.repo.count({ where }) > 0;
  }
}

// 添加缺失的导入
const { Like, Not } = require('typeorm');

module.exports = UserRepository;