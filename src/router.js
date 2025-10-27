const express = require('express');
const { corsMiddleware, loggerMiddleware, errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/limiter.middleware');
const healthController = require('./api/health.controller');

// 前台路由
const authFrontendRouter = require('./api/frontend/auth.controller');
const userFrontendRouter = require('./api/frontend/user.controller');
const postFrontendRouter = require('./api/frontend/post.controller');
const categoryFrontendRouter = require('./api/frontend/category.controller');
const tagFrontendRouter = require('./api/frontend/tag.controller');
const commentFrontendRouter = require('./api/frontend/comment.controller');

// 后台路由
const authAdminRouter = require('./api/admin/auth.controller');
const userAdminRouter = require('./api/admin/user.controller');
const postAdminRouter = require('./api/admin/post.controller');
const categoryAdminRouter = require('./api/admin/category.controller');
const tagAdminRouter = require('./api/admin/tag.controller');
const commentAdminRouter = require('./api/admin/comment.controller');
const attachmentAdminRouter = require('./api/admin/attachment.controller');
const settingAdminRouter = require('./api/admin/setting.controller');

const router = express.Router();

// 全局中间件
router.use(corsMiddleware);
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(loggerMiddleware);

// 静态文件服务
router.use('/uploads', express.static('uploads'));

// API路由组
const apiRouter = express.Router();

// 前台API路由
apiRouter.use('/frontend/auth', authFrontendRouter);
apiRouter.use('/frontend/users', userFrontendRouter);
apiRouter.use('/frontend/posts', postFrontendRouter);
apiRouter.use('/frontend/categories', categoryFrontendRouter);
apiRouter.use('/frontend/tags', tagFrontendRouter);
apiRouter.use('/frontend/comments', commentFrontendRouter);

// 后台API路由
apiRouter.use('/admin/auth', authAdminRouter);
apiRouter.use('/admin/users', userAdminRouter);
apiRouter.use('/admin/posts', postAdminRouter);
apiRouter.use('/admin/categories', categoryAdminRouter);
apiRouter.use('/admin/tags', tagAdminRouter);
apiRouter.use('/admin/comments', commentAdminRouter);
apiRouter.use('/admin/attachments', attachmentAdminRouter);
apiRouter.use('/admin/settings', settingAdminRouter);

// 应用API路由组
router.use('/api', apiLimiter, apiRouter);

// 健康检查
router.use(healthController);

// 错误处理中间件（必须放在最后）
router.use(notFoundHandler);
router.use(errorHandler);

module.exports = router;