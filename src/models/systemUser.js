const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const SystemUser = sequelize.define('SystemUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'idx_unique_system_user_email',
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    system_role: {
        type: DataTypes.ENUM("admin", "common"),
        allowNull: false,
        defaultValue: "common",
        field: "system_role",
    },
    system_rol_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'system_rols',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'system_users',
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
        { unique: true, fields: ['email'], name: 'idx_unique_system_user_email' },
        { fields: ['status'], name: 'idx_system_user_status' },
        { fields: ['system_role'], name: 'idx_system_user_role' }
    ],
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeDestroy: (user) => {
            if (user.id === 1) {
                throw new Error('No se puede eliminar el usuario administrador predeterminado.');
            }
        },
        beforeUpdate: (user) => {
            if (user.id === 1) {
                if (user.changed('id')) {
                    throw new Error('No se puede cambiar el ID del usuario administrador predeterminado.');
                }
                if (user.changed('status') && !user.status) {
                    throw new Error('El usuario administrador predeterminado debe estar siempre activo.');
                }
            }
        }
    }
});

// Asegurar que nunca se serialice la contraseña en JSON
SystemUser.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = SystemUser;
