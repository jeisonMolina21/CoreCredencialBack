const { MercadoPagoConfig, Preference, PreApproval, Customer, CustomerCard, Payment } = require('mercadopago');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { SystemParameter } = require('../models');

class MercadoPagoService {
    /**
     * Obtiene el cliente de Mercado Pago y el modo configurado
     */
    async _getConfig() {
        const params = await SystemParameter.findByPk(1) || { mercadopago_mode: 'SANDBOX' };
        const mode = params.mercadopago_mode;
        
        const accessToken = mode === 'PRODUCTION' 
            ? process.env.MERCADOPAGO_PROD_ACCESS_TOKEN 
            : process.env.MERCADOPAGO_TEST_ACCESS_TOKEN;

        logger.info(`[MP DIAGNOSTIC] Modo actual: ${mode}`);
        logger.debug(`[MP DIAGNOSTIC] Token usado (final): ...${accessToken?.slice(-5)}`);

        if (!accessToken) {
            throw new Error(`Acceso denegado: No se ha configurado el token de Mercado Pago para el modo ${mode}`);
        }

        const client = new MercadoPagoConfig({ 
            accessToken: accessToken, 
            options: { timeout: 10000 }
        });

        return { client, mode, accessToken };
    }

    /**
     * Crea una preferencia de pago (Checkout Pro)
     * @param {Object} data { planName, amount, email, companyId, subscriptionId }
     */
    async createPreference({ planName, amount, email, companyId, subscriptionId }) {
        try {
            const { client } = await this._getConfig();
            const preference = new Preference(client);

            logger.info(`[MP DEBUG] Usando Back URL: ${process.env.MERCADOPAGO_BACK_URL}`);

            const body = {
                items: [
                    {
                        id: `plan-${subscriptionId}`,
                        title: `Suscripción Carnet Digital - ${planName}`,
                        quantity: 1,
                        unit_price: Number(amount.toString().replace(/[^0-9.]/g, '')),
                        currency_id: 'COP'
                    }
                ],
                payer: {
                    email: email
                },
                back_urls: {
                    success: (process.env.MERCADOPAGO_BACK_URL || 'https://www.mercadopago.com.co').trim(),
                    failure: (process.env.MERCADOPAGO_BACK_URL || 'https://www.mercadopago.com.co').trim(),
                    pending: (process.env.MERCADOPAGO_BACK_URL || 'https://www.mercadopago.com.co').trim()
                },
                // auto_return: 'approved', // Desactivamos temporalmente para evitar el error 400
                notification_url: `${(process.env.BACKEND_URL || 'http://localhost:3010').trim()}/api/payments/webhook`,
                metadata: {
                    company_id: companyId,
                    subscription_id: subscriptionId,
                    plan_name: planName
                },
                payment_methods: {
                    installments: 12,
                    excluded_payment_methods: [],
                    excluded_payment_types: []
                }
            };

            const response = await preference.create({ body });

            logger.info(`--- PREFERENCIA GENERADA --- ID: ${response.id}`);
            logger.info(`--- INIT POINT --- ${response.init_point}`);

            return {
                id: response.id,
                init_point: response.init_point,
                status: 'pending'
            };

        } catch (error) {
            logger.error('--- ERROR GENERANDO PREFERENCIA CHECKOUT PRO ---', error);
            throw error;
        }
    }

    /**
     * Mantenemos estos métodos por si se usan en otras partes del sistema
     */
    async _getOrCreateCustomer(client, email) {
        const customer = new Customer(client);
        try {
            const searchRes = await customer.search({ options: { email: email } });
            if (searchRes.results && searchRes.results.length > 0) return searchRes.results[0].id;
            const newCust = await customer.create({ body: { email: email } });
            return newCust.id;
        } catch (error) {
            throw error;
        }
    }

    async getPayment(paymentId) {
        try {
            const { client } = await this._getConfig();
            const payment = new Payment(client);
            return await payment.get({ id: paymentId });
        } catch (error) {
            logger.error(`Error obteniendo pago ${paymentId}:`, error);
            throw error;
        }
    }

    async cancelSubscription(preapprovalId) {
        try {
            if (!preapprovalId) return;
            const { client } = await this._getConfig();
            const preApproval = new PreApproval(client);
            await preApproval.update({ 
                id: preapprovalId, 
                body: { status: 'cancelled' } 
            });
            logger.info(`Suscripción ${preapprovalId} cancelada.`);
        } catch (error) {
            logger.error(`Error cancelando suscripción ${preapprovalId}:`, error);
        }
    }

    /**
     * Valida la autenticidad de una notificación Webhook
     * @param {Object} headers { 'x-signature', 'x-request-id' }
     * @param {Object} queryParams { 'data.id' }
     */
    validateSignature(headers, queryParams) {
        try {
            const xSignature = headers['x-signature'];
            const xRequestId = headers['x-request-id'];
            const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

            if (!xSignature || !secret || secret === 'tu_clave_secreta_aqui') {
                logger.warn('[MP VALIDATE] Falta firma o clave secreta no configurada.');
                return true; // Permitimos pasar si no está configurado (solo para desarrollo inicial)
            }

            const dataId = queryParams['data.id'] || queryParams['id'];
            
            // 1. Extraer ts y hash (v1) de x-signature
            const parts = xSignature.split(',');
            let ts, hash;
            parts.forEach(part => {
                const [key, value] = part.split('=');
                if (key.trim() === 'ts') ts = value.trim();
                if (key.trim() === 'v1') hash = value.trim();
            });

            // 2. Generar el manifest
            const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

            // 3. Calcular HMAC SHA256
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(manifest);
            const sha = hmac.digest('hex');

            return sha === hash;
        } catch (error) {
            logger.error('[MP VALIDATE] Error validando firma:', error);
            return false;
        }
    }
}

module.exports = new MercadoPagoService();
