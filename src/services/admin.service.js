const UserRepository = require('../repositories/user.repository');
const { passwordUtil, jwtUtil } = require('../utils/crypto');
const { log } = require('../core/logger');

/**
 * 管理员服务层
 */
class AdminService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * 管理员登录
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @param {string} ip - IP地址
   * @returns {Promise<Object>}
   */
  async adminLogin(email, password, ip) {
    try {
      // 使用TypeORM查找用户
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid account or password');
      }

      // 检查用户状态
      if (user.status === 0) {
        throw new Error('Account has been disabled');
      }

      // 验证密码
      const isPasswordValid = await passwordUtil.verify(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid account or password');
      }

      // 验证是否是管理员
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('Admin access required');
      }

      // 更新最后登录信息
      await this.userRepository.updateLastLogin(user.id, ip);

      // 生成JWT token
      const token = jwtUtil.generateLoginToken(user);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }
      };
    } catch (error) {
      log.error('Admin login error:', error);
      throw error;
    }
  }

  /**
   * 获取管理员信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>}
   */
  async getAdminInfo(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 验证是否是管理员
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Admin access required');
    }

     return user;
  }
}
module.exports = AdminService;
