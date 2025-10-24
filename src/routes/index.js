const express = require('express');
const postRoutes = require('./postRoutes');
const userRoutes = require('./userRoutes');
const router = express.Router();

// 挂载文章路由
router.use('/posts', postRoutes);

// 挂载用户路由
router.use('/users', userRoutes);

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'Success',
    data: { status: 'ok' },
    page: {}
  });
});

module.exports = router;