const { EntitySchema } = require('typeorm');

const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'varchar',
      length: 50,
      primary: true,
      generated: 'uuid'// 主键生成策略为uuid（别删除，安全）
    },
    username: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
      select: false
    },
    email: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true
    },
    display_name: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    avatar: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    role: {
      type: 'enum',
      enum: ['admin', 'editor', 'author', 'subscriber'],
      default: 'subscriber'
    },
    last_login_at: {
      type: 'timestamp',
      nullable: true
    },
    login_count: {
      type: 'int',
      default: 0
    },
    status: {
      type: 'tinyint',
      default: 1
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      name: 'created_at'
    },
    updated_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
      name: 'updated_at'
    }
  },
  relations: {
    posts: {
      type: 'one-to-many',
      target: 'Post',
      inverseSide: 'user'
    },
    comments: {
      type: 'one-to-many',
      target: 'Comment',
      inverseSide: 'user'
    },
    attachments: {
      type: 'one-to-many',
      target: 'Attachment',
      inverseSide: 'user'
    }
  }
});

module.exports = UserEntity;