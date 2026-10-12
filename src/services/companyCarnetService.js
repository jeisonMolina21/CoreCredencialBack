const { CompanyCarnet, CompanyTemplateCarnet } = require('../models');
const { checkPlanLimit } = require('../utils/planLimits');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');
const crypto = require('crypto');

class CompanyCarnetService {
    async getAll(companyId, queryParams = {}) {
        const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(queryParams, {
            defaultLimit: 25,
            defaultSortBy: 'created_at',
            defaultSortOrder: 'DESC'
        });

        const where = { company_id: companyId };

        if (search) {
            where[Op.or] = [
                { token_carnet: { [Op.like]: `%${search}%` } },
                { type_carnet: { [Op.like]: `%${search}%` } }
            ];
        }

        if (queryParams.status) {
            where.status = queryParams.status;
        }

        if (queryParams.template_id) {
            where.template_id = queryParams.template_id;
        }

        if (queryParams.all === 'true') {
            const carnets = await CompanyCarnet.findAll({
                where,
                include: [{
                    model: CompanyTemplateCarnet,
                    as: 'template',
                    attributes: ['id', 'template_name']
                }],
                order: [[sortBy, sortOrder]]
            });
            return { data: carnets, meta: { total: carnets.length, page: 1, totalPages: 1 } };
        }

        const { count, rows } = await CompanyCarnet.findAndCountAll({
            where,
            include: [{
                model: CompanyTemplateCarnet,
                as: 'template',
                attributes: ['id', 'template_name']
            }],
            limit,
            offset,
            order: [[sortBy, sortOrder], ['id', 'DESC']]
        });

        return formatPaginatedResponse(rows, count, page, limit);
    }

    async getById(id, companyId) {
        return await CompanyCarnet.findOne({
            where: { id, company_id: companyId },
            include: [{
                model: CompanyTemplateCarnet,
                as: 'template',
                attributes: ['id', 'template_name']
            }]
        });
    }

    async create(data) {
        // Validar límite de plan
        await checkPlanLimit(data.company_id, 'carnets');

        // Generar un ID numérico seguro que no desborde el tipo BIGINT
        if (!data.carnet_id) {
            data.carnet_id = Date.now();
        }
        
        // Generar token criptográfico único si no se proporciona
        if (!data.token_carnet) {
            data.token_carnet = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
        }
        
        return await CompanyCarnet.create(data);
    }

    async update(id, companyId, data) {
        const carnet = await this.getById(id, companyId);
        if (!carnet) throw new Error('Carnet no encontrado');
        return await carnet.update(data);
    }

    async delete(id, companyId) {
        const carnet = await this.getById(id, companyId);
        if (!carnet) throw new Error('Carnet no encontrado');
        return await carnet.destroy();
    }
}

module.exports = new CompanyCarnetService();
