-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS blog_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE blog_db;

-- 全局配置表
-- 系统配置表（替代global_snippets）
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    type ENUM('string', 'number', 'boolean', 'json', 'text') DEFAULT 'string',
    `group` VARCHAR(50) DEFAULT 'general',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_group (`group`)
);

-- 用户表
-- 用户表优化
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,--使用uuis
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    email VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100), -- 新增：显示名称
    role ENUM('admin', 'editor', 'author', 'subscriber') DEFAULT 'subscriber', -- 新增：角色权限
    last_login_at TIMESTAMP NULL, -- 新增：最后登录时间
    login_count INT DEFAULT 0, -- 新增：登录次数
    status TINYINT DEFAULT 1 COMMENT '0:禁用,1:正常,2:待审核',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- 文章分类表
-- 文章分类表优化
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE, -- 新增：分类别名
    description VARCHAR(255),
    parent_id INT DEFAULT 0, -- 新增：支持多级分类
    sort_order INT DEFAULT 0, -- 新增：排序
    post_count INT DEFAULT 0, -- 新增：文章数量统计
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
);

-- 文章表
-- 文章表优化
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE, -- 新增：SEO友好的URL标识
    content LONGTEXT NOT NULL, -- 改为LONGTEXT支持长文章
    summary VARCHAR(500),
    cover_image VARCHAR(255),
    user_id VARCHAR(50) NOT NULL,
    category_id INT,
    status ENUM('draft', 'published', 'private', 'pending') DEFAULT 'draft', -- 优化状态定义
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶', -- 新增：置顶功能
    password VARCHAR(100) COMMENT '文章密码保护', -- 新增：私密文章
    published_at TIMESTAMP NULL, -- 新增：发布时间（可预约发布）
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0, -- 新增：点赞数
    comment_count INT DEFAULT 0,
    meta_keywords VARCHAR(255), -- 新增：SEO关键词
    meta_description VARCHAR(500), -- 新增：SEO描述
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_is_top (is_top),
    INDEX idx_slug (slug)
);

-- 评论表
-- 评论表优化
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id VARCHAR(50), -- 改为可空，支持游客评论
    parent_id BIGINT DEFAULT 0,
    author_name VARCHAR(100) COMMENT '评论者名称', -- 新增：游客名称
    author_email VARCHAR(100) COMMENT '评论者邮箱', -- 新增：游客邮箱
    author_url VARCHAR(255) COMMENT '评论者网址', -- 新增：游客网址
    author_ip VARCHAR(45) COMMENT '评论者IP', -- 新增：IP地址
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'spam', 'trash') DEFAULT 'pending', -- 优化状态
    like_count INT DEFAULT 0, -- 新增：点赞数
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 文章标签表
-- 文章标签表优化
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE, -- 名称唯一
    slug VARCHAR(100) NOT NULL UNIQUE, -- 新增：标签别名
    description VARCHAR(255), -- 新增：标签描述
    post_count INT DEFAULT 0, -- 新增：使用次数统计
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_slug (slug)
);

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 附件表
CREATE TABLE IF NOT EXISTS attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100),
    file_type ENUM('image', 'video', 'audio', 'document', 'other') DEFAULT 'other',
    user_id VARCHAR(50) NOT NULL,
    post_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_file_type (file_type)
);