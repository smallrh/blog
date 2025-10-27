const express = require('express');
const { successResponse, errorResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: 获取系统设置（后台）
 *     tags: [Admin-Settings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 'Get settings successful' }
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 注意：这里需要实现获取系统设置逻辑
    // 暂时返回空对象，实际实现需要补充
    return successResponse(res, {}, 'Get settings successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: 更新系统设置（后台）
 *     tags: [Admin-Settings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_name: { type: string, description: '网站名称' }
 *               site_description: { type: string, description: '网站描述' }
 *               site_logo: { type: string, description: '网站Logo' }
 *               site_favicon: { type: string, description: '网站图标' }
 *               site_keywords: { type: string, description: '网站关键词' }
 *               site_copyright: { type: string, description: '网站版权' }
 *               post_page_size: { type: integer, description: '文章列表页大小' }
 *               comment_page_size: { type: integer, description: '评论列表页大小' }
 *     responses:
 *       200: { description: 'Update settings successful' }
 */
router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 验证数值类型参数
    if (req.body.post_page_size && !validate.isPositiveInteger(req.body.post_page_size)) {
      return errorResponse(res, 'Invalid post page size');
    }
    
    if (req.body.comment_page_size && !validate.isPositiveInteger(req.body.comment_page_size)) {
      return errorResponse(res, 'Invalid comment page size');
    }
    
    // 注意：这里需要实现更新系统设置逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update settings successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/settings/:key:
 *   get:
 *     summary: 获取指定设置项（后台）
 *     tags: [Admin-Settings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: 设置项键名
 *     responses:
 *       200: { description: 'Get setting successful' }
 */
router.get('/:key', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const key = req.params.key;
    
    if (!key) {
      return errorResponse(res, 'Setting key is required');
    }
    
    // 注意：这里需要实现获取指定设置项逻辑
    // 暂时返回null，实际实现需要补充
    return successResponse(res, null, 'Get setting successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/settings/:key:
 *   put:
 *     summary: 更新指定设置项（后台）
 *     tags: [Admin-Settings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: 设置项键名
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value: { description: '设置项值' }
 *     responses:
 *       200: { description: 'Update setting successful' }
 */
router.put('/:key', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const key = req.params.key;
    const { value } = req.body;
    
    if (!key) {
      return errorResponse(res, 'Setting key is required');
    }
    
    if (value === undefined) {
      return errorResponse(res, 'Setting value is required');
    }
    
    // 注意：这里需要实现更新指定设置项逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update setting successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;