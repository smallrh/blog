const { EntitySchema } = require('typeorm');

const CommentEntity = new EntitySchema({
  name: 'Comment',
  tableName: 'comments',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    content: {
      type: 'text',
      nullable: false
    },
    parent_id: {
      type: 'int',
      nullable: true,
      name: 'parent_id'
    },
    user_agent: {
      type: 'varchar',
      length: 50,
      nullable: true,
      name: 'user_agent'
    },
    ip_address: {
      type: 'varchar',
      length: 50,
      nullable: true,
      name: 'ip_address'
    },
    status: {
      type: 'tinyint',
      default: 1
    },
    user_id: {
      type: 'int',
      nullable: true,
      name: 'user_id'
    },
    post_id: {
      type: 'int',
      name: 'post_id'
    },
    created_at: {
      type: 'timestamp',
      name: 'created_at',
      createDate: true
    },
    updated_at: {
      type: 'timestamp',
      name: 'updated_at',
      updateDate: true
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
      joinColumn: { name: 'post_id' }
    }
  }
});

module.exports = CommentEntity;