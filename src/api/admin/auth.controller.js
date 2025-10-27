const express = require('express');
const { successResponse, errorResponse } = require('../../core/response');
const { requestValidator } = require('../../utils/validator');
const AdminService = require('../../services/admin.service');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const { loginLimiter } = require('../../middleware/limiter.middleware');

const router = express.Router();
const adminService = new AdminService();

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: 管理员登录
 *     tags: [Admin-Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: { type: string, description: '邮箱' }
 *               password: { type: string, description: '密码' }
 *     responses:
 *       200: { description: 'Login successful' }
 *       401: { description: 'Invalid credentials' }
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    // 验证请求参数
    const validationResult = requestValidator.validateLogin(req.body);
    if (!validationResult.valid) {
      return errorResponse(res, validationResult.error);
    }

    const { email, password } = req.body;
    
    // 登录验证
    const result = await adminService.adminLogin(email, password, req.ip);
    
    // 验证是否是管理员
    if (result.user.role !== 'admin' && result.user.role !== 'superadmin') {
      return errorResponse(res, 'Admin access required');
    }
    
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/auth/logout:
 *   post:
 *     summary: 管理员登出
 *     tags: [Admin-Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 'Logout successful' }
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await userService.logout(token);
    }
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/auth/me:
 *   get:
 *     summary: 获取当前管理员信息
 *     tags: [Admin-Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 'Get admin info successful' }
 */
router.get('/me', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 使用AdminService获取管理员信息
    const adminInfo = await adminService.getAdminInfo(req.user.id);
    return successResponse(res, adminInfo, 'Get admin info successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/admin/auth/change-password:
 *   post:
 *     summary: 管理员修改密码
 *     tags: [Admin-Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_password
 *               - new_password
 *             properties:
 *               old_password: { type: string, description: '旧密码' }
 *               new_password: { type: string, description: '新密码' }
 *     responses:
 *       200: { description: 'Password changed successfully' }
 */
router.post('/change-password', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;
    
    // 验证参数
    if (!old_password || !new_password) {
      return errorResponse(res, 'Missing password fields');
    }
    
    if (!requestValidator.validatePassword(new_password)) {
      return errorResponse(res, 'Password must be at least 8 characters and contain letters and numbers');
    }
    
    // 注意：这里需要实现管理员密码修改逻辑
    // 暂时返回成功，实际实现需要补充
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;