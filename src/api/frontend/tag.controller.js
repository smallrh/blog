const express = require('express');
const { successResponse, errorResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');

const router = express.Router();

/**
 * @swagger
 * /api/frontend/tags:
 *   get:
 *     summary: 获取标签列表
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: withPostCount
 *         description: 是否包含文章数量
 *         default: false
 *       - in: query
 *         name: limit
 *         description: 返回数量限制
 *       - in: query
 *         name: hot
 *         description: 是否获取热门标签
 *         default: false
 *     responses:
 *       200: { description: 'Get tags successful' }
 */
router.get('/', async (req, res) => {
  try {
    const withPostCount = req.query.withPostCount === 'true';
    const hot = req.query.hot === 'true';
    let limit = null;
    
    if (req.query.limit && validate.isPositiveInteger(req.query.limit)) {
      limit = parseInt(req.query.limit);
    }
    
    // 注意：这里需要实现标签列表查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, [], 'Get tags successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/tags/:id:
 *   get:
 *     summary: 获取标签详情
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 标签ID
 *     responses:
 *       200: { description: 'Get tag successful' }
 *       404: { description: 'Tag not found' }
 */
router.get('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;
    
    if (!validate.isPositiveInteger(tagId)) {
      return errorResponse(res, 'Invalid tag ID');
    }
    
    // 注意：这里需要实现标签详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const tag = null;
    
    if (!tag) {
      return successResponse(res, null, 'Tag not found');
    }
    
    return successResponse(res, tag, 'Get tag successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/tags/:slug:
 *   get:
 *     summary: 通过slug获取标签
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: 标签slug
 *     responses:
 *       200: { description: 'Get tag by slug successful' }
 *       404: { description: 'Tag not found' }
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    if (!slug || !validate.slug(slug)) {
      return errorResponse(res, 'Invalid tag slug');
    }
    
    // 注意：这里需要实现通过slug查询标签的逻辑
    // 暂时返回空对象，实际实现需要补充
    const tag = null;
    
    if (!tag) {
      return successResponse(res, null, 'Tag not found');
    }
    
    return successResponse(res, tag, 'Get tag by slug successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;