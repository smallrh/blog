const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/comments:
 *   get:
 *     summary: 获取评论列表（后台）
 *     tags: [Admin-Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 页码
 *         default: 1
 *       - in: query
 *         name: pageSize
 *         description: 每页大小
 *         default: 50
 *       - in: query
 *         name: post
 *         description: 文章ID
 *       - in: query
 *         name: user
 *         description: 用户ID
 *       - in: query
 *         name: status
 *         description: 评论状态
 *     responses:
 *       200: { description: 'Get comments successful' }
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 解析分页参数
    const { page, pageSize, skip, take } = paginationUtil.parsePagination(req.query);
    
    // 获取筛选条件
    const filters = {};
    if (req.query.post && validate.isPositiveInteger(req.query.post)) {
      filters.postId = parseInt(req.query.post);
    }
    if (req.query.user && validate.isPositiveInteger(req.query.user)) {
      filters.userId = parseInt(req.query.user);
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // 注意：这里需要实现后台评论列表查询逻辑
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
 * /api/admin/comments/:id:
 *   get:
 *     summary: 获取评论详情（后台）
 *     tags: [Admin-Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *     responses:
 *       200: { description: 'Get comment successful' }
 *       404: { description: 'Comment not found' }
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, 'Invalid comment ID');
    }
    
    // 注意：这里需要实现后台评论详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const comment = null;
    
    if (!comment) {
      return notFoundResponse(res, 'Comment not found');
    }
    
    return successResponse(res, comment, 'Get comment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/comments/:id:
 *   put:
 *     summary: 更新评论（后台）
 *     tags: [Admin-Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string, description: '评论内容' }
 *               status: { type: string, description: '评论状态' }
 *     responses:
 *       200: { description: 'Update comment successful' }
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, 'Invalid comment ID');
    }
    
    // 验证参数
    if (req.body.content && !validate.length(req.body.content, 1, 1000)) {
      return errorResponse(res, 'Comment content must be between 1 and 1000 characters');
    }
    
    // 注意：这里需要实现评论更新逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update comment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/comments/:id:
 *   delete:
 *     summary: 删除评论（后台）
 *     tags: [Admin-Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *     responses:
 *       200: { description: 'Delete comment successful' }
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, 'Invalid comment ID');
    }
    
    // 注意：这里需要实现评论删除逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Delete comment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/comments/:id/status:
 *   put:
 *     summary: 更新评论状态（后台）
 *     tags: [Admin-Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status: { type: string, description: '评论状态' }
 *     responses:
 *       200: { description: 'Update comment status successful' }
 */
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { status } = req.body;
    
    if (!validate.isPositiveInteger(commentId)) {
      return errorResponse(res, 'Invalid comment ID');
    }
    
    if (!status) {
      return errorResponse(res, 'Status is required');
    }
    
    // 注意：这里需要实现评论状态更新逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update comment status successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;