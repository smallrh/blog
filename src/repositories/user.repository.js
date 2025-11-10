const { AppDataSource } = require('../core/database');
const User = require('../models/user.entity');
const { Like, Not } = require('typeorm');
const { log: logger } = require('../core/logger');

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
      select: ['id', 'username', 'email', 'display_name', 'avatar', 'role', 'status', 'created_at', 'updated_at']
    });
  }

  /**
   * 根据邮箱查找用户（包含密码）
   * @param {string} email - 邮箱
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    return this.repo.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'display_name', 'password', 'role', 'status']
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
   * @param {string} id - 用户ID
   * @param {string} ip - IP地址
   * @returns {Promise<boolean>}
   */
  async updateLastLogin(id, ip) {
    // 根据SQL文件结构，更新最后登录时间和登录次数
    // 注意：SQL中没有last_login_ip字段，所以不更新IP
    const result = await this.repo.update({ id }, { 
      last_login_at: new Date(),
      login_count: () => "login_count + 1"
    });
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
    try {
      // 输入验证
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email parameter');
      }
      
      const where = { email };
      if (excludeId) {
        where.id = Not(excludeId);
      }
      
      // 执行计数查询
      const count = await this.repo.count({ where });
      // 确保返回布尔值
      return count > 0;
    } catch (error) {
      // 记录错误并重新抛出，以便上层处理
      logger.error('邮箱存在性检查失败', error);
      throw error;
    }
  }
}

// 导入已移至文件顶部

module.exports = UserRepository;