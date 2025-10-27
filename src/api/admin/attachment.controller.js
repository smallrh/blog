const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/attachments:
 *   get:
 *     summary: 获取附件列表（后台）
 *     tags: [Admin-Attachments]
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
 *         name: type
 *         description: 文件类型
 *       - in: query
 *         name: user
 *         description: 上传用户ID
 *     responses:
 *       200: { description: 'Get attachments successful' }
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 解析分页参数
    const { page, pageSize, skip, take } = paginationUtil.parsePagination(req.query);
    
    // 获取筛选条件
    const filters = {};
    if (req.query.type) {
      filters.type = req.query.type;
    }
    if (req.query.user && validate.isPositiveInteger(req.query.user)) {
      filters.userId = parseInt(req.query.user);
    }
    
    // 注意：这里需要实现后台附件列表查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Get attachments successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/attachments/upload:
 *   post:
 *     summary: 上传附件（后台）
 *     tags: [Admin-Attachments]
 *     security: [{ bearerAuth: [] }]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: 要上传的文件
 *     responses:
 *       200: { description: 'Upload file successful' }
 */
router.post('/upload', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 注意：这里需要实现文件上传逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, { url: '/uploads/example.jpg' }, 'Upload file successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/attachments/:id:
 *   get:
 *     summary: 获取附件详情（后台）
 *     tags: [Admin-Attachments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 附件ID
 *     responses:
 *       200: { description: 'Get attachment successful' }
 *       404: { description: 'Attachment not found' }
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const attachmentId = req.params.id;
    
    if (!validate.isPositiveInteger(attachmentId)) {
      return errorResponse(res, 'Invalid attachment ID');
    }
    
    // 注意：这里需要实现后台附件详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const attachment = null;
    
    if (!attachment) {
      return notFoundResponse(res, 'Attachment not found');
    }
    
    return successResponse(res, attachment, 'Get attachment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/attachments/:id:
 *   delete:
 *     summary: 删除附件（后台）
 *     tags: [Admin-Attachments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 附件ID
 *     responses:
 *       200: { description: 'Delete attachment successful' }
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const attachmentId = req.params.id;
    
    if (!validate.isPositiveInteger(attachmentId)) {
      return errorResponse(res, 'Invalid attachment ID');
    }
    
    // 注意：这里需要实现附件删除逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Delete attachment successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;