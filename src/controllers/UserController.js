const UserService = require('../services/UserService');
const { STATUS_CODES, MESSAGES } = require('../constants/appConstants');
const { authenticateToken } = require('../middlewares/auth');

class UserController {
  // 获取用户列表
  static async getUsers(req, res, next) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const users = await UserService.getUsers(parseInt(page), parseInt(pageSize));
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: {
          count: users.total,
          list: users.list
        },
        page: {
          page: users.page,
          pageSize: users.pageSize,
          totalPages: users.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 获取用户详情
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          code: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.NOT_FOUND,
          data: null,
          page: {}
        });
      }
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: user,
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 创建用户
  static async createUser(req, res, next) {
    try {
      const userData = req.body;
      
      // 验证必要字段
      if (!userData.id || !userData.username) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          code: STATUS_CODES.BAD_REQUEST,
          message: 'Missing required fields: id and username',
          data: null,
          page: {}
        });
      }
      
      const newUser = await UserService.createUser(userData);
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: newUser,
        page: {}
      });
    } catch (error) {
      if (error.message === 'User ID already exists') {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          code: STATUS_CODES.BAD_REQUEST,
          message: error.message,
          data: null,
          page: {}
        });
      }
      next(error);
    }
  }
  
  // 更新用户
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const updatedUser = await UserService.updateUser(id, userData);
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: updatedUser,
        page: {}
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          code: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.NOT_FOUND,
          data: null,
          page: {}
        });
      }
      next(error);
    }
  }
  
  // 删除用户
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      
      if (!result) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          code: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.NOT_FOUND,
          data: null,
          page: {}
        });
      }
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: { success: true },
        page: {}
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          code: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.NOT_FOUND,
          data: null,
          page: {}
        });
      }
      next(error);
    }
  }
  
  // 根据用户名查询用户
  static async getUserByUsername(req, res, next) {
    try {
      const { username } = req.query;
      
      if (!username) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          code: STATUS_CODES.BAD_REQUEST,
          message: 'Username is required',
          data: null,
          page: {}
        });
      }
      
      const user = await UserService.getUserByUsername(username);
      
      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          code: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.NOT_FOUND,
          data: null,
          page: {}
        });
      }
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: user,
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 用户登录
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      // 验证输入
      if (!username || !password) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          code: STATUS_CODES.BAD_REQUEST,
          message: '用户名和密码不能为空',
          data: null,
          page: {}
        });
      }
      
      // 执行登录
      const result = await UserService.login(username, password);
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: '登录成功',
        data: result,
        page: {}
      });
    } catch (error) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        code: STATUS_CODES.UNAUTHORIZED,
        message: error.message || '登录失败',
        data: null,
        page: {}
      });
    }
  }
  
  // 用户登出
  static async logout(req, res, next) {
    try {
      if (!req.userId) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          code: STATUS_CODES.UNAUTHORIZED,
          message: '用户未登录',
          data: null,
          page: {}
        });
      }
      
      await UserService.logout(req.userId);
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: '登出成功',
        data: { success: true },
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 刷新access token
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          code: STATUS_CODES.BAD_REQUEST,
          message: 'refresh token不能为空',
          data: null,
          page: {}
        });
      }
      
      const newAccessToken = await UserService.refreshAccessToken(refreshToken);
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: '刷新token成功',
        data: { accessToken: newAccessToken },
        page: {}
      });
    } catch (error) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        code: STATUS_CODES.UNAUTHORIZED,
        message: error.message || '刷新token失败',
        data: null,
        page: {}
      });
    }
  }
  
  // 获取当前登录用户信息
  static async getCurrentUser(req, res, next) {
    try {
      if (!req.userId) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          code: STATUS_CODES.UNAUTHORIZED,
          message: '用户未登录',
          data: null,
          page: {}
        });
      }
      
      const user = await UserService.getUserById(req.userId);
      
      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          code: STATUS_CODES.NOT_FOUND,
          message: '用户不存在',
          data: null,
          page: {}
        });
      }
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: user,
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;