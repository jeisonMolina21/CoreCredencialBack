const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemParameter = sequelize.define('SystemParameter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1,
        validate: {
            is: /^1$/
        }
    },
    login: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    maintenance: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    path_image_system: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    mercadopago_mode: {
        type: DataTypes.ENUM('SANDBOX', 'PRODUCTION'),
        allowNull: false,
        defaultValue: 'SANDBOX'
    },
}, {
    tableName: 'system_parameters',
    timestamps: false,
});

module.exports = SystemParameter;