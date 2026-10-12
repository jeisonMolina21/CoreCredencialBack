const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentMethod = sequelize.define('PaymentMethod', {
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
    gateway_name: {
        type: DataTypes.STRING, // e.g., 'stripe', 'mercado_pago'
        allowNull: false,
    },
    gateway_customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_four: {
        type: DataTypes.STRING(4),
        allowNull: true,
    },
    brand: {
        type: DataTypes.STRING, // e.g., 'Visa', 'Mastercard'
        allowNull: true,
    },
    expiry_date: {
        type: DataTypes.STRING(7), // MM/YYYY
        allowNull: true,
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'payment_methods',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = PaymentMethod;
