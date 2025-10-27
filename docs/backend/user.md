# 用户管理模块接口文档

## 获取用户列表

### GET /api/admin/users

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |
| role | string | 否 | null | 角色（admin/user） |
| status | string | 否 | null | 状态（active/disabled） |
| keyword | string | 否 | null | 搜索关键词（用户名/邮箱） |
| start_date | string | 否 | null | 注册开始日期 |
| end_date | string | 否 | null | 注册结束日期 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "count": 100,
    "list": [
      {
        "id": 1,
        "name": "用户1",
        "email": "user1@example.com",
        "avatar": "avatar_url",
        "role": "user",
        "status": "active",
        "post_count": 10,
        "comment_count": 20,
        "last_login_at": "2024-01-01T00:00:00Z",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "page": {
    "current": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 获取用户详情

### GET /api/admin/users/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 用户ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "用户1",
    "email": "user1@example.com",
    "avatar": "avatar_url",
    "bio": "个人简介",
    "role": "user",
    "status": "active",
    "post_count": 10,
    "comment_count": 20,
    "last_login_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "page": {}
}
```

## 创建用户

### POST /api/admin/users

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| name | string | 是 | 用户名 |
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 用户密码 |
| role | string | 否 | 角色（user/admin） |
| status | string | 否 | 状态（active/disabled） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "name": "新用户",
    "email": "newuser@example.com",
    "role": "user"
  },
  "page": {}
}
```

## 更新用户信息

### POST /api/admin/users/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 用户ID |
| name | string | 否 | 用户名 |
| email | string | 否 | 用户邮箱 |
| avatar | string | 否 | 头像URL |
| bio | string | 否 | 个人简介 |
| role | string | 否 | 角色（user/admin） |
| status | string | 否 | 状态（active/disabled） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "更新的用户名",
    "role": "admin"
  },
  "page": {}
}
```

## 修改用户密码

### POST /api/admin/users/:id/change-password

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 用户ID |
| password | string | 是 | 新密码 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Password changed successfully",
  "data": {},
  "page": {}
}
```

## 禁用/启用用户

### POST /api/admin/users/:id/status

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 用户ID |
| status | string | 是 | 状态（active/disabled） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "status": "disabled" },
  "page": {}
}
```

## 删除用户

### DELETE /api/admin/users/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 用户ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "page": {}
}
```

## 批量删除用户

### POST /api/admin/users/batch-delete

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| ids | array | 是 | 用户ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "deleted_count": 3 },
  "page": {}
}