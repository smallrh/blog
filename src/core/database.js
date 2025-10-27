require('dotenv/config');
const { DataSource } = require('typeorm');

// 创建数据库连接池
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'blog_backend',
  entities: ['src/models/*.entity.js'],
  synchronize: false, // 使用SQL文件中的表定义，不自动同步
  logging: false,
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