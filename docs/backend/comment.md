# 评论管理模块接口文档

## 获取评论列表

### GET /api/admin/comments

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |
| post_id | number | 否 | null | 文章ID |
| user_id | number | 否 | null | 用户ID |
| status | string | 否 | null | 状态（approved/pending/spam） |
| keyword | string | 否 | null | 搜索关键词 |
| start_date | string | 否 | null | 开始日期 |
| end_date | string | 否 | null | 结束日期 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "count": 300,
    "list": [
      {
        "id": 1,
        "content": "评论内容",
        "status": "approved",
        "like_count": 5,
        "post": {
          "id": 1,
          "title": "文章标题"
        },
        "user": {
          "id": 1,
          "name": "用户名",
          "email": "user@example.com"
        },
        "parent_id": null,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "page": {
    "current": 1,
    "pageSize": 20,
    "total": 300,
    "totalPages": 15
  }
}
```

## 获取评论详情

### GET /api/admin/comments/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 评论ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "content": "评论内容",
    "status": "approved",
    "like_count": 5,
    "post_id": 1,
    "post": {
      "id": 1,
      "title": "文章标题"
    },
    "user_id": 1,
    "user": {
      "id": 1,
      "name": "用户名",
      "email": "user@example.com"
    },
    "parent_id": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "page": {}
}
```

## 审核评论

### POST /api/admin/comments/:id/approve

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 评论ID |
| status | string | 是 | 状态（approved/spam） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "status": "approved" },
  "page": {}
}
```

## 批量审核评论

### POST /api/admin/comments/batch-approve

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| ids | array | 是 | 评论ID数组 |
| status | string | 是 | 状态（approved/spam） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "updated_count": 10 },
  "page": {}
}
```

## 删除评论

### DELETE /api/admin/comments/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 评论ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "page": {}
}
```

## 批量删除评论

### POST /api/admin/comments/batch-delete

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| ids | array | 是 | 评论ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "deleted_count": 5 },
  "page": {}
}