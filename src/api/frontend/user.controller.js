const express = require('express');
const UserService = require('../../services/user.service');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { successResponse, errorResponse, notFoundResponse } = require('../../core/response');
const { validate } = require('../../utils/validator');
const { redis } = require('../../core/redis');

const router = express.Router();
const userService = new UserService();

/**
 * @swagger
 * /api/frontend/users/:id:
 *   get:
 *     summary: 获取用户信息
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200: { description: 'Get user info successful' }
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!validate.isPositiveInteger(userId)) {
      return errorResponse(res, 'Invalid user ID');
    }

    const user = await userService.getUserInfo(parseInt(userId));
    return successResponse(res, user, 'Get user info successful');
  } catch (error) {
    if (error.message === 'User not found') {
      return notFoundResponse(res, 'User not found');
    }
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/users/profile:
 *   post:
 *     summary: 更新用户信息
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: '用户名' }
 *               avatar: { type: string, description: '头像URL' }
 *               bio: { type: string, description: '个人简介' }
 *     responses:
 *       200: { description: 'Update profile successful' }
 */
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {};

    // 验证并设置更新字段
    if (req.body.name) {
      if (!validate.length(req.body.name, 2, 50)) {
        return errorResponse(res, 'Name length must be between 2 and 50 characters');
      }
      updateData.name = req.body.name;
    }

    if (req.body.avatar) {
      updateData.avatar = req.body.avatar;
    }

    if (req.body.bio) {
      updateData.bio = req.body.bio;
    }

    // 如果没有需要更新的字段
    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 'No data to update');
    }

    // 更新用户信息
    const updatedUser = await userService.updateProfile(userId, updateData);
    
    return successResponse(res, updatedUser, 'Update profile successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/users/change-password:
 *   post:
 *     summary: 修改密码（邮箱验证）
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
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
 *       200: { description: 'Password changed successfully' }
 */
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, verify_code, new_password } = req.body;

    // 验证参数
    if (!email || !validate.email(email)) {
      return errorResponse(res, 'Invalid email');
    }

    if (!verify_code || !validate.verificationCode(verify_code)) {
      return errorResponse(res, 'Invalid verification code');
    }

    if (!new_password || !validate.password(new_password)) {
      return errorResponse(res, 'Password must be at least 8 characters and contain letters and numbers');
    }

    // 调用修改密码服务
    await userService.changePassword(userId, email, verify_code, new_password);
    
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    if (error.message === 'Invalid verification code') {
      return errorResponse(res, 'Invalid verification code');
    } else if (error.message === 'Email does not match user account') {
      return errorResponse(res, 'Email does not match user account');
    }
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/users/:id/posts:
 *   get:
 *     summary: 获取用户发布的文章
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 用户ID
 *       - in: query
 *         name: page
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         description: 每页大小
 *     responses:
 *       200: { description: 'Get user posts successful' }
 */
router.get('/:id/posts', async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    if (!validate.isPositiveInteger(userId)) {
      return errorResponse(res, 'Invalid user ID');
    }

    // 从Redis缓存中获取用户文章
    const cacheKey = `blog:user:${userId}:posts:${page}:${pageSize}`;
    const cachedPosts = await redis.get(cacheKey);
    
    if (cachedPosts) {
      return successResponse(res, JSON.parse(cachedPosts), 'Get user posts successful');
    }
    
    // 获取用户基本信息
    const user = await userService.getUserInfo(parseInt(userId));
    
    // 调用服务层获取用户文章
    const userPosts = await userService.getUserPosts(parseInt(userId), page, pageSize);
    
    const posts = {
      user: {
        id: user.user.id,
        name: user.user.name,
        avatar: user.user.avatar
      },
      count: userPosts.count,
      list: userPosts.list
    };
    
    const response = {
      ...posts,
      page: {
        current: page,
        pageSize: pageSize,
        total: 0,
        totalPages: 0
      }
    };
    
    // 缓存结果（5分钟）
    await redis.set(cacheKey, JSON.stringify(response), 300);
    
    return successResponse(res, response, 'Get user posts successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

/**
 * @swagger
 * /api/frontend/users/collections:
 *   get:
 *     summary: 获取用户收藏的文章
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         description: 每页大小
 *     responses:
 *       200: { description: 'Get user collections successful' }
 */
router.get('/collections', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    // 从Redis缓存中获取用户收藏
    const cacheKey = `blog:user:${userId}:collections:${page}:${pageSize}`;
    const cachedCollections = await redis.get(cacheKey);
    
    if (cachedCollections) {
      return successResponse(res, JSON.parse(cachedCollections), 'Get user collections successful');
    }
    
    // 调用服务层获取用户收藏文章
    const collections = await userService.getUserCollections(userId, page, pageSize);
    
    const response = {
      ...collections,
      page: {
        current: page,
        pageSize: pageSize,
        total: 0,
        totalPages: 0
      }
    };
    
    // 缓存结果（5分钟）
    await redis.set(cacheKey, JSON.stringify(response), 300);
    
    return successResponse(res, response, 'Get user collections successful');
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

module.exports = router;