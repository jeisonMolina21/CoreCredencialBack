/**
 * ============================================================================
 * SERVICIO CENTRAL DE AUTENTICACIÓN Y REGISTRO (AUTH SERVICE)
 * ============================================================================
 * Maneja el flujo de seguridad, inicio de sesión unificado, segregación de cuentas,
 * firma de tokens JWT, renovación de sesiones, proxy login (impersonación) y el
 * onboarding transaccional de nuevas empresas clientes.
 */

const { sequelize, SystemUser, CompanyUser, Company, Subscription, Plan, CompanyRol, CompanyParameter } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mercadopagoService = require('./mercadopagoService');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

class AuthService {
    /**
     * Inicio de sesión unificado (Detecta automáticamente si el usuario es de Compañía o de Sistema).
     * 
     * Flujo:
     * 1. Busca primero en `CompanyUser` (colaboradores/admins de empresa inquilina).
     * 2. Si coincide la contraseña con Bcrypt, valida que el usuario y la empresa no estén suspendidos.
     * 3. Valida la fecha de vigencia de la suscripción de la empresa.
     * 4. Si no coincide en empresa, busca en `SystemUser` (SuperAdmins de la plataforma).
     * 5. Emite el token JWT firmado con el rol y tipo de cuenta correspondiente.
     * 
     * @param {string} email - Correo corporativo del usuario
     * @param {string} password - Contraseña en texto plano
     * @returns {Promise<Object>} { token, user }
     */
    async login(email, password) {
        if (!email || !password) {
            throw new AppError('Email y contraseña son requeridos para iniciar sesión.', 400);
        }

        // 1. Buscar en la base de datos de Compañía (Tenant)
        const companyUser = await CompanyUser.scope('withPassword').findOne({ 
            where: { company_email: email },
            include: [{ model: Company, as: 'Company' }]
        });
        
        if (companyUser) {
            const isMatch = await bcrypt.compare(password, companyUser.password);
            if (isMatch) {
                if (!companyUser.status) {
                    throw new AppError('Tu usuario ha sido desactivado. Por favor contacta al administrador de tu empresa.', 403);
                }

                const company = await Company.findByPk(companyUser.company_id, {
                    include: [{ model: Subscription, as: 'activeSubscription' }]
                });
                
                if (!company || !company.is_active) {
                    throw new AppError('Esta empresa se encuentra inactiva o suspendida. Contacta a soporte técnico.', 403);
                }

                // Verificación de corte de suscripción
                if (company.activeSubscription) {
                    const today = new Date();
                    if (company.activeSubscription.next_payment_date < today) {
                        const error = new AppError('Tu suscripción ha vencido. Debes realizar el pago para continuar utilizando el servicio.', 402);
                        error.subscription_id = company.activeSubscription.id;
                        throw error;
                    }
                }

                return this._generateAuthResponse(companyUser, 'company');
            }
        }

        // 2. Si no es usuario de Compañía, buscar en Sistema (SuperAdmin)
        const systemUser = await SystemUser.scope('withPassword').findOne({ where: { email } });
        
        if (systemUser) {
            const isMatch = await bcrypt.compare(password, systemUser.password);
            if (isMatch) {
                if (!systemUser.status) {
                    throw new AppError('Tu usuario de sistema administrativo se encuentra desactivado.', 403);
                }

                return this._generateAuthResponse(systemUser, 'system');
            }
        }

        throw new AppError('Credenciales inválidas. Verifica tu correo y contraseña.', 401);
    }

    /**
     * Inicio de sesión específico para el portal de SuperAdministradores globales.
     * 
     * @param {string} email
     * @param {string} password
     */
    async systemLogin(email, password) {
        const user = await SystemUser.scope('withPassword').findOne({ where: { email } });
        if (!user) throw new AppError('Credenciales inválidas.', 401);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new AppError('Credenciales inválidas.', 401);

        if (!user.status) throw new AppError('Usuario de sistema desactivado.', 403);

        return this._generateAuthResponse(user, 'system');
    }

