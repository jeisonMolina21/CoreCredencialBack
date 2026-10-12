const { CompanyTemplateCarnet } = require('../models');
const { checkPlanLimit } = require('../utils/planLimits');

class CompanyTemplateCarnetService {
    async getAll(companyId) {
        return await CompanyTemplateCarnet.findAll({
            where: { company_id: companyId },
            order: [['created_at', 'DESC']]
        });
    }

    async getById(id, companyId) {
        return await CompanyTemplateCarnet.findOne({
            where: { id, company_id: companyId }
        });
    }

    async create(data) {
        // Validar límite de plan
        await checkPlanLimit(data.company_id, 'templates');
        return await CompanyTemplateCarnet.create(data);
    }

    async update(id, companyId, data) {
        const template = await this.getById(id, companyId);
        if (!template) throw new Error('Plantilla no encontrada');
        return await template.update(data);
    }

    async delete(id, companyId) {
        const template = await this.getById(id, companyId);
        if (!template) throw new Error('Plantilla no encontrada');
        return await template.destroy();
    }
}

module.exports = new CompanyTemplateCarnetService();
