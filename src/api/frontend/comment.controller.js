const express = require('express');
const { successResponse, errorResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');
const CommentService = require('../../services/comment.service');

const router = express.Router();
const commentService = new CommentService();

/**
 * @swagger
 * /api/frontend/posts/{postId}/comments:
 *   get:
 *     summary: 获取文章评论列表
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: 文章ID
 *       - in: query
 *         name: page
 *         description: 页码
 *         default: 1
 *       - in: query
 *         name: pageSize
 *         description: 每页数量
 *         default: 20
 *     responses:
 *       200:
 *         description: 获取评论列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code: { type: integer }
 *                 message: { type: string }
 *                 data: { type: object }
 *                 page: { type: object }
 */
router.get('/post/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, '无效的文章ID');
    }
    
    // 解析分页参数
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    
    // 获取当前用户ID（如果已登录）
    const userId = req.user ? req.user.id : null;
    
    // 获取评论列表
    const result = await commentService.getCommentsByPostId(postId, page, pageSize, userId);
    
    return successResponse(res, {
      count: result.count,
      list: result.list
    }, '获取评论列表成功', {
      current: result.page,
      pageSize: result.pageSize,
      total: result.count,
      totalPages: result.totalPages
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/posts/{postId}/comments:
 *   post:
 *     summary: 创建评论
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string, description: '评论内容' }
 *               parent_id: { type: integer, description: '父评论ID' }
 *     responses:
 *       200:
 *         description: 创建评论成功
 */
router.post('/post/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { content, parent_id } = req.body;
    
    // 验证参数
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, '无效的文章ID');
    }
    
    if (!content || content.trim().length === 0) {
      return errorResponse(res, '评论内容不能为空');
    }
    
    if (content.length > 1000) {
      return errorResponse(res, '评论内容不能超过1000个字符');
    }
    
    if (parent_id && !validate.isPositiveInteger(parent_id)) {
      return errorResponse(res, '无效的父评论ID');
    }
    
    // 如果是回复评论，检查父评论是否存在
    if (parent_id) {
      const parentComment = await commentService.getCommentById(parent_id);
      if (!parentComment) {
        return errorResponse(res, '父评论不存在');
      }
    }
    
    // 构建请求信息
    const requestInfo = {
      userAgent: req.headers['user-agent'] || null,
      ip: req.ip
    };
    
    // 创建评论
    const comment = await commentService.createComment(
      { post_id: postId, content: content.trim(), parent_id },
      req.user,
      requestInfo
    );
    
    return successResponse(res, comment, '创建评论成功');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/comments/{id}/like:
 *   post:
 *     summary: 点赞评论
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 点赞成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 like_count: { type: integer }
 *                 is_liked: { type: boolean }
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, '无效的评论ID');
    }
    
    // 检查评论是否存在
    const comment = await commentService.getCommentById(commentId);
    if (!comment) {
      return errorResponse(res, '评论不存在');
    }
    
    // 点赞评论
    const result = await commentService.likeComment(commentId, userId);
    
    return successResponse(res, result, '点赞成功');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/comments/{id}/unlike:
 *   post:
 *     summary: 取消点赞评论
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 取消点赞成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 like_count: { type: integer }
 *                 is_liked: { type: boolean }
 */
router.post('/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, '无效的评论ID');
    }
    
    // 检查评论是否存在
    const comment = await commentService.getCommentById(commentId);
    if (!comment) {
      return errorResponse(res, '评论不存在');
    }
    
    // 取消点赞
    const result = await commentService.unlikeComment(commentId, userId);
    
    return successResponse(res, result, '取消点赞成功');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/comments/{id}:
 *   delete:
 *     summary: 删除评论
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *     responses:
 *       200: { description: '删除评论成功' }
 *       403: { description: '无权删除该评论' }
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, '无效的评论ID');
    }
    
    // 删除评论
    await commentService.deleteComment(commentId, userId);
    
    return successResponse(res, {}, '删除评论成功');
  } catch (error) {
    if (error.message === '无权删除该评论') {
      return errorResponse(res, error.message, 403);
    }
    return errorResponse(res, error.message);
  }
});

module.exports = router;