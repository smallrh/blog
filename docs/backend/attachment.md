# 附件管理模块接口文档

## 获取附件列表

### GET /api/admin/attachments

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |
| type | string | 否 | null | 文件类型（image/video/audio/document） |
| keyword | string | 否 | null | 搜索关键词 |
| user_id | number | 否 | null | 上传用户ID |
| start_date | string | 否 | null | 上传开始日期 |
| end_date | string | 否 | null | 上传结束日期 |

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
        "name": "example.jpg",
        "path": "/uploads/images/example.jpg",
        "url": "https://domain.com/uploads/images/example.jpg",
        "size": 102400,
        "mime_type": "image/jpeg",
        "type": "image",
        "width": 1920,
        "height": 1080,
        "user": {
          "id": 1,
          "name": "用户名"
        },
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

## 获取附件详情

### GET /api/admin/attachments/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 附件ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "example.jpg",
    "path": "/uploads/images/example.jpg",
    "url": "https://domain.com/uploads/images/example.jpg",
    "size": 102400,
    "mime_type": "image/jpeg",
    "type": "image",
    "width": 1920,
    "height": 1080,
    "user_id": 1,
    "user": {
      "id": 1,
      "name": "用户名"
    },
    "created_at": "2024-01-01T00:00:00Z"
  },
  "page": {}
}
```

## 上传附件

### POST /api/admin/attachments/upload

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |
| Content-Type | string | 是 | multipart/form-data |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| file | file | 是 | 上传的文件 |
| type | string | 否 | 文件分类（image/video/document） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 2,
    "name": "uploaded.jpg",
    "path": "/uploads/images/uploaded.jpg",
    "url": "https://domain.com/uploads/images/uploaded.jpg",
    "size": 204800,
    "mime_type": "image/jpeg",
    "type": "image",
    "width": 1200,
    "height": 800
  },
  "page": {}
}
```

## 批量上传附件

### POST /api/admin/attachments/batch-upload

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |
| Content-Type | string | 是 | multipart/form-data |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| files | array | 是 | 上传的文件数组 |
| type | string | 否 | 文件分类 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "uploaded": [
      {
        "id": 3,
        "name": "file1.jpg",
        "url": "https://domain.com/uploads/images/file1.jpg"
      },
      {
        "id": 4,
        "name": "file2.jpg",
        "url": "https://domain.com/uploads/images/file2.jpg"
      }
    ],
    "failed": []
  },
  "page": {}
}
```

## 删除附件

### DELETE /api/admin/attachments/:id

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| id | number | 是 | 附件ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "page": {}
}
```

## 批量删除附件

### POST /api/admin/attachments/batch-delete

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| ids | array | 是 | 附件ID数组 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": { "deleted_count": 3 },
  "page": {}
}

## 获取附件统计

### GET /api/admin/attachments/stats

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
    "total_count": 100,
    "total_size": 10240000,
    "by_type": {
      "image": { "count": 80, "size": 8192000 },
      "document": { "count": 15, "size": 1536000 },
      "video": { "count": 5, "size": 512000 }
    },
    "monthly_uploads": [
      { "month": "2024-01", "count": 30, "size": 3072000 },
      { "month": "2024-02", "count": 25, "size": 2560000 }
    ]
  },
  "page": {}
}