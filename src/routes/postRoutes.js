const express = require('express');
const PostController = require('../controllers/PostController');
const router = express.Router();

// 文章相关路由
router.get('/posts', PostController.getPosts);           // 获取文章列表
router.get('/posts/:id', PostController.getPostById);    // 获取文章详情
router.post('/posts', PostController.createPost);        // 创建文章
router.post('/posts/:id', PostController.updatePost);    // 更新文章
router.post('/posts/:id/delete', PostController.deletePost); // 删除文章

module.exports = router;