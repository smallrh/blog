const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: 获取分类列表（后台）
 *     tags: [Admin-Categories]
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
 *       200: { description: 'Get categories successful' }
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
    
    // 注意：这里需要实现后台分类列表查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Get categories successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: 创建分类（后台）
 *     tags: [Admin-Categories]
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
 *               name: { type: string, description: '分类名称' }
 *               slug: { type: string, description: '分类别名' }
 *               description: { type: string, description: '分类描述' }
 *               sort: { type: integer, description: '排序' }
 *     responses:
 *       200: { description: 'Create category successful' }
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 验证参数
    if (!req.body.name || req.body.name.trim().length === 0) {
      return errorResponse(res, 'Category name is required');
    }
    
    if (req.body.slug && !validate.slug(req.body.slug)) {
      return errorResponse(res, 'Invalid slug format');
    }
    
    // 注意：这里需要实现分类创建逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Create category successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/categories/:id:
 *   get:
 *     summary: 获取分类详情（后台）
 *     tags: [Admin-Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 分类ID
 *     responses:
 *       200: { description: 'Get category successful' }
 *       404: { description: 'Category not found' }
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    if (!validate.isPositiveInteger(categoryId)) {
      return errorResponse(res, 'Invalid category ID');
    }
    
    // 注意：这里需要实现后台分类详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const category = null;
    
    if (!category) {
      return notFoundResponse(res, 'Category not found');
    }
    
    return successResponse(res, category, 'Get category successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/categories/:id:
 *   put:
 *     summary: 更新分类（后台）
 *     tags: [Admin-Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 分类ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: '分类名称' }
 *               slug: { type: string, description: '分类别名' }
 *               description: { type: string, description: '分类描述' }
 *               sort: { type: integer, description: '排序' }
 *     responses:
 *       200: { description: 'Update category successful' }
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    if (!validate.isPositiveInteger(categoryId)) {
      return errorResponse(res, 'Invalid category ID');
    }
    
    // 验证参数
    if (req.body.name && req.body.name.trim().length === 0) {
      return errorResponse(res, 'Category name cannot be empty');
    }
    
    if (req.body.slug && !validate.slug(req.body.slug)) {
      return errorResponse(res, 'Invalid slug format');
    }
    
    // 注意：这里需要实现分类更新逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update category successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/categories/:id:
 *   delete:
 *     summary: 删除分类（后台）
 *     tags: [Admin-Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 分类ID
 *     responses:
 *       200: { description: 'Delete category successful' }
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    if (!validate.isPositiveInteger(categoryId)) {
      return errorResponse(res, 'Invalid category ID');
    }
    
    // 注意：这里需要实现分类删除逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Delete category successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;