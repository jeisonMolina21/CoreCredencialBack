const mercadopagoService = require('../services/mercadopagoService');
const { Subscription, Payment, Company, Plan } = require('../models');
const logger = require('../utils/logger');
const asyncHandler = require('../helpers/asyncHandler');

const handleWebhook = asyncHandler(async (req, res) => {
    const { query } = req;
    
    // Mercado Pago envía notificaciones de varios tipos. Nos interesa 'payment'.
    const topic = query.topic || query.type;
    const id = query.id || (query.data ? query.data.id : null);

    logger.info(`[WEBHOOK MP] Notificación recibida: Topic=${topic}, ID=${id}`);

    // VALIDACIÓN DE SEGURIDAD
    const isValid = mercadopagoService.validateSignature(req.headers, req.query);
    if (!isValid) {
        logger.error('[WEBHOOK MP] Firma de notificación inválida. Posible intento de fraude.');
        return res.status(401).send('Invalid signature');
    }

    if (topic === 'payment' && id) {
        try {
            const mpPayment = await mercadopagoService.getPayment(id);
            const { status, status_detail, metadata, transaction_amount, date_approved } = mpPayment;

            const companyId = metadata.company_id;
            const subscriptionId = metadata.subscription_id;

            logger.info(`[WEBHOOK MP] Procesando pago ${id} para Empresa ${companyId}. Estado: ${status}`);

            if (status === 'approved') {
                // 1. Buscar o crear el registro de pago en nuestra DB
                const [payment, created] = await Payment.findOrCreate({
                    where: { gateway_transaction_id: id.toString() },
                    defaults: {
                        subscription_id: subscriptionId,
                        company_id: companyId,
                        amount: transaction_amount,
                        status: 'SUCCESS',
                        payment_date: date_approved || new Date(),
                        notes: `Pago aprobado vía Mercado Pago (Checkout Pro). ID: ${id}`
                    }
                });

                if (created || payment.status !== 'SUCCESS') {
                    if (!created) {
                        await payment.update({ status: 'SUCCESS', payment_date: date_approved || new Date() });
                    }

                    // 2. Activar/Renovar la suscripción
                    const subscription = await Subscription.findByPk(subscriptionId);
                    if (subscription) {
                        const nextDate = new Date(subscription.next_payment_date || new Date());
                        if (subscription.billing_cycle === 'YEARLY') {
                            nextDate.setFullYear(nextDate.getFullYear() + 1);
                        } else {
                            nextDate.setMonth(nextDate.getMonth() + 1);
                        }

                        await subscription.update({
                            status: 'ACTIVE',
                            next_payment_date: nextDate,
                            last_payment_date: new Date()
                        });

                        // 3. Asegurar que la empresa esté activa
                        await Company.update({ is_active: true }, { where: { id: companyId } });
                        
                        logger.info(`[WEBHOOK MP] Suscripción ${subscriptionId} actualizada a ACTIVE.`);
                    }
                }
            } else if (status === 'rejected' || status === 'cancelled') {
                await Payment.upsert({
                    gateway_transaction_id: id.toString(),
                    subscription_id: subscriptionId,
                    company_id: companyId,
                    amount: transaction_amount,
                    status: 'FAILED',
                    payment_date: new Date(),
                    notes: `Pago rechazado/cancelado. Estado MP: ${status_detail}`
                });
                logger.warn(`[WEBHOOK MP] Pago ${id} fue rechazado.`);
            }
        } catch (error) {
            logger.error(`[WEBHOOK MP] Error procesando pago ${id}:`, error);
            // No lanzamos error aquí para responder 200 a MP y evitar que reintente infinitamente si es un error lógico
        }
    }

    // Siempre respondemos 200 a Mercado Pago para confirmar recepción
    res.status(200).send('OK');
});

module.exports = { handleWebhook };