    /**
     * Inicio de sesión específico de empresa con discriminación obligatoria de `company_id`.
     * 
     * @param {string} email 
     * @param {string} password 
     * @param {number} companyId 
     */
    async companyLogin(email, password, companyId) {
        const user = await CompanyUser.scope('withPassword').findOne({ 
            where: { 
                company_email: email, 
                company_id: companyId 
            } 
        });

        if (!user) throw new AppError('Credenciales inválidas.', 401);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new AppError('Credenciales inválidas.', 401);

        if (!user.status) throw new AppError('Usuario desactivado.', 403);

        return this._generateAuthResponse(user, 'company');
    }

    /**
     * Renovación de token de sesión (Refresh Token).
     * Regenera el token verificando que la cuenta permanezca activa en la base de datos.
     * 
     * @param {Object} user - Objeto extraído del payload del token actual
     */
    async refresh(user) {
        const { id, type } = user;
        let tokenPayload = {};

        if (type === 'system') {
            const systemUser = await SystemUser.findByPk(id);
            if (!systemUser || !systemUser.status) {
                throw new AppError('Usuario de sistema no válido o desactivado.', 403);
            }
            tokenPayload = { id, email: systemUser.email, role: systemUser.system_role, type: 'system' };
        } else if (type === 'company') {
            const companyUser = await CompanyUser.findByPk(id);
            if (!companyUser || !companyUser.status) {
                throw new AppError('Usuario de compañía no válido o desactivado.', 403);
            }
            tokenPayload = { 
                id, 
                email: companyUser.company_email, 
                company_id: companyUser.company_id, 
                role: companyUser.system_role, 
                type: 'company' 
            };
        } else {
            throw new AppError('Tipo de usuario desconocido.', 400);
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
        return { token };
    }

    /**
     * Registro transaccional de nueva empresa cliente (Self-Service Onboarding).
     * 
     * Pasos de la Transacción ACID:
     * 1. Crea la entidad Company con su subdominio autogenerado y logo.
     * 2. Crea la suscripción vinculada al plan seleccionado (o al plan Free por defecto).
     * 3. Crea la paleta de colores y parámetros de branding institucional en CompanyParameter.
     * 4. Crea el cargo protegido de 'Admin' en CompanyRol.
     * 5. Crea el usuario administrador inicial de la empresa en CompanyUser.
     * 6. Si el plan es de pago, genera la preferencia en la pasarela de Mercado Pago.
     * 
     * @param {Object} data - Datos completos del formulario de registro
     * @param {string|null} logoPath - Ruta relativa del logo institucional subido
     */
    async register(data, logoPath) {
        const { 
            fullname, company_name, email, password, nit_id, type_id, number_id,
            plan_id, billing_cycle,
            primary_color, secondary_color, font_family, border_radius, sidebar_theme
        } = data;

        // Validaciones preventivas de duplicidad
        const existingCompany = await Company.findOne({ where: { nit_id: nit_id || '---' } });
        if (existingCompany && nit_id) throw new AppError('El NIT de la empresa ya se encuentra registrado.', 400);

        const existingUser = await CompanyUser.findOne({ where: { company_email: email } });
        if (existingUser) throw new AppError('El correo electrónico ya se encuentra registrado en el sistema.', 400);

        const defaultPlan = await Plan.findOne({ where: { is_default: true, is_active: true } });
        const requestedPlan = plan_id ? await Plan.findOne({ where: { id: plan_id, is_active: true } }) : null;
        const currentPlan = requestedPlan || defaultPlan;

        if (!currentPlan) throw new AppError('No existe un plan disponible para registrar la empresa.', 500);

        const cycle = billing_cycle || 'MONTHLY';
        const startDate = new Date();
        const nextPaymentDate = new Date();
        if (cycle === 'YEARLY') {
            nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
        } else {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }

        // Ejecución transaccional atómica
        const result = await sequelize.transaction(async (t) => {
            const newCompany = await Company.create({
                name: company_name,
                nit_id: nit_id || null,
                subdomain: company_name.toLowerCase().replace(/\s+/g, '').substring(0, 20),
                path_image: logoPath,
                is_active: true
            }, { transaction: t });

            const initialPlan = Number(currentPlan.price) > 0 ? defaultPlan : currentPlan;

            const subscription = await Subscription.create({
                company_id: newCompany.id,
                plan_id: currentPlan.id,
                status: 'ACTIVE',
                start_date: startDate,
                billing_cycle: cycle,
                next_payment_date: nextPaymentDate,
                auto_renew: true
            }, { transaction: t });

            await newCompany.update({
                plan_id: initialPlan.id,
                active_subscription_id: subscription.id
            }, { transaction: t });

            await CompanyParameter.create({
                company_id: newCompany.id,
                primary_color: primary_color || '#0062E3',
                secondary_color: secondary_color || '#001F3F',
                font_family: font_family || 'Inter',
                border_radius: border_radius || '12px',
                sidebar_theme: sidebar_theme || 'dark'
            }, { transaction: t });

            const adminRol = await CompanyRol.create({
                company_id: newCompany.id,
                rol_name: 'Admin',
                is_protected: true
            }, { transaction: t });

            const nameParts = fullname.trim().split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

            const newCompanyUser = await CompanyUser.create({
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
            }, { transaction: t });

            return { newCompany, newCompanyUser, subscription };
        });

        // Generación de preferencia de pago en Mercado Pago (si el plan es de pago)
        let paymentLink = null;
        let mpSubscriptionId = null;

        if (currentPlan.price > 0) {
            try {
                const amountToPay = cycle === 'YEARLY' ? Math.round(currentPlan.price * 12 * 0.85) : currentPlan.price;
                const mpResponse = await mercadopagoService.createPreference({
                    planName: currentPlan.name,
                    amount: amountToPay,
                    email: email,
                    companyId: result.newCompany.id,
                    subscriptionId: result.subscription.id
                });
                paymentLink = mpResponse.init_point;
                mpSubscriptionId = mpResponse.id;
            } catch (mpError) {
                logger.error('Error generando link de pago en Mercado Pago:', mpError);
            }
        }

        return {
            success: true,
            message: currentPlan.price > 0 ? 'Registro exitoso. Redirigiendo a pasarela de pago...' : 'Registro completado. Ya puedes iniciar sesión con tu cuenta.',
            payment_link: paymentLink,
            mp_subscription_id: mpSubscriptionId,
            user: {
                id: result.newCompanyUser.id,
                email: result.newCompanyUser.company_email,
                company: result.newCompany.name
            }
        };
    }

    /**
     * Valida de manera rápida si un email ya está tomado en cualquier tabla de usuario.
     */
    async checkEmail(email) {
        const [systemMatch, companyMatch] = await Promise.all([
            SystemUser.findOne({ where: { email } }),
            CompanyUser.findOne({ where: { company_email: email } })
        ]);
        return !!(systemMatch || companyMatch);
    }

    /**
     * Helper privado: genera el token JWT y el formato sanitizado de respuesta.
     */
    _generateAuthResponse(user, type) {
        const payload = { 
            id: user.id, 
            email: type === 'system' ? user.email : user.company_email, 
            role: user.system_role, 
            type 
        };

        if (type === 'company') {
            payload.company_id = user.company_id;
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

        const userResponse = {
            id: user.id,
            role: user.system_role,
            type
        };

        if (type === 'system') {
            userResponse.name = user.name;
            userResponse.email = user.email;
        } else {
            userResponse.first_name = user.first_name;
            userResponse.last_name = user.last_name;
            userResponse.company_id = user.company_id;
        }

        return { token, user: userResponse };
    }

    /**
     * Impersonación / Proxy Login: Permite a un SuperAdmin ingresar temporalmente al entorno
     * de cualquier empresa cliente para soporte técnico sin conocer su contraseña.
     * 
     * @param {number} companyId - ID de la empresa a gestionar
     * @param {Object} adminUser - Usuario SuperAdmin que solicita el acceso
     */
    async impersonate(companyId, adminUser) {
        const company = await Company.findByPk(companyId);
        if (!company) throw new AppError('Empresa no encontrada.', 404);
        if (!company.is_active) throw new AppError('No se puede gestionar una empresa inactiva.', 400);

        const payload = { 
            id: adminUser.id,
            email: adminUser.email,
            company_id: Number(companyId),
            role: adminUser.role,
            type: 'company',
            is_proxy: true,
            company_name: company.name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

        return {
            token,
            user: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                company_id: Number(companyId),
                role: adminUser.role,
                type: 'company',
                is_proxy: true,
                company_name: company.name
            }
        };
    }
}

module.exports = new AuthService();
