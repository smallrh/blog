# 分类模块接口文档

## 获取分类树

### GET /api/frontend/categories/tree

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "技术",
        "slug": "technology",
        "post_count": 50,
        "children": [
          {
            "id": 2,
            "name": "前端",
            "slug": "frontend",
            "post_count": 30,
            "children": []
          },
          {
            "id": 3,
            "name": "后端",
            "slug": "backend",
            "post_count": 20,
            "children": []
          }
        ]
      },
      {
        "id": 4,
        "name": "生活",
        "slug": "life",
        "post_count": 20,
        "children": []
      }
    ]
  },
  "page": {}
}
```

## 获取分类列表

### GET /api/frontend/categories

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| parent_id | number | 否 | null | 父分类ID |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "count": 10,
    "list": [
      {
        "id": 1,
        "name": "技术",
        "slug": "technology",
        "post_count": 50,
        "parent_id": null,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "page": {
    "current": 1,
    "pageSize": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

## 获取分类详情

### GET /api/frontend/categories/:slug

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| slug | string | 是 | 分类别名 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "技术",
    "slug": "technology",
    "description": "技术相关文章",
    "post_count": 50,
    "parent_id": null,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "page": {}
}
```

## 获取分类下的文章

### GET /api/frontend/categories/:slug/posts

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| slug | string | 是 | - | 分类别名 |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "category": {
      "id": 1,
      "name": "技术",
      "slug": "technology"
    },
    "count": 50,
    "list": [
      {
        "id": 1,
        "title": "文章标题",
        "slug": "post-title",
        "excerpt": "文章摘要",
        "cover": "cover_image_url",
        "view_count": 100,
        "like_count": 20,
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
    "total": 50,
    "totalPages": 5
  }
}