# 用户模块接口文档

## 获取用户信息

### GET /api/frontend/users/:id

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
    "user": {
      "id": 1,
      "name": "用户名",
      "avatar": "avatar_url",
      "bio": "个人简介",
      "post_count": 10,
      "follower_count": 50,
      "following_count": 20,
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  "page": {}
}
```

## 更新用户信息

### POST /api/frontend/users/profile

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| name | string | 否 | 用户名 |
| bio | string | 否 | 个人简介 |
| avatar | string | 否 | 头像URL |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": 1,
      "name": "新用户名",
      "avatar": "new_avatar_url",
      "bio": "新的个人简介",
      "email": "user@example.com"
    }
  },
  "page": {}
}
```

## 修改密码（邮箱验证）

### POST /api/frontend/users/change-password

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| email | string | 是 | 用户邮箱 |
| verify_code | string | 是 | 邮箱验证码 |
| new_password | string | 是 | 新密码 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Password changed successfully",
  "data": {},
  "page": {}
}
```

**失败响应：**
```json
{
  "code": 400,
  "message": "Invalid verification code",
  "data": {},
  "page": {}
}
```

```json
{
  "code": 400,
  "message": "Email does not match user account",
  "data": {},
  "page": {}
}
```

## 获取用户发布的文章

### GET /api/frontend/users/:id/posts

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| id | number | 是 | - | 用户ID |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": 1,
      "name": "用户名",
      "avatar": "avatar_url"
    },
    "count": 10,
    "list": [
      {
        "id": 1,
        "title": "文章标题",
        "slug": "post-title",
        "excerpt": "文章摘要",
        "cover": "cover_image_url",
        "view_count": 100,
        "like_count": 20,
        "category": {
          "id": 1,
          "name": "分类名称"
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "page": {
    "current": 1,
    "pageSize": 10,
    "total": 10,
    "totalPages": 1
  }
}
```

## 获取用户收藏的文章

### GET /api/frontend/users/collections

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "count": 5,
    "list": [
      {
        "id": 1,
        "title": "收藏的文章标题",
        "slug": "favorite-post",
        "excerpt": "文章摘要",
        "cover": "cover_image_url",
        "view_count": 100,
        "like_count": 20,
        "category": {
          "id": 1,
          "name": "分类名称"
        },
        "user": {
          "id": 2,
          "name": "作者名",
          "avatar": "avatar_url"
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "page": {
    "current": 1,
    "pageSize": 10,
    "total": 5,
    "totalPages": 1
  }
}