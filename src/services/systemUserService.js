const { SystemUser, SystemRol } = require('../models');
const { Op } = require('sequelize');

class SystemUserService {
    /**
     * Lista paginada de usuarios de sistema con búsqueda opcional.
     * Activos primero, luego por nombre.
     *
     * @param {object} opts  { page, limit, search }
     */
    async getAll({ page = 1, limit = 20, search = '' } = {}) {
        const offset = (page - 1) * limit;

        const where = search
            ? {
                [Op.or]: [
                    { name:  { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
              }
            : {};

        const { count, rows } = await SystemUser.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            include: [{ model: SystemRol, as: 'rol', attributes: ['id', 'name', 'description'] }],
            order: [
                ['status', 'DESC'],  // activos primero
                ['name', 'ASC']
            ],
            limit: Number(limit),
            offset: Number(offset)
        });

        return {
            data: rows,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    async getById(id) {
        return await SystemUser.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{ model: SystemRol, as: 'rol', attributes: ['id', 'name', 'description'] }]
        });
    }

    async create(data) {
        return await SystemUser.create(data);
    }

    async update(id, data) {
        const user = await SystemUser.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');
        
        // El hook beforeSave en el modelo se encarga de hashear el password si cambió
        return await user.update(data);
    }

    async toggleStatus(id) {
        const user = await SystemUser.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');
        
        // El hook beforeUpdate en el modelo protege al admin (ID 1)
        return await user.update({ status: !user.status });
    }

    async delete(id) {
        const user = await SystemUser.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');
        
        // El hook beforeDestroy en el modelo protege al admin (ID 1)
        return await user.destroy();
    }
}

module.exports = new SystemUserService();
