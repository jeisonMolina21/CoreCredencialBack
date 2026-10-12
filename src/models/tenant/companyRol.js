const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CompanyRol = sequelize.define('CompanyRol', {
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
    rol_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_protected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'company_rols',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['company_id'], name: 'idx_rol_company_id' },
        { fields: ['company_headquarter_id'], name: 'idx_rol_hq_id' }
    ]
});

module.exports = CompanyRol;