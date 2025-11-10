require('dotenv/config');

// 全局配置对象
const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 9001,
    env: process.env.NODE_ENV || 'development'
  },

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'root', // 修改为使用DB_USER
    password: process.env.DB_PASSWORD || '1234', // 修改默认密码
    database: process.env.DB_NAME || 'blog_db' // 修改默认数据库名
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 1 // 修改默认DB为1
  },

  // JWT配置
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'blog-mice-access-secret-key-2024', // 修改为使用JWT_ACCESS_SECRET
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'blog-mice-refresh-secret-key-2024', // 添加refreshSecret
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h', // 添加访问令牌过期时间
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' // 添加刷新令牌过期时间
  },

  // 邮件配置
  email: {
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: process.env.SMTP_PORT || 465,
    user: process.env.QQ_EMAIL_USER || process.env.SMTP_USER || '',
    password: process.env.QQ_EMAIL_PASS || process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || process.env.QQ_EMAIL_USER || 'noreply@example.com'
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
  },
  
  // Bcrypt配置
  bcrypt: {
    saltRounds: 10            // 密码加密的盐轮数
  },
  
  // 密码策略配置
  passwordPolicy: {
    minLength: 6,             // 最小长度
    requireUppercase: false,  // 是否需要大写字母
    requireLowercase: true,   // 是否需要小写字母
    requireNumber: true,      // 是否需要数字
    requireSpecialChar: false // 是否需要特殊字符
  }
};

// 导出配置验证方法
const validateConfig = () => {
  const requiredFields = [
    { field: 'JWT_ACCESS_SECRET', message: 'JWT访问密钥必须配置' },
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