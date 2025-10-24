const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken } = require('../middlewares/auth');
const router = express.Router();

// 公开路由（不需要认证）
// 用户登录
router.post('/login', UserController.login);
// 刷新token
router.post('/refresh-token', UserController.refreshToken);

// 需要认证的路由
// 获取用户列表
router.get('/list', authenticateToken, UserController.getUsers);

// 获取用户详情
router.get('/detail/:id', authenticateToken, UserController.getUserById);

// 创建用户
router.post('/create', authenticateToken, UserController.createUser);

// 更新用户
  router.put('/update/:id', authenticateToken, UserController.updateUser);
  
  // 删除用户
  router.delete('/delete/:id', authenticateToken, UserController.deleteUser);

// 根据用户名查询用户
router.get('/search', authenticateToken, UserController.getUserByUsername);

// 用户相关操作
// 登出
router.post('/logout', authenticateToken, UserController.logout);

// 获取当前用户信息
router.get('/current', authenticateToken, UserController.getCurrentUser);

module.exports = router;