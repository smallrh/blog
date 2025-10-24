const UserService = require('../services/UserService');
const { STATUS_CODES } = require('../constants/appConstants');

// JWT认证中间件
async function authenticateToken(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        code: STATUS_CODES.UNAUTHORIZED,
        message: '未授权访问',
        data: null,
        page: {}
      });
    }
    
    // 验证token
    const decoded = UserService.verifyAccessToken(token);
    if (!decoded) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        code: STATUS_CODES.UNAUTHORIZED,
        message: '无效或过期的token',
        data: null,
        page: {}
      });
    }
    
    // 检查session
    const session = await UserService.getSession(decoded.userId);
    if (!session || !session.loggedIn) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        code: STATUS_CODES.UNAUTHORIZED,
        message: '用户未登录',
        data: null,
        page: {}
      });
    }
    
    // 将用户信息存储在请求对象中
    req.userId = decoded.userId;
    req.user = session;
    
    next();
  } catch (error) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      code: STATUS_CODES.UNAUTHORIZED,
      message: '认证失败',
      data: null,
      page: {}
    });
  }
}

// 可选的认证中间件（不强制要求登录）
async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = UserService.verifyAccessToken(token);
      if (decoded) {
        const session = await UserService.getSession(decoded.userId);
        if (session && session.loggedIn) {
          req.userId = decoded.userId;
          req.user = session;
        }
      }
    }
    
    next();
  } catch (error) {
    // 即使认证失败也继续，因为这是可选的
    next();
  }
}

module.exports = {
  authenticateToken,
  optionalAuthenticate
};