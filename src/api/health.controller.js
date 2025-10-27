const { Router } = require('express');
const { successResponse } = require('../utils/response');
const { AppDataSource } = require('../core/database');
const { logger } = require('../core/logger');

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 健康检查接口
 *     description: 检查应用程序是否正常运行
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 应用程序正常运行
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 'ok'
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: 'UP'
 *                     database:
 *                       type: string
 *                       example: 'CONNECTED'
 *                     timestamp:
 *                       type: number
 *       500:
 *         description: 服务器内部错误
 */
router.get('/health', async (req, res) => {
  try {
    // 检查数据库连接状态
    let databaseStatus = 'DISCONNECTED';
    try {
      const isConnected = AppDataSource && AppDataSource.isInitialized;
      if (isConnected) {
        // 执行简单的查询以验证连接
        await AppDataSource.query('SELECT 1');
        databaseStatus = 'CONNECTED';
      }
    } catch (dbError) {
      logger.error('Database health check failed:', dbError);
      databaseStatus = 'ERROR';
    }

    // 整体应用状态
    const appStatus = databaseStatus === 'CONNECTED' ? 'UP' : 'DOWN';

    // 返回健康检查结果
    const healthData = {
      status: appStatus,
      database: databaseStatus,
      timestamp: Date.now(),
      uptime: process.uptime()
    };

    // 如果数据库连接正常，返回200
    if (databaseStatus === 'CONNECTED') {
      successResponse(res, healthData, 'ok');
    } else {
      // 如果数据库连接异常，返回500
      res.status(500).json({
        code: 500,
        message: 'Health check failed',
        data: healthData
      });
    }
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
      data: {
        status: 'DOWN',
        error: error.message,
        timestamp: Date.now()
      }
    });
  }
});

/**
 * @swagger
 * /health/details:
 *   get:
 *     summary: 详细健康检查接口
 *     description: 提供更详细的系统健康信息
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 返回详细的健康信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 'ok'
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     system:
 *                       type: object
 *                     resources:
 *                       type: object
 */
router.get('/health/details', async (req, res) => {
  try {
    // 获取系统信息
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      environment: process.env.NODE_ENV || 'development'
    };

    // 获取资源使用情况
    const resources = {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };

    // 检查数据库连接
    let databaseStatus = 'DISCONNECTED';
    try {
      if (AppDataSource && AppDataSource.isInitialized) {
        await AppDataSource.query('SELECT 1');
        databaseStatus = 'CONNECTED';
      }
    } catch (dbError) {
      databaseStatus = 'ERROR';
    }

    const detailedHealthData = {
      status: databaseStatus === 'CONNECTED' ? 'UP' : 'DOWN',
      database: databaseStatus,
      system: systemInfo,
      resources: resources,
      timestamp: Date.now()
    };

    successResponse(res, detailedHealthData, 'ok');
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
      data: {
        status: 'DOWN',
        error: error.message,
        timestamp: Date.now()
      }
    });
  }
});

module.exports = router;