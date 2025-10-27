# 管理员认证模块接口文档

## 发送管理员验证码

### POST /api/admin/auth/send-code

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| email | string | 是 | 管理员邮箱 |
| type | string | 是 | 验证码类型（reset_password） |

**成功响应：**
```json
{
  "code": 200,
  "message": "Verification code sent successfully",
  "data": {},
  "page": {}
}
```

**失败响应：**
```json
{
  "code": 400,
  "message": "Failed to send verification code",
  "data": {},
  "page": {}
}

## 管理员登录

### POST /api/admin/auth/login

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| account | string | 是 | 管理员账号（用户名或邮箱） |
| password | string | 是 | 管理员密码 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "name": "管理员"
    }
  },
  "page": {}
}
```

**失败响应：**
```json
{
  "code": 400,
  "message": "Invalid account or password",
  "data": {},
  "page": {}
}
```

## 管理员登出

### POST /api/admin/auth/logout

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "page": {}
}
```

## 获取当前管理员信息

### GET /api/admin/auth/me

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
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "name": "管理员",
      "email": "admin@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  "page": {}
}
```

**失败响应：**
```json
{
  "code": 401,
  "message": "Unauthorized",
  "data": {},
  "page": {}
}
```

## 修改管理员密码（邮箱验证）

### POST /api/admin/auth/change-password

**请求头：**
| 头部名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer jwt_token |

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| email | string | 是 | 管理员邮箱 |
| verify_code | string | 是 | 邮箱验证码 |
| new_password | string | 是 | 新密码 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Password changed successfully",
  "data": {},
  "page": {}
}
```

**失败响应：**
```json
{
  "code": 400,
  "message": "Invalid verification code",
  "data": {},
  "page": {}
}
```

**邮箱不匹配响应：**
```json
{
  "code": 400,
  "message": "Email does not match admin account",
  "data": {},
  "page": {}
}
```