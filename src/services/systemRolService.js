const { SystemRol } = require('../models');

class SystemRolService {
    async getAll() {
        return await SystemRol.findAll();
    }

    async getById(id) {
        return await SystemRol.findByPk(id);
    }

    async create(data) {
        return await SystemRol.create(data);
    }

    async update(id, data) {
        const rol = await SystemRol.findByPk(id);
        if (!rol) throw new Error('Rol no encontrado');
        return await rol.update(data);
    }

    async delete(id) {
        const rol = await SystemRol.findByPk(id);
        if (!rol) throw new Error('Rol no encontrado');
        return await rol.destroy();
    }
}

module.exports = new SystemRolService();
