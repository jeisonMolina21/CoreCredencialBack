const { Subscription } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const paymentService = require('../services/paymentService');

/**
 * Worker para procesar cobros automáticos de suscripciones vencidas.
 * Se recomienda ejecutar este script diariamente mediante un cron job.
 */
const processBilling = async () => {
    logger.info('Iniciando procesamiento de facturación...');

    try {
        const today = new Date();
        
        // Buscar suscripciones activas que deben cobrarse hoy o antes
        const subscriptionsToCharge = await Subscription.findAll({
            where: {
                status: 'ACTIVE',
                auto_renew: true,
                next_payment_date: {
                    [Op.lte]: today
                }
            }
        });

        logger.info(`Encontradas ${subscriptionsToCharge.length} suscripciones para procesar.`);

        for (const sub of subscriptionsToCharge) {
            try {
                logger.info(`Procesando cobro para suscripción ID: ${sub.id} (Empresa: ${sub.company_id})...`);
                const payment = await paymentService.processSubscriptionCharge(sub.id);
                logger.info(`✅ Cobro exitoso. Transacción: ${payment.gateway_transaction_id}`);
            } catch (error) {
                logger.error(`❌ Error procesando cobro para suscripción ${sub.id}:`, error);
                // Aquí se podría implementar lógica de notificación al administrador
            }
        }

        logger.info('Procesamiento de facturación finalizado.');
    } catch (error) {
        logger.error('CRITICAL ERROR in billing worker:', error);
    }
};

// Si el script se ejecuta directamente
if (require.main === module) {
    processBilling()
        .then(() => process.exit(0))
        .catch(err => {
            logger.error('Error ejecutando worker de facturación:', err);
            process.exit(1);
        });
}

module.exports = { processBilling };
