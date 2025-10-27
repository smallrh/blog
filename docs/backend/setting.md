# 系统设置模块接口文档

## 获取系统配置

### GET /api/admin/settings

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "site_info": {
      "site_name": "博客系统",
      "site_description": "个人博客系统",
      "site_keywords": "博客,技术,分享",
      "site_logo": "logo_url",
      "site_favicon": "favicon_url",
      "copyright": "© 2024 博客系统"
    },
    "seo_settings": {
      "enable_robots": true,
      "enable_sitemap": true,
      "google_analytics_id": "UA-XXXXXXXXX-X"
    },
    "email_settings": {
      "smtp_server": "smtp.example.com",
      "smtp_port": 465,
      "smtp_secure": true,
      "smtp_user": "admin@example.com",
      "smtp_password": "********"
    },
    "comment_settings": {
      "enable_comments": true,
      "comment_approval": true,
      "guest_comments": false,
      "comment_avatar": "gravatar"
    },
    "security_settings": {
      "login_attempts": 5,
      "lockout_duration": 30,
      "api_rate_limit": 1000
    }
  },
  "page": {}
}
```

## 更新系统配置

### POST /api/admin/settings

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| site_info | object | 否 | 网站基本信息 |
| seo_settings | object | 否 | SEO设置 |
| email_settings | object | 否 | 邮箱设置 |
| comment_settings | object | 否 | 评论设置 |
| security_settings | object | 否 | 安全设置 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Settings updated successfully",
  "data": {},
  "page": {}
}
```

## 获取单个配置项

### GET /api/admin/settings/:key

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| key | string | 是 | 配置项键名 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "key": "site_info",
    "value": {
      "site_name": "博客系统",
      "site_description": "个人博客系统"
    }
  },
  "page": {}
}
```

## 更新单个配置项

### POST /api/admin/settings/:key

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| key | string | 是 | 配置项键名 |
| value | any | 是 | 配置项值 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Setting updated successfully",
  "data": {},
  "page": {}
}
```

## 清除系统缓存

### POST /api/admin/settings/clear-cache

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| type | string | 否 | 缓存类型（all/page/redis/db） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Cache cleared successfully",
  "data": { "cleared": "all" },
  "page": {}
}
```

## 获取系统信息

### GET /api/admin/settings/system-info

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "server": {
      "os": "Linux 5.4.0",
      "node_version": "16.14.0",
      "uptime": "1000000"
    },
    "database": {
      "type": "MySQL",
      "version": "8.0.27",
      "connections": 10,
      "tables": 20
    },
    "memory": {
      "total": 16777216,
      "used": 4194304,
      "free": 12582912
    },
    "storage": {
      "total": 53687091200,
      "used": 10737418240,
      "free": 42949672960
    },
    "application": {
      "version": "1.0.0",
      "environment": "production",
      "debug": false
    }
  },
  "page": {}
}
```

## 备份数据库

### POST /api/admin/settings/backup

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| include_data | boolean | 否 | 是否包含数据 |
| include_schema | boolean | 否 | 是否包含表结构 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Backup started",
  "data": { "backup_id": "backup_20240101_120000" },
  "page": {}
}
```

## 获取备份列表

### GET /api/admin/settings/backups

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "id": "backup_20240101_120000",
        "filename": "backup_20240101_120000.sql.gz",
        "size": 1024000,
        "status": "completed",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ]
  },
  "page": {}
}