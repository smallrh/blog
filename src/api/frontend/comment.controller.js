const express = require('express');
const { successResponse, errorResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/frontend/comments/post/:postId:
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
 *         description: 每页大小
 *         default: 20
 *     responses:
 *       200: { description: 'Get comments successful' }
 */
router.get('/post/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, 'Invalid post ID');
    }
    
    // 解析分页参数
    const { page, pageSize, skip, take } = paginationUtil.parsePagination(req.query);
    
    // 注意：这里需要实现文章评论查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Get comments successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/comments:
 *   post:
 *     summary: 发表评论
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - content
 *             properties:
 *               post_id: { type: integer, description: '文章ID' }
 *               content: { type: string, description: '评论内容' }
 *               parent_id: { type: integer, description: '父评论ID' }
 *     responses:
 *       200: { description: 'Create comment successful' }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id, content, parent_id } = req.body;
    
    // 验证参数
    if (!post_id || !validate.isPositiveInteger(post_id)) {
      return errorResponse(res, 'Invalid post ID');
    }
    
    if (!content || !validate.length(content, 1, 1000)) {
      return errorResponse(res, 'Comment content must be between 1 and 1000 characters');
    }
    
    if (parent_id && !validate.isPositiveInteger(parent_id)) {
      return errorResponse(res, 'Invalid parent comment ID');
    }
    
    // 注意：这里需要实现评论创建逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Create comment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/comments/:id:
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
 *       200: { description: 'Delete comment successful' }
 *       403: { description: 'Forbidden' }
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, 'Invalid comment ID');
    }
    
    // 注意：这里需要实现评论删除逻辑，包括权限验证
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Delete comment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/comments/:id/like:
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
 *       200: { description: 'Like comment successful' }
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, 'Invalid comment ID');
    }
    
    // 注意：这里需要实现评论点赞逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Like comment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;