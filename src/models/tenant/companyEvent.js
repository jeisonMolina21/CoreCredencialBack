const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CompanyEvent = sequelize.define('CompanyEvent', {
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
    event_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    event_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'company_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = CompanyEvent;
