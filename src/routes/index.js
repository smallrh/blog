const express = require('express');
const postRoutes = require('./postRoutes');
const router = express.Router();

// 挂载各模块路由
router.use('/api', postRoutes);

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