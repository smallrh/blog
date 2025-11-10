const { EntitySchema } = require('typeorm');

const CategoryEntity = new EntitySchema({
  name: 'Category',
  tableName: 'categories',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment'
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    slug: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true
    },
    description: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    parent_id: {
      type: 'int',
      default: 0,
      name: 'parent_id'
    },
    sort_order: {
      type: 'int',
      default: 0,
      name: 'sort_order'
    },
    post_count: {
      type: 'int',
      default: 0,
      name: 'post_count'
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
      inverseSide: 'category'
    }
  },
  indices: [
    { name: 'idx_parent_id', columns: ['parent_id'] },
    { name: 'idx_sort_order', columns: ['sort_order'] }
  ]
});

module.exports = CategoryEntity;