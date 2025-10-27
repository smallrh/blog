require('dotenv/config');

// 全局配置对象
const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 9000,
    env: process.env.NODE_ENV || 'development'
  },

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'blog_backend'
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // 邮件配置
  email: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@example.com'
  },

  // 验证码配置
  verification: {
    codeExpireTime: 300, // 验证码过期时间（秒）
    maxSendCount: 5,     // 每日最大发送次数
    minInterval: 60      // 最小发送间隔（秒）
  },

  // 限流配置
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100                  // 每个IP限制的请求数
  }
};

// 导出配置验证方法
const validateConfig = () => {
  const requiredFields = [
    { field: 'JWT_SECRET', message: 'JWT密钥必须配置' },
    { field: 'DB_HOST', message: '数据库主机必须配置' },
    { field: 'DB_NAME', message: '数据库名称必须配置' }
  ];

  const missingFields = requiredFields.filter(field => !process.env[field.field]);
  if (missingFields.length > 0) {
    console.error('配置错误:');
    missingFields.forEach(field => console.error(`  - ${field.message}`));
    return false;
  }

  return true;
};

module.exports = {
  config,
  validateConfig
};