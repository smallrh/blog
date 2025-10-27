const express = require('express');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { paginationUtil } = require('../../utils/pagination');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const UserService = require('../../services/user.service');

const router = express.Router();
const userService = new UserService();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: 获取用户列表（后台）
 *     tags: [Admin-Users]
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
 *         description: 搜索关键词（邮箱、用户名）
 *       - in: query
 *         name: role
 *         description: 用户角色
 *       - in: query
 *         name: status
 *         description: 用户状态
 *     responses:
 *       200: { description: 'Get users successful' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
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
    if (req.query.role) {
      filters.role = req.query.role;
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // 注意：这里需要实现后台用户列表查询逻辑
    // 暂时返回空数组，实际实现需要补充
    return successResponse(res, {
      list: [],
      pagination: paginationUtil.generatePagination(page, pageSize, 0)
    }, 'Get users successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/users/:id:
 *   get:
 *     summary: 获取用户详情（后台）
 *     tags: [Admin-Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200: { description: 'Get user successful' }
 *       404: { description: 'User not found' }
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!validate.isPositiveInteger(userId)) {
      return errorResponse(res, 'Invalid user ID');
    }
    
    // 注意：这里需要实现后台用户详情查询逻辑
    // 暂时返回空对象，实际实现需要补充
    const user = null;
    
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }
    
    return successResponse(res, user, 'Get user successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/users/:id:
 *   put:
 *     summary: 更新用户信息（后台）
 *     tags: [Admin-Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: '用户名' }
 *               role: { type: string, description: '用户角色' }
 *               status: { type: string, description: '用户状态' }
 *     responses:
 *       200: { description: 'Update user successful' }
 *       403: { description: 'Forbidden' }
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!validate.isPositiveInteger(userId)) {
      return errorResponse(res, 'Invalid user ID');
    }
    
    // 注意：这里需要实现后台用户信息更新逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Update user successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/users/:id:
 *   delete:
 *     summary: 删除用户（后台）
 *     tags: [Admin-Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200: { description: 'Delete user successful' }
 *       403: { description: 'Forbidden' }
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!validate.isPositiveInteger(userId)) {
      return errorResponse(res, 'Invalid user ID');
    }
    
    // 注意：这里需要实现后台用户删除逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Delete user successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/users/:id/reset-password:
 *   post:
 *     summary: 重置用户密码（后台）
 *     tags: [Admin-Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200: { description: 'Reset password successful' }
 */
router.post('/:id/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!validate.isPositiveInteger(userId)) {
      return errorResponse(res, 'Invalid user ID');
    }
    
    // 注意：这里需要实现后台用户密码重置逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, { newPassword: '123456' }, 'Reset password successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;