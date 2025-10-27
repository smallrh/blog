const { EntitySchema } = require('typeorm');

const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    email: {
      type: 'varchar',
      length: 50,
      nullable: false,
      unique: true
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
      select: false
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    avatar: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    bio: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    role: {
      type: 'enum',
      enum: ['user', 'admin', 'superadmin'],
      default: 'user'
    },
    status: {
      type: 'tinyint',
      default: 1
    },
    last_login_ip: {
      type: 'varchar',
      length: 100,
      nullable: true,
      name: 'last_login_ip'
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
    },
    resetToken: {
      type: 'varchar',
      length: 100,
      nullable: true,
      select: false
    },
    resetTokenExpires: {
      type: 'timestamp',
      nullable: true,
      select: false
    },
    verificationCode: {
      type: 'varchar',
      length: 6,
      nullable: true,
      select: false
    },
    verificationCodeExpires: {
      type: 'timestamp',
      nullable: true,
      select: false
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