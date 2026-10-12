const { sequelize, Company, Subscription, Plan, CompanyUser, CompanyRol, CompanyParameter } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

class CompanyService {
    /**
     * Lista paginada de empresas con búsqueda opcional.
     */
    async getAll({ page = 1, limit = 20, search = '' } = {}) {
        const offset = (page - 1) * limit;

        const where = search
            ? {
                [Op.or]: [
                    { name:   { [Op.like]: `%${search}%` } },
                    { nit_id: { [Op.like]: `%${search}%` } }
                ]
              }
            : {};

        const { count, rows } = await Company.findAndCountAll({
            where,
            order: [
                ['is_active', 'DESC'],
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
        return await Company.findByPk(id, {
            include: [
                { model: CompanyParameter, as: 'parameters' }
            ]
        });
    }

    async create(data) {
        const transaction = await sequelize.transaction();
        try {
            const company = await Company.create(data, { transaction });
            
            if (data.plan_id) {
                const startDate = new Date();
                const billingCycle = data.billing_cycle || 'MONTHLY';
                
                let nextPaymentDate = new Date(startDate);
                if (billingCycle === 'YEARLY') {
                    nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
                } else {
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                }
                
                const subscription = await Subscription.create({
                    company_id: company.id,
                    plan_id: data.plan_id,
                    status: 'ACTIVE',
                    start_date: startDate,
                    billing_cycle: billingCycle,
                    next_payment_date: nextPaymentDate,
                    auto_renew: true
                }, { transaction });

                await company.update({
                    plan_id: data.plan_id,
                    active_subscription_id: subscription.id
                }, { transaction });
            }
            
            await transaction.commit();
            return company;
        } catch(error) {
            await transaction.rollback();
            throw error;
        }
    }

    async update(id, data) {
        const transaction = await sequelize.transaction();
        try {
            const company = await Company.findByPk(id, { transaction });
            if (!company) {
                throw new AppError('Empresa no encontrada', 404);
            }
            
            if (data.is_active === false && company.is_active === true) {
                await Subscription.update(
                    { status: 'CANCELLED', auto_renew: false },
                    { where: { company_id: id }, transaction }
                );
            }

            await company.update(data, { transaction });
            await transaction.commit();
            return company;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async delete(id) {
        const transaction = await sequelize.transaction();
        try {
            const company = await Company.findByPk(id, { transaction });
            if (!company) {
                throw new AppError('Empresa no encontrada', 404);
            }
            
            await Subscription.update(
                { status: 'CANCELLED', auto_renew: false },
                { where: { company_id: id }, transaction }
            );

            await company.update({ is_active: false }, { transaction });
            await transaction.commit();
            return company;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateParameters(id, data, file) {
        const transaction = await sequelize.transaction();
        try {
            const company = await Company.findByPk(id, { transaction });
            if (!company) throw new AppError('Empresa no encontrada', 404);

            let parameters = await CompanyParameter.findOne({ where: { company_id: id }, transaction });
            
            if (!parameters) {
                parameters = await CompanyParameter.create({ company_id: id, ...data }, { transaction });
            } else {
                await parameters.update(data, { transaction });
            }

            if (file) {
                const logoPath = `/uploads/logos/${file.filename}`;
                await company.update({ path_image: logoPath }, { transaction });
            }

            await transaction.commit();
            return { company, parameters };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Registro administrativo de empresa (Desde panel Admin)
     */
    async adminRegister(data, file) {
        const {
            company_name, nit_id, subdomain,
            plan_id, billing_cycle = 'MONTHLY',
            fullname, type_id, number_id, email, password,
            primary_color, secondary_color, font_family, border_radius, sidebar_theme
        } = data;

        const logoPath = file ? `/uploads/logos/${file.filename}` : null;

        const transaction = await sequelize.transaction();
        try {
            // 1. Verificar plan
            const plan = await Plan.findOne({ where: { id: plan_id, is_active: true }, transaction });
            if (!plan) throw new AppError('El plan seleccionado no existe o está inactivo', 404);

            // 2. Crear empresa
            const generatedSubdomain = subdomain || company_name.toLowerCase().replace(/\s+/g, '').substring(0, 20);

            const newCompany = await Company.create({
                name: company_name,
                nit_id: nit_id || null,
                subdomain: generatedSubdomain,
                path_image: logoPath,
                is_active: true
            }, { transaction });

            // 3. Crear Branding
            await CompanyParameter.create({
                company_id: newCompany.id,
                login: true,
                maintenance: false,
                primary_color: primary_color || '#0062E3',
                secondary_color: secondary_color || '#001F3F',
                font_family: font_family || 'Inter',
                border_radius: border_radius || '12px',
                sidebar_theme: sidebar_theme || 'dark'
            }, { transaction });

            // 4. Crear suscripción
            const startDate = new Date();
            const nextPaymentDate = new Date(startDate);
            if (billing_cycle === 'YEARLY') {
                nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
            } else {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            }

            const newSubscription = await Subscription.create({
                company_id: newCompany.id,
                plan_id: plan.id,
                status: 'ACTIVE',
                start_date: startDate,
                billing_cycle,
                next_payment_date: nextPaymentDate,
                auto_renew: true
            }, { transaction });

            await newCompany.update({
                plan_id: plan.id,
                active_subscription_id: newSubscription.id
            }, { transaction });

            // 5. Crear rol Admin
            const adminRol = await CompanyRol.create({
                company_id: newCompany.id,
                rol_name: 'Admin',
                is_protected: true
            }, { transaction });

            // 6. Crear usuario administrador
            const nameParts = fullname.trim().split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

            const newUser = await CompanyUser.create({
                company_id: newCompany.id,
                company_rol_id: adminRol.id,
                first_name,
                last_name,
                type_id,
                number_id,
                company_email: email,
                staff_mail: email,
                password,
                system_role: 'admin',
                status: true,
                is_protected: true
            }, { transaction });

            await transaction.commit();

            return {
                company: { id: newCompany.id, name: newCompany.name },
                subscription: { id: newSubscription.id, plan: plan.name, next_payment_date: nextPaymentDate },
                admin: { id: newUser.id, email: newUser.company_email }
            };
        } catch (error) {
            await transaction.rollback();
            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = error.errors[0]?.path;
                let message = 'Ya existe un registro con esos datos.';
                if (field === 'company_email' || field === 'staff_mail') message = 'El correo electrónico ya está registrado.';
                if (field === 'number_id') message = 'El número de identificación ya está registrado.';
                if (field === 'nit_id') message = 'El NIT de la empresa ya está registrado.';
                if (field === 'subdomain') message = 'El subdominio ya está en uso.';
                throw new AppError(message, 400);
            }
            throw error;
        }
    }

    async checkNit(nit) {
        const company = await Company.findOne({ where: { nit_id: nit } });
        return !!company;
    }
}

module.exports = new CompanyService();
