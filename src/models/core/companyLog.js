const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CompanyLog = sequelize.define('CompanyLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "companies",
            key: "id",
        },
    },
    id_user_company: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    tableName: 'company_logs',
    timestamps: true,
    createdAt: 'created_at',
    indexes: [
        { fields: ['company_id'], name: 'idx_company_log_company' },
        { fields: ['company_id', 'created_at'], name: 'idx_company_log_company_created' },
        { fields: ['table_name', 'record_id'], name: 'idx_company_log_table_record' },
        { fields: ['company_id', 'action'], name: 'idx_company_log_action' }
    ]
});

module.exports = CompanyLog;