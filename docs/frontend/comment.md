# 评论模块接口文档

## 获取文章评论列表

### GET /api/frontend/posts/:postId/comments

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| postId | number | 是 | - | 文章ID |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "count": 50,
    "list": [
      {
        "id": 1,
        "content": "评论内容",
        "like_count": 5,
        "is_liked": false,
        "user": {
          "id": 1,
          "name": "用户名",
          "avatar": "avatar_url"
        },
        "parent_id": null,
        "created_at": "2024-01-01T00:00:00Z",
        "children": [
          {
            "id": 2,
            "content": "回复内容",
            "like_count": 2,
            "is_liked": false,
            "user": {
              "id": 2,
              "name": "回复用户名",
              "avatar": "avatar_url"
            },
            "parent_id": 1,
            "created_at": "2024-01-01T01:00:00Z",
            "children": []
          }
        ]
      }
    ]
  },
  "page": {
    "current": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

## 创建评论

### POST /api/frontend/posts/:postId/comments

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| postId | number | 是 | - | 文章ID |
| content | string | 是 | - | 评论内容 |
| parent_id | number | 否 | null | 父评论ID（回复评论时使用） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 3,
    "content": "新评论内容",
    "like_count": 0,
    "user": {
      "id": 1,
      "name": "用户名",
      "avatar": "avatar_url"
    },
    "parent_id": null,
    "created_at": "2024-01-02T00:00:00Z"
  },
  "page": {}
}
```

## 点赞评论

### POST /api/frontend/comments/:id/like

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
    "like_count": 6,
    "is_liked": true
  },
  "page": {}
}
```

## 取消点赞评论

### POST /api/frontend/comments/:id/unlike

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
    "like_count": 5,
    "is_liked": false
  },
  "page": {}
}
```

## 删除评论

### DELETE /api/frontend/comments/:id

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