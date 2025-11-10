const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const validate = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const PostService = require('../../services/post.service');
const { authenticateToken } = require('../../middleware/auth.middleware');

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
 *         name: category_id
 *         description: 分类ID
 *       - in: query
 *         name: tag_id
 *         description: 标签ID
 *       - in: query
 *         name: search
 *         description: 搜索关键词
 *       - in: query
 *         name: order
 *         description: 排序字段
 *         default: "created_at"
 *       - in: query
 *         name: sort
 *         description: 排序方向（asc/desc）
 *         default: "desc"
 *     responses:
 *       200: { description: '获取文章列表成功' }
 */
router.get('/', async (req, res) => {
  try {
    // 解析分页参数
    const { page, pageSize } = paginationUtil.parsePagination(req.query);
    
    // 获取筛选条件
    const filters = {};
    if (req.query.category_id && validate.isPositiveInteger(req.query.category_id)) {
      filters.categoryId = parseInt(req.query.category_id);
    }
    if (req.query.tag_id && validate.isPositiveInteger(req.query.tag_id)) {
      filters.tagId = parseInt(req.query.tag_id);
    }
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const result = await PostService.getPosts(page, pageSize, filters);
    
    return successResponse(res, {
      count: result.pagination.total,
      list: result.list
    }, 'Success', {
      page: page,
      pageSize: pageSize,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages
    });
  } catch (error) {
    return errorResponse(res, error.message || '获取文章列表失败');
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
 *         default: 5
 *     responses:
 *       200: { description: '获取热门文章成功' }
 */
router.get('/hot', async (req, res) => {
  try {
    const limit = req.query.limit && validate.isPositiveInteger(req.query.limit) 
      ? parseInt(req.query.limit) 
      : 5;
    
    const posts = await PostService.getHotPosts(limit);
    
    return successResponse(res, {
      list: posts
    }, 'Success');
  } catch (error) {
    return errorResponse(res, error.message || '获取热门文章失败');
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
 *       200: { description: '获取最新文章成功' }
 */
router.get('/latest', async (req, res) => {
  try {
    const limit = req.query.limit && validate.isPositiveInteger(req.query.limit) 
      ? parseInt(req.query.limit) 
      : 10;
    
    // 使用getPosts方法获取最新文章，限制数量
    const result = await PostService.getPosts(1, limit, {});
    
    return successResponse(res, {
      list: result.list
    }, 'Success');
  } catch (error) {
    return errorResponse(res, error.message || '获取最新文章失败');
  }
});

/**
 * @swagger
 * /api/frontend/posts/:slug:
 *   get:
 *     summary: 获取文章详情
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: 文章别名或ID
 *     responses:
 *       200: { description: '获取文章详情成功' }
 *       404: { description: '文章不存在' }
 */
router.get('/:slug', async (req, res) => {
  try {
    const identifier = req.params.slug;
    
    const post = await PostService.getPostDetail(identifier);
    
    if (!post) {
      return notFoundResponse(res, '文章不存在');
    }
    
    return successResponse(res, post, 'Success');
  } catch (error) {
    return errorResponse(res, error.message || '获取文章详情失败');
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
 *       200: { description: '点赞成功' }
 *       404: { description: '文章不存在' }
 *       401: { description: '未授权' }
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, '无效的文章ID');
    }
    
    const result = await PostService.likePost(parseInt(postId), userId);
    
    return successResponse(res, result, 'Success');
  } catch (error) {
    if (error.message === '文章不存在') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || '点赞操作失败');
  }
});

/**
 * @swagger
 * /api/frontend/posts/:id/unlike:
 *   post:
 *     summary: 取消点赞
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *     responses:
 *       200: { description: '取消点赞成功' }
 *       404: { description: '文章不存在' }
 *       401: { description: '未授权' }
 */
router.post('/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, '无效的文章ID');
    }
    
    const result = await PostService.unlikePost(parseInt(postId), userId);
    
    return successResponse(res, result, 'Success');
  } catch (error) {
    if (error.message === '文章不存在') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || '取消点赞操作失败');
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
 *       200: { description: '收藏成功' }
 *       404: { description: '文章不存在' }
 *       401: { description: '未授权' }
 */
router.post('/:id/collection', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, '无效的文章ID');
    }
    
    const result = await PostService.collectPost(parseInt(postId), userId);
    
    return successResponse(res, result, 'Success');
  } catch (error) {
    if (error.message === '文章不存在') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || '收藏操作失败');
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
 *       200: { description: '获取文章评论成功' }
 *       404: { description: '文章不存在' }
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!validate.isPositiveInteger(postId)) {
      return errorResponse(res, '无效的文章ID');
    }
    
    // 解析分页参数
    const { page, pageSize } = paginationUtil.parsePagination(req.query);
    
    // 这里可以调用评论服务获取文章评论
    // 暂时返回空数组，实际项目中可以集成CommentService
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Success');
  } catch (error) {
    return errorResponse(res, error.message || '获取文章评论失败');
  }
});

module.exports = router;