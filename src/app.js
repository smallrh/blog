const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// 导入路由和中间件
const routes = require('./routes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

// 导入数据库和Redis连接
const dbPool = require('./config/database');
const redisClient = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 9000;

// 配置中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// 挂载路由
app.use('/', routes);

// 全局错误处理中间件
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const [rows] = await dbPool.execute('SELECT 1');
    console.log('Database connected successfully');
    
    // 连接Redis
    await redisClient.connect();
    console.log('Redis connected successfully');
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 启动应用
startServer();

// 优雅关闭处理
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await dbPool.end();
  await redisClient.quit();
  process.exit(0);
});