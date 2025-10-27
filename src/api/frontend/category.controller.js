const express = require('express');
const { successResponse, errorResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');

const router = express.Router();

/**
 * @swagger
 * /api/frontend/categories:
 *   get:
 *     summary: 获取分类列表
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: withPostCount
 *         description: 是否包含文章数量
 *         default: false
 *       - in: query
 *         name: withHot
 *         description: 是否获取热门分类
 *         default: false
 *     responses:
 *       200: { description: 'Get categories successful' }
 */
router.get('/', async (req, res) => {
  try {
    const withPostCount = req.query.withPostCount === 'true';
    const withHot = req.query.withHot === 'true';
    
    // 注意：这里需要实现分类列表查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, [], 'Get categories successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/categories/:id:
 *   get:
 *     summary: 获取分类详情
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 分类ID
 *     responses:
 *       200: { description: 'Get category successful' }
 *       404: { description: 'Category not found' }
 */
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    if (!validate.isPositiveInteger(categoryId)) {
      return errorResponse(res, 'Invalid category ID');
    }
    
    // 注意：这里需要实现分类详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const category = null;
    
    if (!category) {
      return successResponse(res, null, 'Category not found');
    }
    
    return successResponse(res, category, 'Get category successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/categories/:slug:
 *   get:
 *     summary: 通过slug获取分类
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: 分类slug
 *     responses:
 *       200: { description: 'Get category by slug successful' }
 *       404: { description: 'Category not found' }
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    if (!slug || !validate.slug(slug)) {
      return errorResponse(res, 'Invalid category slug');
    }
    
    // 注意：这里需要实现通过slug查询分类的逻辑
    // 暂时返回空对象，实际实现需要补充
    const category = null;
    
    if (!category) {
      return successResponse(res, null, 'Category not found');
    }
    
    return successResponse(res, category, 'Get category by slug successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;