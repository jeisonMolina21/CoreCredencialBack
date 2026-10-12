const { CompanyUser, CompanyRol, CompanyArea, CompanyHeadquarter } = require('../models');
const { checkPlanLimit } = require('../utils/planLimits');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

class CompanyUserService {
    async getAll(companyId, queryParams = {}) {
        const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(queryParams, {
            defaultLimit: 25,
            defaultSortBy: 'last_name',
            defaultSortOrder: 'ASC'
        });

        const where = { company_id: companyId };

        if (search) {
            where[Op.or] = [
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } },
                { company_email: { [Op.like]: `%${search}%` } },
                { number_id: { [Op.like]: `%${search}%` } }
            ];
        }

        if (queryParams.area_id) {
            where.company_area_id = queryParams.area_id;
        }

        if (queryParams.rol_id) {
            where.company_rol_id = queryParams.rol_id;
        }

        if (queryParams.headquarter_id) {
            where.company_headquarter_id = queryParams.headquarter_id;
        }

        if (queryParams.status !== undefined && queryParams.status !== '') {
            where.status = queryParams.status === 'true' || queryParams.status === true || queryParams.status === '1';
        }

        // Si se requiere toda la lista (p. ej. para selectores dropdown en el frontend)
        if (queryParams.all === 'true') {
            const users = await CompanyUser.findAll({
                where,
                include: [
                    { model: CompanyRol, attributes: ['id', 'rol_name'] },
                    { model: CompanyArea, attributes: ['id', 'area_name'] },
                    { model: CompanyHeadquarter, as: 'headquarter', attributes: ['id', 'name', 'city'] }
                ],
                order: [[sortBy, sortOrder]]
            });
            return { data: users, meta: { total: users.length, page: 1, totalPages: 1 } };
        }

        const { count, rows } = await CompanyUser.findAndCountAll({
            where,
            include: [
                { model: CompanyRol, attributes: ['id', 'rol_name'] },
                { model: CompanyArea, attributes: ['id', 'area_name'] },
                { model: CompanyHeadquarter, as: 'headquarter', attributes: ['id', 'name', 'city'] }
            ],
            limit,
            offset,
            order: [[sortBy, sortOrder], ['id', 'ASC']]
        });

        return formatPaginatedResponse(rows, count, page, limit);
    }

    async getById(id, companyId) {
        return await CompanyUser.findOne({
            where: { id, company_id: companyId },
            include: [
                { model: CompanyRol, attributes: ['id', 'rol_name'] },
                { model: CompanyArea, attributes: ['id', 'area_name'] },
                { model: CompanyHeadquarter, as: 'headquarter', attributes: ['id', 'name', 'city'] }
            ]
        });
    }

    async create(data) {
        // Validar límite de plan
        await checkPlanLimit(data.company_id, 'users');
        return await CompanyUser.create(data);
    }

    async update(id, companyId, data) {
        const user = await CompanyUser.findOne({ where: { id, company_id: companyId } });
        if (!user) throw new Error('Usuario no encontrado');
        return await user.update(data);
    }

    async delete(id, companyId) {
        const user = await CompanyUser.findOne({ where: { id, company_id: companyId } });
        if (!user) throw new Error('Usuario no encontrado');
        if (user.is_protected) throw new Error('Este usuario está protegido y no puede ser eliminado');
        return await user.destroy();
    }
}

module.exports = new CompanyUserService();
