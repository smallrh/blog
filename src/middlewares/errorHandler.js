const { STATUS_CODES, MESSAGES } = require('../constants/appConstants');

// 统一错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // 根据错误类型返回不同的状态码
  let statusCode = STATUS_CODES.INTERNAL_ERROR;
  let message = MESSAGES.SERVER_ERROR;
  
  if (err.name === 'ValidationError') {
    statusCode = STATUS_CODES.BAD_REQUEST;
    message = err.message;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
  }
  
  // 返回统一的错误响应格式
  res.status(statusCode).json({
    code: statusCode,
    message: message,
    data: null,
    page: {}
  });
};

module.exports = errorHandler;