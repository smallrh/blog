const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/tags:
 *   get:
 *     summary: 获取标签列表（后台）
 *     tags: [Admin-Tags]
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
 *         name: search
 *         description: 搜索关键词
 *     responses:
 *       200: { description: 'Get tags successful' }
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
    
    // 注意：这里需要实现后台标签列表查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Get tags successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/tags:
 *   post:
 *     summary: 创建标签（后台）
 *     tags: [Admin-Tags]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name: { type: string, description: '标签名称' }
 *               slug: { type: string, description: '标签别名' }
 *               sort: { type: integer, description: '排序' }
 *     responses:
 *       200: { description: 'Create tag successful' }
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 验证参数
    if (!req.body.name || req.body.name.trim().length === 0) {
      return errorResponse(res, 'Tag name is required');
    }
    
    if (req.body.slug && !validate.slug(req.body.slug)) {
      return errorResponse(res, 'Invalid slug format');
    }
    
    // 注意：这里需要实现标签创建逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Create tag successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/tags/:id:
 *   get:
 *     summary: 获取标签详情（后台）
 *     tags: [Admin-Tags]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 标签ID
 *     responses:
 *       200: { description: 'Get tag successful' }
 *       404: { description: 'Tag not found' }
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tagId = req.params.id;
    
    if (!validate.isPositiveInteger(tagId)) {
      return errorResponse(res, 'Invalid tag ID');
    }
    
    // 注意：这里需要实现后台标签详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const tag = null;
    
    if (!tag) {
      return notFoundResponse(res, 'Tag not found');
    }
    
    return successResponse(res, tag, 'Get tag successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/tags/:id:
 *   put:
 *     summary: 更新标签（后台）
 *     tags: [Admin-Tags]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 标签ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: '标签名称' }
 *               slug: { type: string, description: '标签别名' }
 *               sort: { type: integer, description: '排序' }
 *     responses:
 *       200: { description: 'Update tag successful' }
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tagId = req.params.id;
    
    if (!validate.isPositiveInteger(tagId)) {
      return errorResponse(res, 'Invalid tag ID');
    }
    
    // 验证参数
    if (req.body.name && req.body.name.trim().length === 0) {
      return errorResponse(res, 'Tag name cannot be empty');
    }
    
    if (req.body.slug && !validate.slug(req.body.slug)) {
      return errorResponse(res, 'Invalid slug format');
    }
    
    // 注意：这里需要实现标签更新逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update tag successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/tags/:id:
 *   delete:
 *     summary: 删除标签（后台）
 *     tags: [Admin-Tags]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 标签ID
 *     responses:
 *       200: { description: 'Delete tag successful' }
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tagId = req.params.id;
    
    if (!validate.isPositiveInteger(tagId)) {
      return errorResponse(res, 'Invalid tag ID');
    }
    
    // 注意：这里需要实现标签删除逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Delete tag successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;