const { EntitySchema } = require('typeorm');

const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'varchar',
      length: 50,
      primary: true
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
      nullable: false
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
      nullable: true,
      name: 'last_login_at'
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
  },
  indices: [
    { name: 'idx_username', columns: ['username'] },
    { name: 'idx_email', columns: ['email'] },
    { name: 'idx_status', columns: ['status'] }
  ]
});

module.exports = UserEntity;