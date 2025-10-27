# 标签管理模块接口文档

## 获取标签列表

### GET /api/admin/tags

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 50 | 每页数量 |
| keyword | string | 否 | null | 搜索关键词 |

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
        "sort": 1,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
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

### GET /api/admin/tags/hot

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

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

### GET /api/admin/tags/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 标签ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "sort": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "page": {}
}
```

## 创建标签

### POST /api/admin/tags

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| name | string | 是 | 标签名称 |
| slug | string | 否 | 标签别名（自动生成） |
| sort | number | 否 | 排序值 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 3,
    "name": "新标签",
    "slug": "new-tag"
  },
  "page": {}
}
```

## 更新标签

### POST /api/admin/tags/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 标签ID |
| name | string | 否 | 标签名称 |
| slug | string | 否 | 标签别名 |
| sort | number | 否 | 排序值 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "更新的标签名"
  },
  "page": {}
}
```

## 删除标签

### DELETE /api/admin/tags/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 标签ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "page": {}
}
```

## 批量删除标签

### POST /api/admin/tags/batch-delete

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| ids | array | 是 | 标签ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "deleted_count": 3 },
  "page": {}
}