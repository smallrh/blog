# 认证模块接口文档

## 发送验证码

### POST /api/frontend/auth/send-code

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| email | string | 是 | 用户邮箱 |
| type | string | 是 | 验证码类型（register/reset_password） |

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
```

## 登录接口

### POST /api/frontend/auth/login

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| account | string | 是 | 用户账号（用户名或邮箱） |
| password | string | 是 | 用户密码 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "1",
      "name": "用户名",
      "email": "user@example.com",
      "avatar": "avatar_url"
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

## 注册接口

### POST /api/frontend/auth/register

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| name | string | 是 | 用户名 |
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 用户密码 |
| verify_code | string | 是 | 邮箱验证码 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "1",
      "name": "用户名",
      "email": "user@example.com",
      "avatar": "default_avatar_url"
    }
  },
  "page": {}
}
```

**失败响应：**
```json
{
  "code": 400,
  "message": "Email already exists",
  "data": {},
  "page": {}
}
```

**验证码错误响应：**
```json
{
  "code": 400,
  "message": "Invalid verification code",
  "data": {},
  "page": {}
}
```

## 登出接口

### POST /api/frontend/auth/logout

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

## 获取当前用户信息

### GET /api/frontend/auth/me

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
      "id": "1",
      "name": "用户名",
      "email": "user@example.com",
      "avatar": "avatar_url",
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

## 重置密码

### POST /api/frontend/auth/reset-password

**请求参数：**
| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| email | string | 是 | 用户邮箱 |
| verify_code | string | 是 | 邮箱验证码 |
| new_password | string | 是 | 新密码 |

**成功响应：**
```json
{
  "code": 200,
  "message": "Password reset successfully",
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

```json
{
  "code": 400,
  "message": "Email not found",
  "data": {},
  "page": {}
}