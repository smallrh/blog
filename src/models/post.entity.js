const { EntitySchema } = require('typeorm');

const PostEntity = new EntitySchema({
  name: 'Post',
  tableName: 'posts',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: 'increment'
    },
    title: {
      type: 'varchar',
      length: 200,
      nullable: false
    },
    slug: {
      type: 'varchar',
      length: 200,
      nullable: false,
      unique: true
    },
    content: {
      type: 'longtext',
      nullable: false
    },
    summary: {
      type: 'varchar',
      length: 500,
      nullable: true
    },
    cover_image: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    user_id: {
      type: 'varchar',
      length: 50,
      nullable: false,
      name: 'user_id'
    },
    category_id: {
      type: 'int',
      nullable: true,
      name: 'category_id'
    },
    status: {
      type: 'enum',
      enum: ['draft', 'published', 'private', 'pending'],
      default: 'draft'
    },
    is_top: {
      type: 'tinyint',
      default: 0
    },
    password: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    published_at: {
      type: 'timestamp',
      nullable: true
    },
    view_count: {
      type: 'int',
      default: 0
    },
    like_count: {
      type: 'int',
      default: 0
    },
    comment_count: {
      type: 'int',
      default: 0
    },
    meta_keywords: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    meta_description: {
      type: 'varchar',
      length: 500,
      nullable: true
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
      joinColumn: { name: 'user_id' }
    },
    category: {
      type: 'many-to-one',
      target: 'Category',
      joinColumn: { name: 'category_id' }
    },
    tags: {
      type: 'many-to-many',
      target: 'Tag',
      joinTable: {
        name: 'post_tags',
        joinColumn: { name: 'post_id' },
        inverseJoinColumn: { name: 'tag_id' }
      }
    }
  },
  indices: [
    { name: 'idx_user_id', columns: ['user_id'] },
    { name: 'idx_category_id', columns: ['category_id'] },
    { name: 'idx_status', columns: ['status'] },
    { name: 'idx_is_top', columns: ['is_top'] },
    { name: 'idx_published_at', columns: ['published_at'] },
    { name: 'idx_slug', columns: ['slug'] }
  ]
});

module.exports = PostEntity;
