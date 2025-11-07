const express = require('express');
const router = require('./router.js');
const { logger } = require('./core/logger.js');
const { config } = require('./core/config.js');
const { initializeDatabase } = require('./core/database.js');
const { initializeRedis } = require('./core/redis.js');
const { createDir } = require('./utils/file.js'); // 注意：这个文件需要创建

const app = express();

// 初始化函数
async function initializeApp() {
  try {
    // 创建必要的目录
    await createDir('./uploads');
    await createDir('./logs');
    
    // 连接数据库
    await initializeDatabase();
    logger.info('Database connected successfully');
    
    // 初始化Redis连接
    await initializeRedis();
    logger.info('Redis connected successfully');
    
    // 使用路由
    app.use(router);
    
    // 启动服务器
    const PORT = config.server.port || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

// 启动应用
initializeApp();

// 由于这是应用程序的入口文件，不需要导出app对象