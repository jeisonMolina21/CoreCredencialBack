const { CompanyArea } = require('../models');
const { checkPlanLimit } = require('../utils/planLimits');

class CompanyAreaService {
    async getAll(companyId) {
        return await CompanyArea.findAll({
            where: { company_id: companyId },
            order: [['area_name', 'ASC']]
        });
    }

    async getById(id, companyId) {
        return await CompanyArea.findOne({
            where: { id, company_id: companyId }
        });
    }

    async create(data) {
        // Validar límite de plan
        await checkPlanLimit(data.company_id, 'areas');
        return await CompanyArea.create(data);
    }

    async update(id, companyId, data) {
        const area = await this.getById(id, companyId);
        if (!area) throw new Error('Área no encontrada');
        return await area.update(data);
    }

    async delete(id, companyId) {
        const area = await this.getById(id, companyId);
        if (!area) throw new Error('Área no encontrada');
        return await area.destroy();
    }
}

module.exports = new CompanyAreaService();
