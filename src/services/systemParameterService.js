const { SystemParameter } = require('../models');
const cache = require('../utils/cache');

class SystemParameterService {
    
    /**
     * Obtiene los parámetros globales, usando caché para evitar hits innecesarios a DB.
     */
    async getGlobalParameters() {
        const cacheKey = 'global_parameters';
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) return cachedData;

        let param = await SystemParameter.findByPk(1);
        if (!param) {
            param = await SystemParameter.create({
                id: 1,
                login: true,
                maintenance: false,
                path_image_system: '',
                mercadopago_mode: 'SANDBOX'
            });
        }
        
        // Guardar en caché
        cache.set(cacheKey, param);
        return param;
    }

    /**
     * Actualiza los parámetros e invalida la caché.
     */
    async updateGlobalParameters(data) {
        let param = await SystemParameter.findByPk(1);
        if (!param) {
            param = await SystemParameter.create({
                id: 1,
                login: data.login ?? true,
                maintenance: data.maintenance ?? false,
                path_image_system: data.path_image_system ?? '',
                mercadopago_mode: data.mercadopago_mode ?? 'SANDBOX'
            });
        } else {
            await param.update({
                login: data.login,
                maintenance: data.maintenance,
                path_image_system: data.path_image_system,
                mercadopago_mode: data.mercadopago_mode
            });
        }

        // Invalida caché
        cache.del('global_parameters');
        return param;
    }

    async getMercadoPagoConfig() {
        const params = await this.getGlobalParameters();
        const mode = params.mercadopago_mode || 'SANDBOX';
        const publicKey = mode === 'PRODUCTION' 
            ? process.env.MERCADOPAGO_PROD_PUBLIC_KEY 
            : process.env.MERCADOPAGO_TEST_PUBLIC_KEY;
            
        return {
            mode,
            publicKey
        };
    }
}

module.exports = new SystemParameterService();
