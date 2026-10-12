const { 
    CompanyUser, 
    CompanyArea, 
    CompanyRol, 
    CompanyTemplateCarnet, 
    CompanyCarnet,
    Subscription,
    Plan,
    CompanyHeadquarter
} = require('../models');
const cache = require('../utils/cache');

class CompanyDashboardService {
    /**
     * Obtiene estadísticas agregadas y límites del plan para una empresa,
     * con caché de corta duración (60 segundos) para optimizar tiempo de respuesta.
     * @param {number} companyId 
     */
    async getStats(companyId) {
        const cacheKey = `dashboard_stats_${companyId}`;
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        const [
            totalEmployees,
            totalAreas,
            totalRoles,
            totalTemplates,
            totalCarnets,
            totalHeadquarters,
            activeSubscription
        ] = await Promise.all([
            CompanyUser.count({ where: { company_id: companyId, is_protected: false } }),
            CompanyArea.count({ where: { company_id: companyId } }),
            CompanyRol.count({ where: { company_id: companyId, is_protected: false } }),
            CompanyTemplateCarnet.count({ where: { company_id: companyId } }),
            CompanyCarnet.count({ where: { company_id: companyId } }),
            CompanyHeadquarter.count({ where: { company_id: companyId } }),
            Subscription.findOne({
                where: { company_id: companyId, status: 'ACTIVE' },
                include: [{ model: Plan, as: 'plan' }],
                order: [['created_at', 'DESC']]
            })
        ]);

        const result = {
            stats: {
                totalEmployees,
                totalAreas,
                totalRoles,
                totalTemplates,
                totalCarnets,
                totalHeadquarters
            },
            subscription: activeSubscription ? {
                planName: activeSubscription.plan.name,
                renewalDate: activeSubscription.next_payment_date,
                limits: {
                    maxUsers: activeSubscription.plan.max_users,
                    maxTemplates: activeSubscription.plan.max_templates_carnets,
                    maxCarnets: activeSubscription.plan.max_carnets,
                    maxEvents: activeSubscription.plan.max_events_month,
                    maxHeadquarters: activeSubscription.plan.max_headquarters,
                    maxAreas: activeSubscription.plan.max_areas,
                    maxRoles: activeSubscription.plan.max_roles
                }
            } : null
        };

        // Cachear durante 60 segundos
        cache.set(cacheKey, result, 60);

        return result;
    }
}

module.exports = new CompanyDashboardService();
