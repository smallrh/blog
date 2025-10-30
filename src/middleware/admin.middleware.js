const { forbiddenResponse } = require('../core/response');

/**
 * 管理员权限中间件
 * 检查用户是否为管理员角色
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件函数
 */
const adminMiddleware = (req, res, next) => {
  // 确保用户已通过认证
  if (!req.user) {
    return res.status(401).json({
      code: 401,
      message: 'Authentication required'
    });
  }

  // 检查用户角色是否为管理员
  if (req.user.role !== 'admin') {
    return forbiddenResponse(res, 'Admin access required');
  }

  // 检查是否有权限访问特定资源（根据用户模块的规则）
  // 支持 blog:user:{id} 和 blog:token:{id} 权限标识
  if (req.params.id) {
    // 对于用户相关操作，确保管理员可以操作所有用户
    if (req.path.includes('/users/')) {
      // 管理员可以操作所有用户
    } else if (req.path.includes('/tokens/')) {
      // 管理员可以管理所有token
    }
  }

  next();
};

/**
 * 超级管理员中间件
 * 检查用户是否为超级管理员角色
 */
const superAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      code: 401,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'superadmin') {
    return forbiddenResponse(res, 'Super admin access required');
  }

  next();
};

/**
 * 资源所有权验证中间件
 * 确保用户只能操作自己的资源
 * @param {Function} checkOwnership - 验证所有权的函数
 */
const ownershipMiddleware = (checkOwnership) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: 'Authentication required'
      });
    }

    // 管理员和超级管理员可以跳过所有权检查
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    try {
      const isOwner = await checkOwnership(req.user.id, req.params.id, req);
      if (!isOwner) {
        return forbiddenResponse(res, 'You do not have permission to access this resource');
      }
      next();
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: 'Error verifying ownership'
      });
    }
  };
};

module.exports = { adminMiddleware, superAdminMiddleware, ownershipMiddleware };