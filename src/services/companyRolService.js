const { CompanyRol } = require('../models');
const { checkPlanLimit } = require('../utils/planLimits');

class CompanyRolService {
    async getAll(companyId) {
        return await CompanyRol.findAll({
            where: { company_id: companyId },
            order: [['rol_name', 'ASC']]
        });
    }

    async getById(id, companyId) {
        return await CompanyRol.findOne({
            where: { id, company_id: companyId }
        });
    }

    async create(data) {
        // Validar límite de plan
        await checkPlanLimit(data.company_id, 'roles');
        return await CompanyRol.create(data);
    }

    async update(id, companyId, data) {
        const rol = await this.getById(id, companyId);
        if (!rol) throw new Error('Cargo no encontrado');
        return await rol.update(data);
    }

    async delete(id, companyId) {
        const rol = await this.getById(id, companyId);
        if (!rol) throw new Error('Cargo no encontrado');
        if (rol.is_protected) throw new Error('Este cargo está protegido y no puede ser eliminado');
        return await rol.destroy(); // intenta borrar el cargo directamente a la base de datos, mas no cambia de estado, pero si este rol es asignado a un usuario, se rechazara la peticion por la llave foranea
    }
}

module.exports = new CompanyRolService();
