// 通用响应结构封装

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息
 * @param {Object} page - 分页信息
 */
const successResponse = (res, data = null, message = 'Success', page = null) => {
  const response = {
    code: 200,
    message,
    data
  };

  if (page) {
    response.page = page;
  }

  return res.status(200).json(response);
};

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} code - 错误码，默认为400
 * @param {*} data - 额外数据
 */
const errorResponse = (res, message = 'Bad request', code = 400, data = null) => {
  const response = {
    code,
    message,
    data
  };

  return res.status(code).json(response);
};

/**
 * 未授权响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 未授权消息
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

/**
 * 禁止访问响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 禁止访问消息
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * 未找到响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 未找到消息
 */
const notFoundResponse = (res, message = 'Not found') => {
  return errorResponse(res, message, 404);
};

/**
 * 服务器错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 服务器错误消息
 */
const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

/**
 * 分页响应
 * @param {Object} res - Express响应对象
 * @param {Array} list - 数据列表
 * @param {number} total - 总条数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页大小
 * @param {string} message - 响应消息
 */
const paginationResponse = (res, list, total, page, pageSize, message = 'Success') => {
  const totalPages = Math.ceil(total / pageSize);
  
  const pageInfo = {
    page,
    pageSize,
    total,
    totalPages
  };

  return successResponse(res, { list, count: total }, message, pageInfo);
};

module.exports = {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  paginationResponse
};