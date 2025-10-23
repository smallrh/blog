// 响应状态码
const STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

// 响应消息
const MESSAGES = {
  SUCCESS: 'Success',
  BAD_REQUEST: 'Bad request',
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found'
};

// 缓存键前缀
const CACHE_PREFIXES = {
  POST: 'post',
  USER: 'user',
  CATEGORY: 'category'
};

module.exports = {
  STATUS_CODES,
  MESSAGES,
  CACHE_PREFIXES
};