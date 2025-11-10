const { EntitySchema } = require('typeorm');

const AttachmentEntity = new EntitySchema({
  name: 'Attachment',
  tableName: 'attachments',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: 'increment'
    },
    filename: {
      type: 'varchar',
      length: 255,
      nullable: false
    },
    original_name: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    file_path: {
      type: 'varchar',
      length: 500,
      nullable: false,
      name: 'file_path'
    },
    file_size: {
      type: 'int',
      nullable: false,
      name: 'file_size'
    },
    mime_type: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    file_type: {
      type: 'enum',
      enum: ['image', 'video', 'audio', 'document', 'other'],
      default: 'other'
    },
    user_id: {
      type: 'varchar',
      length: 50,
      nullable: false,
      name: 'user_id'
    },
    post_id: {
      type: 'bigint',
      nullable: true
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      name: 'created_at'
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' }
    }
  },
  indices: [
    { name: 'idx_user_id', columns: ['user_id'] }
  ]
});

module.exports = AttachmentEntity;