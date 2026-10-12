const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const bcrypt = require('bcryptjs');

const CompanyUser = sequelize.define('CompanyUser', {
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
            key: 'id'
        }
    },
    company_area_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'company_areas',
            key: 'id'
        }
    },
    company_rol_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'company_rols',
            key: 'id'
        }
    },
    company_headquarter_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'company_headquarters',
            key: 'id'
        }
    },
    company_carnet_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type_id: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    number_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    rh_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    staff_mail: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    staff_phone: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    system_role: {
        type: DataTypes.ENUM("admin", "visualizer", "common", "roster", "retired"),
        allowNull: false,
        defaultValue: "common",
        field: "system_role",
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    is_protected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'company_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    },
    indexes: [
        { unique: true, fields: ['company_email'], name: 'idx_unique_company_email' },
        { fields: ['company_id'], name: 'idx_company_id' },
        { fields: ['status'], name: 'idx_company_user_status' },
        { fields: ['company_id', 'last_name', 'first_name'], name: 'idx_company_user_name_sort' },
        { fields: ['company_id', 'status'], name: 'idx_company_user_company_status' },
        { fields: ['company_id', 'company_area_id'], name: 'idx_company_user_area' },
        { fields: ['company_id', 'company_rol_id'], name: 'idx_company_user_rol' },
        { fields: ['company_id', 'company_headquarter_id'], name: 'idx_company_user_hq' },
        { fields: ['company_id', 'number_id'], name: 'idx_company_user_doc' }
    ],
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Asegurar que nunca se serialice la contraseña en JSON
CompanyUser.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = CompanyUser;
