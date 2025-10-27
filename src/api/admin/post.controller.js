const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/posts:
 *   get:
 *     summary: 获取文章列表（后台）
 *     tags: [Admin-Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 页码
 *         default: 1
 *       - in: query
 *         name: pageSize
 *         description: 每页大小
 *         default: 20
 *       - in: query
 *         name: search
 *         description: 搜索关键词
 *       - in: query
 *         name: category
 *         description: 分类ID
 *       - in: query
 *         name: user
 *         description: 用户ID
 *       - in: query
 *         name: status
 *         description: 文章状态
 *     responses:
 *       200: { description: 'Get posts successful' }
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 解析分页参数
    const { page, pageSize, skip, take } = paginationUtil.parsePagination(req.query);
    
    // 获取筛选条件
    const filters = {};
    if (req.query.search) {
      filters.search = req.query.search;
    }
    if (req.query.category && validate.isPositiveInteger(req.query.category)) {
      filters.categoryId = parseInt(req.query.category);
    }
    if (req.query.user && validate.isPositiveInteger(req.query.user)) {
      filters.userId = parseInt(req.query.user);
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // 注意：这里需要实现后台文章列表查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Get posts successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/posts:
 *   post:
 *     summary: 创建文章（后台）
 *     tags: [Admin-Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category_id
 *             properties:
 *               title: { type: string, description: '文章标题' }
 *               content: { type: string, description: '文章内容' }
 *               summary: { type: string, description: '文章摘要' }
 *               category_id: { type: integer, description: '分类ID' }
 *               tags: { type: array, items: { type: integer }, description: '标签ID列表' }
 *               cover_image: { type: string, description: '封面图片' }
 *               status: { type: string, description: '文章状态' }
 *     responses:
 *       200: { description: 'Create post successful' }
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 验证参数
    if (!req.body.title || req.body.title.trim().length === 0) {
      return errorResponse(res, 'Title is required');
    }
    
    if (!req.body.content || req.body.content.trim().length === 0) {
      return errorResponse(res, 'Content is required');
    }
    
    if (!req.body.category_id || !validate.isPositiveInteger(req.body.category_id)) {
      return errorResponse(res, 'Invalid category ID');
    }
    
    // 注意：这里需要实现文章创建逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Create post successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/posts/:id:
 *   get:
 *     summary: 获取文章详情（后台）
 *     tags: [Admin-Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     responses:
 *       200: { description: 'Get post successful' }
 *       404: { description: 'Post not found' }
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, 'Invalid post ID');
    }
    
    // 注意：这里需要实现后台文章详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const post = null;
    
    if (!post) {
      return notFoundResponse(res, 'Post not found');
    }
    
    return successResponse(res, post, 'Get post successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/posts/:id:
 *   put:
 *     summary: 更新文章（后台）
 *     tags: [Admin-Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, description: '文章标题' }
 *               content: { type: string, description: '文章内容' }
 *               summary: { type: string, description: '文章摘要' }
 *               category_id: { type: integer, description: '分类ID' }
 *               tags: { type: array, items: { type: integer }, description: '标签ID列表' }
 *               cover_image: { type: string, description: '封面图片' }
 *               status: { type: string, description: '文章状态' }
 *     responses:
 *       200: { description: 'Update post successful' }
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, 'Invalid post ID');
    }
    
    // 注意：这里需要实现文章更新逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update post successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/posts/:id:
 *   delete:
 *     summary: 删除文章（后台）
 *     tags: [Admin-Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     responses:
 *       200: { description: 'Delete post successful' }
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, 'Invalid post ID');
    }
    
    // 注意：这里需要实现文章删除逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Delete post successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/posts/:id/status:
 *   put:
 *     summary: 更新文章状态（后台）
 *     tags: [Admin-Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status: { type: string, description: '文章状态' }
 *     responses:
 *       200: { description: 'Update post status successful' }
 */
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const { status } = req.body;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, 'Invalid post ID');
    }
    
    if (!status) {
      return errorResponse(res, 'Status is required');
    }
    
    // 注意：这里需要实现文章状态更新逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update post status successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;