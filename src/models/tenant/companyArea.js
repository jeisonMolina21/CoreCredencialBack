const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CompanyArea = sequelize.define('CompanyArea', {
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
    company_headquarter_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "company_headquarters",
            key: "id",
        },
    },
    area_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'company_areas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['company_id'], name: 'idx_area_company_id' },
        { fields: ['company_headquarter_id'], name: 'idx_area_hq_id' }
    ]
});

module.exports = CompanyArea;