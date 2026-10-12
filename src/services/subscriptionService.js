const { Subscription, Plan, Company, PaymentMethod, Payment } = require('../models');

class SubscriptionService {
    /**
     * Lista paginada de suscripciones.
     * @param {object} opts { page, limit, search }
     */
    async getAll({ page = 1, limit = 20, search = '' } = {}) {
        const offset = (page - 1) * limit;

        const where = search
            ? {
                '$Company.name$': { [require('sequelize').Op.like]: `%${search}%` }
              }
            : {};

        const { count, rows } = await Subscription.findAndCountAll({
            where,
            include: [
                { model: Plan, as: 'plan' },
                { model: Company },
                { model: PaymentMethod, as: 'defaultPaymentMethod' }
            ],
            order: [
                ['status', 'ASC'], // 'ACTIVE' suele ser alfabéticamente primero o podemos forzar un orden
                ['created_at', 'DESC']
            ],
            limit: Number(limit),
            offset: Number(offset),
            subQuery: false // Necesario para filtrar por relaciones en paginación
        });

        return {
            data: rows,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    async getById(id) {
        return await Subscription.findByPk(id, {
            include: [
                { model: Plan, as: 'plan' },
                { model: Company },
                { model: PaymentMethod, as: 'defaultPaymentMethod' },
                { model: Payment, as: 'payments' }
            ]
        });
    }

    async getByCompanyId(companyId) {
        return await Subscription.findOne({
            where: { company_id: companyId },
            include: [
                { model: Plan, as: 'plan' },
                { model: PaymentMethod, as: 'defaultPaymentMethod' },
                { model: Payment, as: 'payments' }
            ],
            order: [
                ['created_at', 'DESC'],
                [{ model: Payment, as: 'payments' }, 'payment_date', 'DESC']
            ]
        });
    }

    async create(data) {
        if (!data.next_payment_date) {
            data.next_payment_date = this._calculateNextPaymentDate(data.start_date || new Date(), data.billing_cycle || 'MONTHLY');
        }
        if (!data.end_date) {
            data.end_date = data.next_payment_date;
        }
        return await Subscription.create(data);
    }

    async update(id, data) {
        const subscription = await Subscription.findByPk(id);
        if (!subscription) throw new Error('Suscripción no encontrada');
        
        // Si se cambia el ciclo de facturación o la fecha de inicio, recalculamos
        if (data.billing_cycle || data.start_date) {
            const cycle = data.billing_cycle || subscription.billing_cycle;
            const start = data.start_date || subscription.start_date;
            data.next_payment_date = this._calculateNextPaymentDate(start, cycle);
        }

        return await subscription.update(data);
    }

    _calculateNextPaymentDate(startDate, cycle) {
        const date = new Date(startDate);
        if (cycle === 'YEARLY') {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
        return date;
    }

    async delete(id) {
        const subscription = await Subscription.findByPk(id);
        if (!subscription) throw new Error('Suscripción no encontrada');
        return await subscription.destroy();
    }
}

module.exports = new SubscriptionService();
