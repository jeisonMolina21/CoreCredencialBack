const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nit_id: {
        type: DataTypes.STRING,
        unique: 'idx_unique_nit_id',
    },
    subdomain: {
        type: DataTypes.STRING,
        unique: 'idx_unique_subdomain',
    },
    path_image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    plan_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'plans',
            key: 'id'
        }
    },
    active_subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'subscriptions',
            key: 'id'
        }
    }
}, {
    tableName: 'companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['is_active'], name: 'idx_company_active' },
        { fields: ['plan_id'], name: 'idx_company_plan_id' }
    ]
});

module.exports = Company;
