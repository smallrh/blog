const express = require('express');
const { successResponse, errorResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const tagService = require('../../services/tag.service');

const router = express.Router();

/**
 * @swagger
 * /api/frontend/tags:
 *   get:
 *     summary: 获取标签列表
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 页码
 *         default: 1
 *       - in: query
 *         name: pageSize
 *         description: 每页数量
 *         default: 50
 *       - in: query
 *         name: hot
 *         description: 是否只返回热门标签
 *         default: false
 *     responses:
 *       200: { description: 'Success' }
 */
router.get('/', async (req, res) => {
  try {
    // 参数验证和默认值处理
    const page = validate.isPositiveInteger(req.query.page) ? parseInt(req.query.page) : 1;
    const pageSize = validate.isPositiveInteger(req.query.pageSize) ? parseInt(req.query.pageSize) : 50;
    const hot = req.query.hot === 'true';
    
    const result = await tagService.getTags(page, pageSize, hot);
    
    return successResponse(res, {
      count: result.count,
      list: result.list
    }, 'Success', result.page);
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/tags/hot:
 *   get:
 *     summary: 获取热门标签
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: 返回数量
 *         default: 20
 *     responses:
 *       200: { description: 'Success' }
 */
router.get('/hot', async (req, res) => {
  try {
    const limit = validate.isPositiveInteger(req.query.limit) ? parseInt(req.query.limit) : 20;
    
    const tags = await tagService.getHotTags(limit);
    
    return successResponse(res, {
      list: tags
    }, 'Success', {});
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/tags/:slug:
 *   get:
 *     summary: 获取标签详情
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: 标签别名
 *     responses:
 *       200: { description: 'Success' }
 *       404: { description: 'Tag not found' }
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    if (!slug) {
      return errorResponse(res, 'Invalid tag slug');
    }
    
    const tag = await tagService.getTagBySlug(slug);
    
    if (!tag) {
      return successResponse(res, null, 'Tag not found', {});
    }
    
    return successResponse(res, tag, 'Success', {});
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/tags/:slug/posts:
 *   get:
 *     summary: 获取标签下的文章
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: 标签别名
 *       - in: query
 *         name: page
 *         description: 页码
 *         default: 1
 *       - in: query
 *         name: pageSize
 *         description: 每页数量
 *         default: 10
 *     responses:
 *       200: { description: 'Success' }
 *       404: { description: 'Tag not found' }
 */
router.get('/:slug/posts', async (req, res) => {
  try {
    const slug = req.params.slug;
    const page = validate.isPositiveInteger(req.query.page) ? parseInt(req.query.page) : 1;
    const pageSize = validate.isPositiveInteger(req.query.pageSize) ? parseInt(req.query.pageSize) : 10;
    
    if (!slug) {
      return errorResponse(res, 'Invalid tag slug');
    }
    
    const result = await tagService.getPostsByTagSlug(slug, page, pageSize);
    
    return successResponse(res, {
      tag: result.tag,
      count: result.count,
      list: result.list
    }, 'Success', result.page);
  } catch (error) {
    if (error.message === 'Tag not found') {
      return successResponse(res, null, 'Tag not found', {});
    }
    return errorResponse(res, error.message);
  }
});

module.exports = router;