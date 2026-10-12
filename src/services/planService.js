const { Plan } = require('../models');
const cache = require('../utils/cache');

class PlanService {
    /**
     * Obtiene todos los planes con soporte de caché.
     */
    async getAll() {
        const cacheKey = 'all_plans';
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) return cachedData;

        const plans = await Plan.findAll({
            order: [['price', 'ASC']]
        });
        
        cache.set(cacheKey, plans);
        return plans;
    }

    async getById(id) {
        return await Plan.findByPk(id);
    }

    async create(data) {
        const plan = await Plan.create(data);
        cache.del('all_plans'); // Invalida caché
        return plan;
    }

    async update(id, data) {
        if (parseInt(id) === 1) {
            throw new Error('El Plan Gratuito (ID 1) no puede ser modificado manualmente. Edite el archivo .env para realizar cambios.');
        }
        const plan = await Plan.findByPk(id);
        if (!plan) throw new Error('Plan no encontrado');
        
        const updatedPlan = await plan.update(data);
        cache.del('all_plans'); // Invalida caché
        return updatedPlan;
    }

    async delete(id) {
        if (parseInt(id) === 1) {
            throw new Error('El Plan Gratuito (ID 1) es vital para el sistema y no puede ser eliminado.');
        }
        const plan = await Plan.findByPk(id);
        if (!plan) throw new Error('Plan no encontrado');
        
        await plan.destroy();
        cache.del('all_plans'); // Invalida caché
        return true;
    }
}

module.exports = new PlanService();
