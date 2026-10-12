const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InstallationMode = sequelize.define('InstallationMode', {
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
            model: 'companies',
            key: 'id',
        },
    },
    mode_name: {
        type: DataTypes.ENUM('CLOUDHUB', 'ON-PREMISE', 'HYBRID'),
        allowNull: false,
        defaultValue: 'CLOUDHUB',
    },
    installation_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'installation_modes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = InstallationMode;
