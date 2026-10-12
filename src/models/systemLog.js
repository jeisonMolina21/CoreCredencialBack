const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemLog = sequelize.define('SystemLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    action: {
        type: DataTypes.ENUM("CREATE", "READ", "UPDATE", "DELETE"),
        allowNull: false,
    },
    table_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    record_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    before: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    after: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'system_logs',
    timestamps: true,
    createdAt: 'created_at',
    indexes: [
        { fields: ['user_id'], name: 'idx_system_log_user' },
        { fields: ['created_at'], name: 'idx_system_log_created' },
        { fields: ['table_name', 'record_id'], name: 'idx_system_log_table_record' },
        { fields: ['action'], name: 'idx_system_log_action' }
    ]
});

module.exports = SystemLog;
