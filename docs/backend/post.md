# 文章管理模块接口文档

## 获取文章列表

### GET /api/admin/posts

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| category_id | number | 否 | null | 分类ID |
| user_id | number | 否 | null | 用户ID |
| status | string | 否 | null | 状态（published/draft） |
| keyword | string | 否 | null | 搜索关键词 |
| start_date | string | 否 | null | 开始日期 |
| end_date | string | 否 | null | 结束日期 |

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
        "status": "published",
        "view_count": 100,
        "comment_count": 10,
        "is_top": false,
        "category": {
          "id": 1,
          "name": "分类名称"
        },
        "user": {
          "id": 1,
          "name": "作者名"
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-02T00:00:00Z"
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

### GET /api/admin/posts/:id

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
    "id": 1,
    "title": "文章标题",
    "slug": "post-title",
    "content": "文章内容",
    "excerpt": "文章摘要",
    "cover": "cover_image_url",
    "status": "published",
    "view_count": 100,
    "is_top": false,
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "分类名称"
    },
    "tag_ids": [1, 2],
    "tags": [
      { "id": 1, "name": "标签1" },
      { "id": 2, "name": "标签2" }
    ],
    "user_id": 1,
    "user": {
      "id": 1,
      "name": "作者名"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "page": {}
}
```

## 创建文章

### POST /api/admin/posts

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| title | string | 是 | 文章标题 |
| slug | string | 否 | 文章别名（自动生成） |
| content | string | 是 | 文章内容 |
| excerpt | string | 否 | 文章摘要 |
| cover | string | 否 | 封面图片URL |
| status | string | 否 | 状态（published/draft） |
| is_top | boolean | 否 | 是否置顶 |
| category_id | number | 是 | 分类ID |
| tag_ids | array | 否 | 标签ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "title": "新文章标题",
    "slug": "new-post-title",
    "content": "新文章内容",
    "status": "published"
  },
  "page": {}
}
```

## 更新文章

### POST /api/admin/posts/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 文章ID |
| title | string | 否 | 文章标题 |
| slug | string | 否 | 文章别名 |
| content | string | 否 | 文章内容 |
| excerpt | string | 否 | 文章摘要 |
| cover | string | 否 | 封面图片URL |
| status | string | 否 | 状态（published/draft） |
| is_top | boolean | 否 | 是否置顶 |
| category_id | number | 否 | 分类ID |
| tag_ids | array | 否 | 标签ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "更新后的标题",
    "content": "更新后的内容"
  },
  "page": {}
}
```

## 删除文章

### DELETE /api/admin/posts/:id

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
  "data": {},
  "page": {}
}
```

## 批量删除文章

### POST /api/admin/posts/batch-delete

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| ids | array | 是 | 文章ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "deleted_count": 3 },
  "page": {}
}
```

## 置顶/取消置顶文章

### POST /api/admin/posts/:id/top

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 文章ID |
| is_top | boolean | 是 | 是否置顶 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "is_top": true },
  "page": {}
}