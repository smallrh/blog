# 分类管理模块接口文档

## 获取分类列表

### GET /api/admin/categories

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |
| parent_id | number | 否 | null | 父分类ID |
| keyword | string | 否 | null | 搜索关键词 |

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
        "description": "技术相关文章",
        "parent_id": null,
        "post_count": 50,
        "sort": 1,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
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

## 获取分类树

### GET /api/admin/categories/tree

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
      }
    ]
  },
  "page": {}
}
```

## 获取分类详情

### GET /api/admin/categories/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 分类ID |

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
    "parent_id": null,
    "sort": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "page": {}
}
```

## 创建分类

### POST /api/admin/categories

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| name | string | 是 | 分类名称 |
| slug | string | 否 | 分类别名（自动生成） |
| description | string | 否 | 分类描述 |
| parent_id | number | 否 | 父分类ID |
| sort | number | 否 | 排序值 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 4,
    "name": "新分类",
    "slug": "new-category",
    "parent_id": null
  },
  "page": {}
}
```

## 更新分类

### POST /api/admin/categories/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 分类ID |
| name | string | 否 | 分类名称 |
| slug | string | 否 | 分类别名 |
| description | string | 否 | 分类描述 |
| parent_id | number | 否 | 父分类ID |
| sort | number | 否 | 排序值 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "更新的分类名",
    "description": "更新的描述"
  },
  "page": {}
}
```

## 删除分类

### DELETE /api/admin/categories/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 分类ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "page": {}
}
```

**失败响应（分类下有文章）：**
```json
{
  "code": 400,
  "message": "Category has posts, cannot delete",
  "data": {},
  "page": {}
}
```

## 批量删除分类

### POST /api/admin/categories/batch-delete

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| ids | array | 是 | 分类ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "deleted_count": 2 },
  "page": {}
}