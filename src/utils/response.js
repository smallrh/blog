/**
 * 成功响应
 * @param {import('express').Response} res - Express响应对象
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} code - 状态码
 */
export function successResponse(res, data = null, message = 'success', code = 200) {
  return res.status(code).json({
    code,
    message,
    data
  });
}

/**
 * 错误响应
 * @param {import('express').Response} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} code - 状态码
 * @param {any} errors - 错误详情
 */
export function errorResponse(res, message = 'error', code = 400, errors = null) {
  return res.status(code).json({
    code,
    message,
    errors
  });
}

/**
 * 分页响应
 * @param {import('express').Response} res - Express响应对象
 * @param {Array} list - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页条数
 * @param {string} message - 响应消息
 */
export function paginationResponse(
  res,
  list = [],
  total = 0,
  page = 1,
  pageSize = 10,
  message = 'success'
) {
  const totalPage = Math.ceil(total / pageSize);
  
  return res.json({
    code: 200,
    message,
    data: {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPage
      }
    }
  });
}

/**
 * 未授权响应
 * @param {import('express').Response} res - Express响应对象
 * @param {string} message - 错误消息
 */
export function unauthorizedResponse(res, message = '未授权访问') {
  return res.status(401).json({
    code: 401,
    message,
    data: null
  });
}

/**
 * 禁止访问响应
 * @param {import('express').Response} res - Express响应对象
 * @param {string} message - 错误消息
 */
export function forbiddenResponse(res, message = '禁止访问') {
  return res.status(403).json({
    code: 403,
    message,
    data: null
  });
}

/**
 * 未找到响应
 * @param {import('express').Response} res - Express响应对象
 * @param {string} message - 错误消息
 */
export function notFoundResponse(res, message = '资源不存在') {
  return res.status(404).json({
    code: 404,
    message,
    data: null
  });
}

/**
 * 服务器错误响应
 * @param {import('express').Response} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {any} error - 错误详情
 */
export function serverErrorResponse(res, message = '服务器内部错误', error = null) {
  return res.status(500).json({
    code: 500,
    message,
    data: process.env.NODE_ENV === 'development' ? error : null
  });
}

/**
 * 参数错误响应
 * @param {import('express').Response} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {any} errors - 错误详情
 */
export function validationErrorResponse(res, message = '参数验证失败', errors = null) {
  return res.status(422).json({
    code: 422,
    message,
    errors
  });
}

/**
 * 操作成功响应（不返回数据）
 * @param {import('express').Response} res - Express响应对象
 * @param {string} message - 响应消息
 */
export function operationSuccessResponse(res, message = '操作成功') {
  return res.json({
    code: 200,
    message,
    data: null
  });
}

/**
 * 批量操作响应
 * @param {import('express').Response} res - Express响应对象
 * @param {number} successCount - 成功数量
 * @param {number} failCount - 失败数量
 * @param {Array} failItems - 失败项列表
 * @param {string} message - 响应消息
 */
export function batchOperationResponse(
  res,
  successCount = 0,
  failCount = 0,
  failItems = [],
  message = '批量操作完成'
) {
  return res.json({
    code: 200,
    message,
    data: {
      successCount,
      failCount,
      failItems
    }
  });
}