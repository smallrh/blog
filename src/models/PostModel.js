const pool = require('../config/database');

class PostModel {
  // 获取文章列表
  static async getPosts(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.execute(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM posts');
    const total = countResult[0].total;
    
    return {
      list: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
  
  // 获取文章详情
  static async getPostById(id) {
    const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [id]);
    return rows[0] || null;
  }
  
  // 创建文章
  static async createPost(data) {
    const { title, content, user_id, category_id } = data;
    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)',
      [title, content, user_id, category_id]
    );
    return { id: result.insertId, ...data };
  }
  
  // 更新文章
  static async updatePost(id, data) {
    const { title, content, category_id } = data;
    await pool.execute(
      'UPDATE posts SET title = ?, content = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, category_id, id]
    );
    return await this.getPostById(id);
  }
  
  // 删除文章
  static async deletePost(id) {
    const [result] = await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = PostModel;