const { EntitySchema } = require('typeorm');

const PostTagEntity = new EntitySchema({
  name: 'PostTag',
  tableName: 'post_tags',
  columns: {
    post_id: {
      type: 'bigint',
      nullable: false,
      primary: true,
      name: 'post_id'
    },
    tag_id: {
      type: 'int',
      nullable: false,
      primary: true,
      name: 'tag_id'
    },
    created_at: {
      type: 'timestamp',
      nullable: true,
      name: 'created_at'
    }
  },
  relations: {
    post: {
      type: 'many-to-one',
      target: 'Post',
      joinColumn: { name: 'post_id' }
    },
    tag: {
      type: 'many-to-one',
      target: 'Tag',
      joinColumn: { name: 'tag_id' }
    }
  }
});

module.exports = PostTagEntity;