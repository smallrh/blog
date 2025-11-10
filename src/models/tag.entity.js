const { EntitySchema } = require('typeorm');

const TagEntity = new EntitySchema({
  name: 'Tag',
  tableName: 'tags',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment'
    },
    name: {
      type: 'varchar',
      length: 30,
      nullable: false,
      unique: true
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
    post_count: {
      type: 'int',
      default: 0,
      name: 'post_count'
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
      type: 'many-to-many',
      target: 'Post',
      inverseSide: 'tags'
    }
  }
});

module.exports = TagEntity;