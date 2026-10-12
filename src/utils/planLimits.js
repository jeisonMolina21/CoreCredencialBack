const { 
    CompanyUser, 
    CompanyArea, 
    CompanyRol, 
    CompanyTemplateCarnet, 
    CompanyCarnet,
    CompanyHeadquarter,
    Subscription,
    Plan,
    CompanyEvent
} = require('../models');
const AppError = require('./appError');
const cache = require('./cache');

/**
 * Obtiene la suscripción activa con caché de corta duración (5 min)
 * para evitar sobrecargar la base de datos en cada inserción.
 */
const getActiveSubscriptionCached = async (companyId) => {
    const cacheKey = `sub_limit_${companyId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const subscription = await Subscription.findOne({
        where: { company_id: companyId, status: 'ACTIVE' },
        include: [{ model: Plan, as: 'plan' }],
        order: [['created_at', 'DESC']]
    });

    if (subscription) {
        // Cachear durante 5 minutos (300s)
        cache.set(cacheKey, subscription, 300);
    }
    return subscription;
};

/**
 * Invalida el caché de suscripción cuando se modifica o renueva.
 */
const invalidateSubscriptionLimitCache = (companyId) => {
    if (companyId) {
        cache.del(`sub_limit_${companyId}`);
    }
};

/**
 * Verifica si una empresa ha alcanzado el límite de su plan para una entidad específica.
 * @param {number} companyId - ID de la empresa
 * @param {string} entityType - Tipo de entidad ('users', 'areas', 'roles', 'templates', 'carnets', 'headquarters', 'events')
 * @throws {AppError} - Límite alcanzado
 */
const checkPlanLimit = async (companyId, entityType) => {
    // 1. Obtener suscripción activa y su plan (optimizado con caché)
    const subscription = await getActiveSubscriptionCached(companyId);

    if (!subscription || !subscription.plan) {
        throw new AppError('No se encontró una suscripción activa para validar los límites del plan.', 403);
    }

    const plan = subscription.plan;
    let currentCount = 0;
    let maxLimit = 0;
    let entityName = '';

    // 2. Determinar límites y conteo actual
    switch (entityType) {
        case 'users':
            currentCount = await CompanyUser.count({ 
                where: { 
                    company_id: companyId,
                    is_protected: false 
                } 
            });
            maxLimit = plan.max_users;
            entityName = 'colaboradores';
            break;
        case 'areas':
            currentCount = await CompanyArea.count({ where: { company_id: companyId } });
            maxLimit = plan.max_areas;
            entityName = 'áreas';
            break;
        case 'roles':
            currentCount = await CompanyRol.count({ 
                where: { 
                    company_id: companyId,
                    is_protected: false 
                } 
            });
            maxLimit = plan.max_roles;
            entityName = 'cargos';
            break;
        case 'templates':
            currentCount = await CompanyTemplateCarnet.count({ where: { company_id: companyId } });
            maxLimit = plan.max_templates_carnets;
            entityName = 'plantillas';
            break;
        case 'carnets':
            currentCount = await CompanyCarnet.count({ where: { company_id: companyId } });
            maxLimit = plan.max_carnets;
            entityName = 'carnets';
            break;
        case 'headquarters':
            currentCount = await CompanyHeadquarter.count({ where: { company_id: companyId } });
            maxLimit = plan.max_headquarters;
            entityName = 'sedes';
            break;
        case 'events':
            currentCount = await CompanyEvent.count({ where: { company_id: companyId } });
            maxLimit = plan.max_events_month;
            entityName = 'eventos';
            break;
        default:
            return;
    }

    // 3. Validar límite
    if (maxLimit > 0 && currentCount >= maxLimit) {
        throw new AppError(`Has llegado al límite de ${entityName} permitido en tu plan (${maxLimit}). Por favor, actualiza tu suscripción para continuar.`, 403);
    }
};

module.exports = { 
    checkPlanLimit,
    invalidateSubscriptionLimitCache
};
