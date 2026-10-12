const { Op } = require('sequelize');
const logger = require('../utils/logger');
const companyDisableService = require('../services/companyDisableService');

/**
 * Cron Job: Verificación diaria de suscripciones bloqueadas vencidas.
 *
 * Busca todas las suscripciones con is_renewal_locked = true cuya next_payment_date
 * ya pasó, cancela la suscripción y desactiva la empresa definitivamente.
 *
 * Se recomienda ejecutar diariamente a las 00:05 AM.
 */
const processExpiredSubscriptions = async () => {
    logger.info('🕒 Iniciando verificación de suscripciones vencidas bloqueadas...');

    try {
        const processedDisabled = await companyDisableService.processExpiredDisabledSubscriptions();
        logger.info(`✅ Suscripciones bloqueadas procesadas: ${processedDisabled}`);
        
        const processedGrace = await companyDisableService.processGracePeriodExpirations();
        logger.info(`✅ Empresas desactivadas tras periodo de gracia: ${processedGrace}`);
    } catch (error) {
        logger.error('❌ Error crítico en subscriptionExpiryJob:', error);
    }
};

// Si se ejecuta directamente como script
if (require.main === module) {
    processExpiredSubscriptions()
        .then(() => process.exit(0))
        .catch(err => {
            logger.error('Error al ejecutar job manualmente:', err);
            process.exit(1);
        });
}

module.exports = { processExpiredSubscriptions };
