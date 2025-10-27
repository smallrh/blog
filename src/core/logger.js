const winston = require('winston');
const fs = require('fs');

// 确保日志目录存在
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => {
      return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;
    })
  ),
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => {
          return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;
        })
      )
    }),
    // 文件输出 - 错误日志
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 文件输出 - 所有日志
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// 导出日志方法
const log = {
  debug: (message) => logger.debug(message),
  info: (message) => logger.info(message),
  warn: (message) => logger.warn(message),
  error: (message, error = null) => {
    if (error) {
      logger.error(`${message}: ${error.message}\n${error.stack}`);
    } else {
      logger.error(message);
    }
  }
};

module.exports = {
  logger,
  log
};