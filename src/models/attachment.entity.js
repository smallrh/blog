const { EntitySchema } = require('typeorm');

const AttachmentEntity = new EntitySchema({
  name: 'Attachment',
  tableName: 'attachments',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    file_name: {
      type: 'varchar',
      length: 255,
      nullable: false,
      name: 'file_name'
    },
    file_path: {
      type: 'varchar',
      length: 255,
      nullable: false,
      name: 'file_path'
    },
    file_type: {
      type: 'varchar',
      length: 100,
      nullable: false,
      name: 'file_type'
    },
    file_size: {
      type: 'bigint',
      nullable: false,
      name: 'file_size'
    },
    url: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    thumbnail_url: {
      type: 'varchar',
      length: 255,
      nullable: true,
      name: 'thumbnail_url'
    },
    media_type: {
      type: 'enum',
      enum: ['image', 'document', 'video', 'audio', 'other'],
      default: 'other',
      name: 'media_type'
    },
    user_id: {
      type: 'int',
      name: 'user_id'
    },
    created_at: {
      type: 'timestamp',
      name: 'created_at',
      createDate: true
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' }
    }
  }
});

module.exports = AttachmentEntity;