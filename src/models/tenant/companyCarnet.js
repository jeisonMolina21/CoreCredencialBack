const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CompanyCarnet = sequelize.define('CompanyCarnet', {
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
    carnet_id: {
        type: DataTypes.BIGINT, // BIGINT prevents integer overflow with timestamp-based IDs
        allowNull: false,
        unique: true,
    },
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "company_template_carnets",
            key: "id",
        },
    },
    type_carnet: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token_carnet: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    valid_from: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    valid_to: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'company_carnets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['company_id'], name: 'idx_carnet_company_id' },
        { fields: ['company_id', 'status'], name: 'idx_carnet_company_status' },
        { fields: ['company_id', 'created_at'], name: 'idx_carnet_company_created' },
        { fields: ['template_id'], name: 'idx_carnet_template_id' },
        { fields: ['valid_to'], name: 'idx_carnet_valid_to' }
    ]
});

module.exports = CompanyCarnet;