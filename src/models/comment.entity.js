const { EntitySchema } = require('typeorm');

const CommentEntity = new EntitySchema({
  name: 'Comment',
  tableName: 'comments',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: 'increment'
    },
    post_id: {
      type: 'bigint',
      nullable: false,
      name: 'post_id'
    },
    user_id: {
      type: 'varchar',
      length: 50,
      nullable: true,
      name: 'user_id'
    },
    parent_id: {
      type: 'bigint',
      default: 0,
      name: 'parent_id'
    },
    author_name: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    author_email: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    author_url: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    author_ip: {
      type: 'varchar',
      length: 45,
      nullable: true,
      name: 'author_ip'
    },
    content: {
      type: 'text',
      nullable: false
    },
    status: {
      type: 'enum',
      enum: ['pending', 'approved', 'spam', 'trash'],
      default: 'pending'
    },
    like_count: {
      type: 'int',
      default: 0
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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      nullable: true
    },
    post: {
      type: 'many-to-one',
      target: 'Post',
      joinColumn: { name: 'post_id' },
      nullable: false
    }
  },
  indices: [
    { name: 'idx_post_id', columns: ['post_id'] },
    { name: 'idx_user_id', columns: ['user_id'] },
    { name: 'idx_parent_id', columns: ['parent_id'] },
    { name: 'idx_status', columns: ['status'] }
  ]
});

module.exports = CommentEntity;