const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CompanyParameter = sequelize.define('CompanyParameter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: "companies",
            key: "id",
        },
    },
    login: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    maintenance: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    primary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#0062E3'
    },
    secondary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#001F3F'
    },
    font_family: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Inter'
    },
    border_radius: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '12px'
    },
    sidebar_theme: {
        type: DataTypes.ENUM('dark', 'light', 'brand'),
        allowNull: false,
        defaultValue: 'dark'
    }
}, {
    tableName: 'company_parameters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = CompanyParameter;