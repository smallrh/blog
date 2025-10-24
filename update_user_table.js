const pool = require('./src/config/database');

async function updateUserTable() {
  try {
    console.log('正在更新users表，添加password字段...');
    
    // 检查字段是否存在，如果不存在则添加
    const [fieldsResult] = await pool.execute(
      "SHOW COLUMNS FROM users LIKE 'password'"
    );
    
    if (fieldsResult.length === 0) {
      // 添加password字段
      await pool.execute(
        "ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER username"
      );
      console.log('成功添加password字段');
    } else {
      console.log('password字段已存在');
    }
    
    console.log('数据库表更新完成');
  } catch (error) {
    console.error('更新数据库表时出错:', error.message);
  } finally {
    // 关闭数据库连接池
    await pool.end();
  }
}

updateUserTable();