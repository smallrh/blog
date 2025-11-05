require('dotenv/config');
const { DataSource } = require('typeorm');

// 创建数据库连接池
const AppDataSource = new DataSource({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'blog_db',
  entities: ['src/models/*.entity.js'],
  synchronize: false, // 使用SQL文件中的表定义，不自动同步
  logging: false, // 禁用日志
  entityPrefix: '' // 确保没有表前缀
});

// 初始化数据库连接
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = {
  AppDataSource,
  initializeDatabase
};