const { Payment, Subscription, PaymentMethod, Company, Plan } = require('../models');

class PaymentService {
    /**
     * Procesa un cobro para una suscripción
     * @param {number} subscriptionId 
     */
    async processSubscriptionCharge(subscriptionId) {
        const subscription = await Subscription.findByPk(subscriptionId, {
            include: [
                { model: PaymentMethod, as: 'defaultPaymentMethod' },
                { model: Plan, as: 'plan' }
            ]
        });

        if (!subscription) throw new Error('Suscripción no encontrada');
        if (!subscription.defaultPaymentMethod) throw new Error('No hay método de pago predeterminado');

        try {
            // SIMULACIÓN DE COBRO CON PASARELA
            const chargeAmount = subscription.plan.price;
            const gatewayResult = await this._mockGatewayCharge(
                subscription.defaultPaymentMethod.token, 
                chargeAmount
            );

            // Registrar el pago en la base de datos
            const payment = await Payment.create({
                subscription_id: subscription.id,
                company_id: subscription.company_id,
                payment_method_id: subscription.defaultPaymentMethod.id,
                amount: chargeAmount,
                status: 'SUCCESS',
                gateway_transaction_id: gatewayResult.transactionId,
                payment_date: new Date()
            });

            // Actualizar la fecha del próximo pago en la suscripción
            const nextDate = this._calculateNextDate(subscription.next_payment_date || new Date(), subscription.billing_cycle);
            await subscription.update({ next_payment_date: nextDate });

            return payment;
        } catch (error) {
            // Registrar fallo de pago
            await Payment.create({
                subscription_id: subscription.id,
                company_id: subscription.company_id,
                payment_method_id: subscription.defaultPaymentMethod.id,
                amount: subscription.plan.price,
                status: 'FAILED',
                notes: error.message
            });
            throw error;
        }
    }

    /**
     * Obtiene todos los pagos (Vista de Sistema)
     */
    async getAllPayments() {
        return await Payment.findAll({
            include: [
                { model: Company, attributes: ['id', 'name'] },
                { model: Plan, attributes: ['id', 'name'] },
                { model: Subscription, attributes: ['id', 'status'] }
            ],
            order: [['payment_date', 'DESC']]
        });
    }

    /**
     * Obtiene los pagos de una empresa específica
     */
    async getPaymentsByCompany(companyId) {
        return await Payment.findAll({
            where: { company_id: companyId },
            include: [
                { model: Plan, attributes: ['id', 'name'] }
            ],
            order: [['payment_date', 'DESC']]
        });
    }

    /**
     * Gestión de Métodos de Pago
     */
    async getPaymentMethodsByCompany(companyId) {
        return await PaymentMethod.findAll({
            where: { company_id: companyId, is_active: true }
        });
    }

    async createPaymentMethod(companyId, data) {
        // Si es el primero, lo marcamos como predeterminado
        const existing = await PaymentMethod.count({ where: { company_id: companyId, is_active: true } });
        if (existing === 0) {
            data.is_default = true;
        }

        const method = await PaymentMethod.create({
            ...data,
            company_id: companyId
        });

        // Si se marcó como default, quitamos el default a los demás
        if (data.is_default) {
            await this.setDefaultPaymentMethod(companyId, method.id);
        }

        return method;
    }

    async setDefaultPaymentMethod(companyId, methodId) {
        await PaymentMethod.update(
            { is_default: false },
            { where: { company_id: companyId } }
        );
        await PaymentMethod.update(
            { is_default: true },
            { where: { id: methodId, company_id: companyId } }
        );

        // Actualizar la suscripción para usar este nuevo método por defecto
        await Subscription.update(
            { payment_method_id: methodId },
            { where: { company_id: companyId, status: ['ACTIVE', 'TRIAL'] } }
        );
    }

    async deletePaymentMethod(companyId, methodId) {
        const method = await PaymentMethod.findOne({ where: { id: methodId, company_id: companyId } });
        if (!method) throw new Error('Método de pago no encontrado');
        if (method.is_default) throw new Error('No se puede eliminar el método de pago por defecto');
        
        return await method.update({ is_active: false });
    }

    async _mockGatewayCharge(token, amount) {
        // Simula una llamada a Stripe/MercadoPago
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (token === 'error_token') {
                    reject(new Error('Fondos insuficientes o tarjeta rechazada'));
                } else {
                    resolve({
                        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
                        status: 'authorized'
                    });
                }
            }, 1000);
        });
    }

    _calculateNextDate(currentDate, cycle) {
        const date = new Date(currentDate);
        if (cycle === 'YEARLY') {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
        return date;
    }
}

module.exports = new PaymentService();
