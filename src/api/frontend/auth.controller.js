const express = require('express');
const { loginLimiter, registerLimiter, verifyCodeLimiter } = require('../../middleware/limiter.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { successResponse, errorResponse } = require('../../core/response');
const { requestValidator } = require('../../utils/validator');
const AuthService = require('../../services/auth.service');

const router = express.Router();
const authService = new AuthService();

/**
 * @swagger
 * /api/frontend/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account
 *               - password
 *             properties:
 *               account: { type: string, description: '账号（邮箱）' }
 *               password: { type: string, description: '密码' }
 *     responses:
 *       200: { description: 'Login successful' }
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    // 验证请求参数
    const validation = requestValidator.login(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '));
    }

    // 获取客户端IP
    const ip = req.ip || req.connection.remoteAddress;

    // 调用登录服务
    const result = await authService.login(req.body.account, req.body.password, ip);
    
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/auth/register: 
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - verify_code
 *             properties:
 *               email: { type: string, description: '邮箱' }
 *               password: { type: string, description: '密码' }
 *               name: { type: string, description: '用户名' }
 *               verify_code: { type: string, description: '验证码' }
 *     responses:
 *       200: { description: 'Registration successful' }
 */
router.post('/register', registerLimiter, async (req, res) => {
  try {
    // 验证请求参数
    const validation = requestValidator.register(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '));
    }

    // 调用注册服务
    const user = await authService.register(req.body);
    
    return successResponse(res, user, 'Registration successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/auth/logout:
 *   post:
 *     summary: 用户登出
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 'Logout successful' }
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // 从Authorization头获取token
    const token = req.headers.authorization.split(' ')[1];
    
    // 调用登出服务
    await authService.logout(token);
    
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 'Get user info successful' }
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // 从请求中获取用户ID
    const userId = req.user.id;
    
    // 获取用户信息
    const user = await authService.getCurrentUser(userId);
    
    return successResponse(res, user, 'Get user info successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/auth/send-code:
 *   post:
 *     summary: 发送验证码
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - type
 *             properties:
 *               email: { type: string, description: '邮箱' }
 *               type: { type: string, description: '验证码类型: register/reset_password' }
 *     responses:
 *       200: { description: 'Verification code sent successfully' }
 */
router.post('/send-code', verifyCodeLimiter, async (req, res) => {
  try {
    // 验证请求参数
    const validation = requestValidator.sendCode(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '));
    }

    // 发送验证码
    await authService.sendVerificationCode(req.body.email, req.body.type);
    
    return successResponse(res, null, 'Verification code sent successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/auth/reset-password:
 *   post:
 *     summary: 重置密码
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verify_code
 *               - new_password
 *             properties:
 *               email: { type: string, description: '邮箱' }
 *               verify_code: { type: string, description: '验证码' }
 *               new_password: { type: string, description: '新密码' }
 *     responses:
 *       200: { description: 'Password reset successfully' }
 */
router.post('/reset-password', async (req, res) => {
  try {
    // 验证请求参数
    const validation = requestValidator.resetPassword(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '));
    }

    // 重置密码
    const { resetToken } = await authService.verifyCode(req.body.email, req.body.verify_code);
    await authService.resetPassword(resetToken, req.body.new_password);
    
    return successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;