const { EntitySchema } = require('typeorm');

const PostEntity = new EntitySchema({
  name: 'Post',
  tableName: 'posts',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    title: {
      type: 'varchar',
      length: 255,
      nullable: false
    },
    slug: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true
    },
    content: {
      type: 'text',
      nullable: false
    },
    summary: {
      type: 'text',
      nullable: true
    },
    cover_image: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    view_count: {
      type: 'int',
      default: 0
    },
    comment_count: {
      type: 'int',
      default: 0
    },
    like_count: {
      type: 'int',
      default: 0
    },
    is_published: {
      type: 'tinyint',
      default: 1
    },
    is_featured: {
      type: 'tinyint',
      default: 0
    },
    seo_title: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    seo_description: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    user_id: {
      type: 'int',
      name: 'user_id'
    },
    category_id: {
      type: 'int',
      name: 'category_id',
      nullable: true
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
  }
});

module.exports = PostEntity;