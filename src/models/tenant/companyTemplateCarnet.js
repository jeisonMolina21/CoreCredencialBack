const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CompanyTemplateCarnet = sequelize.define('CompanyTemplateCarnet', {
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
    template_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value_template: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    html_template: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    path_image_template: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }
}, {
    tableName: 'company_template_carnets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['company_id'], name: 'idx_template_company_id' },
        { fields: ['company_id', 'is_active'], name: 'idx_template_active' }
    ]
});

module.exports = CompanyTemplateCarnet;