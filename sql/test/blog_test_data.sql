-- 插入系统设置数据
INSERT INTO settings (`key`, value, type, `group`, description) VALUES
('site_title', '我的技术博客', 'string', 'general', '网站标题'),
('site_description', '分享编程技术和生活感悟', 'string', 'general', '网站描述'),
('posts_per_page', '10', 'number', 'reading', '每页显示文章数'),
('comment_status', '1', 'boolean', 'discussion', '评论开关'),
('admin_email', '2902314437@qq.com', 'string', 'general', '管理员邮箱');

-- 插入用户数据（除了已有的mice用户，再添加几个测试用户）
INSERT INTO users (id, username, password, avatar, email, display_name, role, status) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', 'hashed_password_123', '/avatars/admin.jpg', 'admin@example.com', '系统管理员', 'admin', 1),
('b2c3d4e5-f6a7-890b-bcde-f23456789012', 'author1', 'hashed_password_456', '/avatars/author1.jpg', 'author1@example.com', '技术作者', 'author', 1),
('c3d4e5f6-a7b8-901c-cdef-345678901234', 'editor1', 'hashed_password_789', '/avatars/editor1.jpg', 'editor1@example.com', '内容编辑', 'editor', 1);

-- 插入分类数据
INSERT INTO categories (name, slug, description, parent_id, sort_order, post_count) VALUES
('编程语言', 'programming', '各种编程语言学习', 0, 1, 3),
('前端开发', 'frontend', 'HTML、CSS、JavaScript等技术', 0, 2, 2),
('后端开发', 'backend', '服务器端开发技术', 0, 3, 2),
('Java', 'java', 'Java相关技术', 1, 1, 1),
('Python', 'python', 'Python编程', 1, 2, 2);

-- 插入文章数据
INSERT INTO posts (title, slug, content, summary, cover_image, user_id, category_id, status, is_top, view_count, like_count, comment_count, published_at) VALUES
('Vue3入门教程', 'vue3-tutorial', 'Vue3是最新版本的Vue.js框架...', '本文介绍Vue3的基本概念和使用方法', '/covers/vue3.jpg', '56638b16-2ee1-4029-a468-13c92e93ad72', 2, 'published', 1, 156, 23, 5, '2024-01-15 10:00:00'),
('Spring Boot实战', 'spring-boot-practice', 'Spring Boot让Java开发变得更简单...', 'Spring Boot的完整实战指南', '/covers/springboot.jpg', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'published', 0, 89, 15, 3, '2024-01-10 14:30:00'),
('Python数据分析', 'python-data-analysis', '使用Python进行数据分析...', 'Pandas和NumPy的使用技巧', '/covers/python-data.jpg', 'b2c3d4e5-f6a7-890b-bcde-f23456789012', 5, 'published', 0, 234, 45, 12, '2024-01-08 09:15:00'),
('React Hooks详解', 'react-hooks', 'React Hooks是React 16.8的新特性...', '深入理解React Hooks的使用', '/covers/react-hooks.jpg', '56638b16-2ee1-4029-a468-13c92e93ad72', 2, 'published', 0, 178, 32, 8, '2024-01-12 16:45:00'),
('Node.js性能优化', 'nodejs-optimization', 'Node.js应用性能优化技巧...', '提升Node.js应用性能的方法', '/covers/nodejs.jpg', 'c3d4e5f6-a7b8-901c-cdef-345678901234', 3, 'published', 0, 67, 8, 2, '2024-01-05 11:20:00'),
('Docker容器化部署', 'docker-deployment', '使用Docker部署Web应用...', 'Docker的基本使用和部署流程', '/covers/docker.jpg', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'draft', 0, 0, 0, 0, NULL);

-- 插入标签数据
INSERT INTO tags (name, slug, description, post_count) VALUES
('Vue', 'vue', 'Vue.js相关', 1),
('前端', 'frontend', '前端开发', 2),
('Java', 'java', 'Java编程', 1),
('Spring', 'spring', 'Spring框架', 1),
('Python', 'python', 'Python编程', 1),
('React', 'react', 'React框架', 1),
('Node.js', 'nodejs', 'Node.js开发', 1),
('教程', 'tutorial', '学习教程', 2);

-- 插入文章标签关联数据
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2), (1, 8),    -- Vue3文章关联Vue、前端、教程
(2, 3), (2, 4), (2, 8),    -- Spring Boot文章关联Java、Spring、教程
(3, 5),                     -- Python数据分析关联Python
(4, 2), (4, 6),             -- React Hooks关联前端、React
(5, 7);                     -- Node.js性能优化关联Node.js

-- 插入评论数据
INSERT INTO comments (post_id, user_id, parent_id, author_name, author_email, content, status, like_count) VALUES
(1, NULL, 0, '访客张三', 'zhangsan@example.com', '这篇文章很有帮助，谢谢分享！', 'approved', 2),
(1, '56638b16-2ee1-4029-a468-13c92e93ad72', 0, 'mice', '2902314437@qq.com', '欢迎大家提出宝贵意见！', 'approved', 5),
(1, NULL, 1, '李四', 'lisi@example.com', '@访客张三 同感，写得很好！', 'approved', 1),
(3, NULL, 0, '王五', 'wangwu@example.com', '数据分析的案例很实用', 'approved', 3),
(3, 'b2c3d4e5-f6a7-890b-bcde-f23456789012', 0, 'author1', 'author1@example.com', '谢谢支持，后续会写更多实战案例', 'approved', 2),
(4, NULL, 0, '新手上路', 'beginner@example.com', 'Hooks的概念还是有点难理解', 'pending', 0);

-- 插入附件数据
INSERT INTO attachments (filename, original_name, file_path, file_size, mime_type, file_type, user_id, post_id) VALUES
('vue3-cover.jpg', 'vue3封面图.jpg', '/uploads/images/vue3-cover.jpg', 204800, 'image/jpeg', 'image', '56638b16-2ee1-4029-a468-13c92e93ad72', 1),
('springboot-diagram.png', '架构图.png', '/uploads/images/springboot-diagram.png', 156300, 'image/png', 'image', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2),
('python-code.py', '示例代码.py', '/uploads/documents/python-code.py', 10240, 'text/x-python', 'document', 'b2c3d4e5-f6a7-890b-bcde-f23456789012', 3),
('react-demo.zip', '演示项目.zip', '/uploads/other/react-demo.zip', 512000, 'application/zip', 'other', '56638b16-2ee1-4029-a468-13c92e93ad72', NULL);