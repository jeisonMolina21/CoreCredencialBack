const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    max_users: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    max_templates_carnets: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    max_carnets: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    max_events_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    max_headquarters: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    max_areas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    max_roles: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Plan;
