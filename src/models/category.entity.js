const { EntitySchema } = require('typeorm');

const CategoryEntity = new EntitySchema({
  name: 'Category',
  tableName: 'categories',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    slug: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true
    },
    parent_id: {
      type: 'int',
      nullable: true,
      name: 'parent_id'
    },
    post_count: {
      type: 'int',
      default: 0,
      name: 'post_count'
    },
    sort_order: {
      type: 'int',
      default: 0,
      name: 'sort_order'
    },
    status: {
      type: 'tinyint',
      default: 1
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
    posts: {
      type: 'one-to-many',
      target: 'Post',
      inverseSide: 'category'
    }
  }
});

module.exports = CategoryEntity;