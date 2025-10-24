const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserModel {
  // 获取用户列表
  static async getUsers(page = 1, pageSize = 10) {
    // 确保参数为有效数字
    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const validPageSize = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
    const offset = (validPage - 1) * validPageSize;
    
    // 直接在SQL字符串中构建分页参数
    const query = `SELECT * FROM users ORDER BY created_at DESC LIMIT ${validPageSize} OFFSET ${offset}`;
    const [rows] = await pool.execute(query);
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;
    
    return {
      list: rows,
      total,
      page: validPage,
      pageSize: validPageSize,
      totalPages: Math.ceil(total / validPageSize)
    };
  }
  
  // 根据ID获取用户
  static async getUserById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }
  
  // 创建用户
  static async createUser(data) {
    const { id, username, avatar, email } = data;
    const [result] = await pool.execute(
      'INSERT INTO users (id, username, avatar, email) VALUES (?, ?, ?, ?)',
      [id, username, avatar, email]
    );
    // 返回用户信息
    const userData = { ...data };
    if (userData.password) delete userData.password;
    return userData;
  }
  
  // 更新用户
  static async updateUser(id, data) {
    const { username, avatar, email, status, password } = data;
    
    // 准备更新字段
    const updateFields = [];
    const params = [];
    
    if (username !== undefined) updateFields.push('username = ?'), params.push(username);
    if (avatar !== undefined) updateFields.push('avatar = ?'), params.push(avatar);
    if (email !== undefined) updateFields.push('email = ?'), params.push(email);
    if (status !== undefined) updateFields.push('status = ?'), params.push(status);
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?'), params.push(hashedPassword);
    }
    
    // 添加时间戳和ID
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    // 返回更新后的用户信息（不包含密码）
    const updatedUser = await this.getUserById(id);
    if (updatedUser) delete updatedUser.password;
    return updatedUser;
  }
  
  // 删除用户
  static async deleteUser(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  
  // 根据用户名查询用户
  static async getUserByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }
  
  // 验证用户密码
  static async verifyPassword(user, password) {
    if (!user || !user.password) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }
  
  // 根据ID获取用户（包含密码用于登录验证）
  static async getUserByIdWithPassword(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }
}

module.exports = UserModel;