# 文章模块接口文档

## 获取文章列表

### GET /api/frontend/posts

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| category_id | number | 否 | null | 分类ID |
| tag_id | number | 否 | null | 标签ID |
| order | string | 否 | "created_at" | 排序字段 |
| sort | string | 否 | "desc" | 排序方向（asc/desc） |

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
        "tags": [
          { "id": 1, "name": "标签1" },
          { "id": 2, "name": "标签2" }
        ],
        "user": {
          "id": 1,
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
    "total": 100,
    "totalPages": 10
  }
}
```

## 获取文章详情

### GET /api/frontend/posts/:slug

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| slug | string | 是 | 文章别名 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "文章标题",
    "slug": "post-title",
    "content": "文章内容",
    "cover": "cover_image_url",
    "view_count": 101,
    "like_count": 20,
    "comment_count": 5,
    "category": {
      "id": 1,
      "name": "分类名称",
      "slug": "category-slug"
    },
    "tags": [
      { "id": 1, "name": "标签1", "slug": "tag-1" },
      { "id": 2, "name": "标签2", "slug": "tag-2" }
    ],
    "user": {
      "id": 1,
      "name": "作者名",
      "avatar": "avatar_url"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "page": {}
}
```

## 获取热门文章

### GET /api/frontend/posts/hot

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| limit | number | 否 | 5 | 返回数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "热门文章1",
        "slug": "hot-post-1",
        "cover": "cover_url",
        "view_count": 1000
      }
    ]
  },
  "page": {}
}
```

## 点赞文章

### POST /api/frontend/posts/:id/like

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 文章ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "like_count": 21,
    "is_liked": true
  },
  "page": {}
}
```

## 取消点赞

### POST /api/frontend/posts/:id/unlike

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 文章ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "like_count": 20,
    "is_liked": false
  },
  "page": {}
}
```