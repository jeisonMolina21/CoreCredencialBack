const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id',
        },
    },
    plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'plans',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'TRIAL', 'PENDING_PAYMENT'),
        defaultValue: 'TRIAL',
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    billing_cycle: {
        type: DataTypes.ENUM('MONTHLY', 'YEARLY'),
        defaultValue: 'MONTHLY',
    },
    next_payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    auto_renew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    is_renewal_locked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Bloquea la renovación manual cuando la empresa está siendo desactivada',
    },
    payment_method_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'payment_methods',
            key: 'id',
        },
    },
}, {
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['company_id'], name: 'idx_subscription_company_id' },
        { fields: ['company_id', 'status'], name: 'idx_subscription_company_status' },
        { fields: ['status'], name: 'idx_subscription_status' },
        { fields: ['next_payment_date'], name: 'idx_subscription_next_payment' },
        { fields: ['plan_id'], name: 'idx_subscription_plan_id' }
    ]
});

module.exports = Subscription;
