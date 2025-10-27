const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');

const router = express.Router();

/**
 * @swagger
 * /api/frontend/posts:
 *   get:
 *     summary: 获取文章列表
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 页码
 *         default: 1
 *       - in: query
 *         name: pageSize
 *         description: 每页大小
 *         default: 10
 *       - in: query
 *         name: category
 *         description: 分类ID
 *       - in: query
 *         name: tag
 *         description: 标签ID
 *       - in: query
 *         name: search
 *         description: 搜索关键词
 *     responses:
 *       200: { description: 'Get posts successful' }
 */
router.get('/', async (req, res) => {
  try {
    // 解析分页参数
    const { page, pageSize, skip, take } = paginationUtil.parsePagination(req.query);
    
    // 获取筛选条件
    const filters = {};
    if (req.query.category && validate.isPositiveInteger(req.query.category)) {
      filters.categoryId = parseInt(req.query.category);
    }
    if (req.query.tag && validate.isPositiveInteger(req.query.tag)) {
      filters.tagId = parseInt(req.query.tag);
    }
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    // 注意：这里需要实现文章列表查询逻辑
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
 * /api/frontend/posts/hot:
 *   get:
 *     summary: 获取热门文章
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: 返回数量
 *         default: 10
 *     responses:
 *       200: { description: 'Get hot posts successful' }
 */
router.get('/hot', async (req, res) => {
  try {
    const limit = req.query.limit && validate.isPositiveInteger(req.query.limit) 
      ? parseInt(req.query.limit) 
      : 10;
    
    // 注意：这里需要实现热门文章查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, [], 'Get hot posts successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/posts/latest:
 *   get:
 *     summary: 获取最新文章
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: 返回数量
 *         default: 10
 *     responses:
 *       200: { description: 'Get latest posts successful' }
 */
router.get('/latest', async (req, res) => {
  try {
    const limit = req.query.limit && validate.isPositiveInteger(req.query.limit) 
      ? parseInt(req.query.limit) 
      : 10;
    
    // 注意：这里需要实现最新文章查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, [], 'Get latest posts successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/posts/:id:
 *   get:
 *     summary: 获取文章详情
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     responses:
 *       200: { description: 'Get post successful' }
 *       404: { description: 'Post not found' }
 */
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, 'Invalid post ID');
    }
    
    // 注意：这里需要实现文章详情查询逻辑
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
 * /api/frontend/posts/:id/like:
 *   post:
 *     summary: 点赞文章
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     responses:
 *       200: { description: 'Like post successful' }
 *       404: { description: 'Post not found' }
 */
router.post('/:id/like', async (req, res) => {
  try {
    // 注意：这里需要实现文章点赞逻辑，包括用户认证
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Like post successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/posts/:id/collection:
 *   post:
 *     summary: 收藏文章
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     responses:
 *       200: { description: 'Collect post successful' }
 *       404: { description: 'Post not found' }
 */
router.post('/:id/collection', async (req, res) => {
  try {
    // 注意：这里需要实现文章收藏逻辑，包括用户认证
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Collect post successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/posts/:id/comments:
 *   get:
 *     summary: 获取文章评论
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
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
 *       200: { description: 'Get post comments successful' }
 *       404: { description: 'Post not found' }
 */
router.get('/:id/comments', async (req, res) => {
  try {
    // 解析分页参数
    const { page, pageSize, skip, take } = paginationUtil.parsePagination(req.query);
    
    // 注意：这里需要实现文章评论查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Get post comments successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;