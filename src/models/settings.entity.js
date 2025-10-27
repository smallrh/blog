const { EntitySchema } = require('typeorm');

const SettingsEntity = new EntitySchema({
  name: 'Settings',
  tableName: 'settings',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    key: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true
    },
    value: {
      type: 'longtext',
      nullable: true
    },
    description: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    type: {
      type: 'enum',
      enum: ['system', 'user'],
      default: 'system'
    },
    status: {
      type: 'tinyint',
      default: 1
    }
  }
});

module.exports = SettingsEntity;