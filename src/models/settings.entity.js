const { EntitySchema } = require('typeorm');

const SettingsEntity = new EntitySchema({
  name: 'Settings',
  tableName: 'settings',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment'
    },
    key: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true
    },
    value: {
      type: 'text',
      nullable: true
    },
    description: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    type: {
      type: 'varchar',
      length: 20,
      default: 'system'
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
  indices: [
    { name: 'idx_key', columns: ['key'] },
    { name: 'idx_status', columns: ['status'] }
  ]
});

module.exports = SettingsEntity;