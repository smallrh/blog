# 标签模块接口文档

## 获取标签列表

### GET /api/frontend/tags

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 50 | 每页数量 |
| hot | boolean | 否 | false | 是否只返回热门标签 |

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
        "name": "JavaScript",
        "slug": "javascript",
        "post_count": 30,
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "name": "TypeScript",
        "slug": "typescript",
        "post_count": 20,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "page": {
    "current": 1,
    "pageSize": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

## 获取热门标签

### GET /api/frontend/tags/hot

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| limit | number | 否 | 20 | 返回数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "JavaScript",
        "slug": "javascript",
        "post_count": 30
      },
      {
        "id": 2,
        "name": "TypeScript",
        "slug": "typescript",
        "post_count": 20
      }
    ]
  },
  "page": {}
}
```

## 获取标签详情

### GET /api/frontend/tags/:slug

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| slug | string | 是 | 标签别名 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "post_count": 30,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "page": {}
}
```

## 获取标签下的文章

### GET /api/frontend/tags/:slug/posts

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| slug | string | 是 | - | 标签别名 |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "tag": {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript"
    },
    "count": 30,
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
    "total": 30,
    "totalPages": 3
  }
}