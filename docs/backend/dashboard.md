# 仪表盘模块接口文档

## 获取仪表盘统计数据

### GET /api/admin/dashboard/stats

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
    "total_posts": 100,
    "total_users": 50,
    "total_comments": 300,
    "total_views": 10000,
    "today_posts": 5,
    "today_comments": 20,
    "today_views": 500,
    "monthly_stats": [
      { "date": "2024-01-01", "views": 300, "comments": 10 },
      { "date": "2024-01-02", "views": 400, "comments": 15 }
    ]
  },
  "page": {}
}
```

## 获取最近活动

### GET /api/admin/dashboard/activities

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| limit | number | 否 | 10 | 返回数量 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "post_created",
        "title": "新文章发布",
        "description": "用户发布了新文章《文章标题》",
        "user": {
          "id": 1,
          "name": "用户名"
        },
        "created_at": "2024-01-01T10:00:00Z"
      },
      {
        "id": 2,
        "type": "comment_created",
        "title": "新评论",
        "description": "用户评论了文章《文章标题》",
        "user": {
          "id": 2,
          "name": "评论用户"
        },
        "created_at": "2024-01-01T09:30:00Z"
      }
    ]
  },
  "page": {}
}
```

## 获取热门文章统计

### GET /api/admin/dashboard/hot-posts

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| days | number | 否 | 7 | 统计天数 |
| limit | number | 否 | 10 | 返回数量 |

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
        "view_count": 1000,
        "comment_count": 50,
        "like_count": 100
      },
      {
        "id": 2,
        "title": "热门文章2",
        "view_count": 800,
        "comment_count": 40,
        "like_count": 80
      }
    ]
  },
  "page": {}
}
```

## 获取访问量统计

### GET /api/admin/dashboard/page-views

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|-------|------|------|-------|------|
| start_date | string | 否 | 7天前 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 今天 | 结束日期（YYYY-MM-DD） |
| group_by | string | 否 | "day" | 分组方式（day/week/month） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "total_views": 10000,
    "total_uv": 5000,
    "trend": [
      { "date": "2024-01-01", "views": 1000, "uv": 500 },
      { "date": "2024-01-02", "views": 1200, "uv": 600 }
    ]
  },
  "page": {}
}