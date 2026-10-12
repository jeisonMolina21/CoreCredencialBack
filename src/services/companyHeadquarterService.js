const { CompanyHeadquarter } = require('../models');
const { checkPlanLimit } = require('../utils/planLimits');

class CompanyHeadquarterService {
    async getAll(companyId) {
        return await CompanyHeadquarter.findAll({
            where: { company_id: companyId },
            order: [['name', 'ASC']]
        });
    }

    async getById(id, companyId) {
        return await CompanyHeadquarter.findOne({
            where: { id, company_id: companyId }
        });
    }

    async create(data) {
        // Validar límite de plan
        await checkPlanLimit(data.company_id, 'headquarters');

        // Si se marca como principal, desmarcar las otras sedes de la empresa
        if (data.is_main) {
            await CompanyHeadquarter.update(
                { is_main: false },
                { where: { company_id: data.company_id } }
            );
        }
        return await CompanyHeadquarter.create(data);
    }

    async update(id, companyId, data) {
        const headquarter = await this.getById(id, companyId);
        if (!headquarter) throw new Error('Sede no encontrada');

        // Si se marca como principal, desmarcar las otras sedes de la empresa
        if (data.is_main) {
            await CompanyHeadquarter.update(
                { is_main: false },
                { where: { company_id: companyId } }
            );
        }

        return await headquarter.update(data);
    }

    async delete(id, companyId) {
        const headquarter = await this.getById(id, companyId);
        if (!headquarter) throw new Error('Sede no encontrada');
        return await headquarter.destroy();
    }
}

module.exports = new CompanyHeadquarterService();
