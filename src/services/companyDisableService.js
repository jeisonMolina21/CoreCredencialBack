const { sequelize, Company, CompanyUser, Subscription } = require('../models');
const logger = require('../utils/logger');

/**
 * Servicio dedicado a la deshabilitación controlada de empresas.
 */
class CompanyDisableService {

    /**
     * Deshabilita la empresa de forma diferida (espera a que venza la suscripción).
     * @param {number} companyId
     * @returns {object} Resumen del resultado
     */
    async disable(companyId) {
        const transaction = await sequelize.transaction();
        try {
            const company = await Company.findByPk(companyId, { transaction });
            if (!company) throw new Error('Empresa no encontrada');
            if (!company.is_active) throw new Error('La empresa ya está desactivada');

            // Buscar suscripción activa
            const activeSubscription = await Subscription.findOne({
                where: {
                    company_id: companyId,
                    status: ['ACTIVE', 'TRIAL']
                },
                transaction
            });

            let result = { deferred: false, subscription_expires: null, users_blocked: 0 };

            if (activeSubscription) {
                // CASO A: Suscripción vigente → deshabilitación diferida.
                await activeSubscription.update({
                    auto_renew: false,
                    is_renewal_locked: true
                }, { transaction });

                result.deferred = true;
                result.subscription_expires = activeSubscription.next_payment_date;
                result.message = `La empresa seguirá operativa hasta el ${activeSubscription.next_payment_date?.toISOString().split('T')[0]}. ` +
                    `Al vencer la suscripción, los usuarios perderán el acceso automáticamente.`;

            } else {
                // CASO B: Sin suscripción activa → desactivación y bloqueo inmediatos.
                await company.update({ is_active: false }, { transaction });

                const [usersUpdated] = await CompanyUser.update(
                    { status: false },
                    { where: { company_id: companyId }, transaction }
                );

                result.users_blocked = usersUpdated;
                result.message = 'Empresa desactivada de inmediato. Todos los usuarios han sido bloqueados.';
            }

            await transaction.commit();
            return { ...result, company_id: companyId };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Finaliza la desactivación de empresas cuya suscripción bloqueada ya venció.
     * Llamado desde el cron job diario.
     */
    async processExpiredDisabledSubscriptions() {
        const { Op } = require('sequelize');
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const expiredSubscriptions = await Subscription.findAll({
            where: {
                is_renewal_locked: true,
                status: ['ACTIVE', 'TRIAL'],
                next_payment_date: { [Op.lte]: today }
            },
            include: [{ model: Company }]
        });

        logger.info(`[CompanyDisableService] Suscripciones bloqueadas vencidas encontradas: ${expiredSubscriptions.length}`);

        for (const sub of expiredSubscriptions) {
            const transaction = await sequelize.transaction();
            try {
                // 1. Cancelar la suscripción
                await sub.update({ status: 'CANCELLED' }, { transaction });

                // 2. Desactivar la empresa
                if (sub.Company) {
                    await sub.Company.update({ is_active: false }, { transaction });
                }

                // 3. Bloquear TODOS los usuarios de la empresa
                await CompanyUser.update(
                    { status: false },
                    { where: { company_id: sub.company_id }, transaction }
                );

                await transaction.commit();
                logger.info(`✅ Empresa ID ${sub.company_id} desactivada y usuarios bloqueados al vencer suscripción ID ${sub.id}`);
            } catch (err) {
                await transaction.rollback();
                logger.error(`❌ Error procesando empresa ID ${sub.company_id}:`, err);
            }
        }

        return expiredSubscriptions.length;
    }

    /**
     * Reactiva una empresa y a sus usuarios (uso administrativo).
     * @param {number} companyId
     */
    async reactivate(companyId) {
        const transaction = await sequelize.transaction();
        try {
            const company = await Company.findByPk(companyId, { transaction });
            if (!company) throw new Error('Empresa no encontrada');

            await company.update({ is_active: true }, { transaction });

            await CompanyUser.update(
                { status: true },
                { where: { company_id: companyId, is_protected: true }, transaction }
            );

            await transaction.commit();
            return { company_id: companyId, message: 'Empresa reactivada. Solo el administrador inicial fue reactivado.' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Procesa la desactivación automática de empresas cuyo periodo de gracia (5 días)
     * tras el vencimiento de la suscripción ha terminado.
     */
    async processGracePeriodExpirations() {
        const { Op } = require('sequelize');
        const graceDate = new Date();
        graceDate.setDate(graceDate.getDate() - 5);

        const expiredSubscriptions = await Subscription.findAll({
            where: {
                status: ['ACTIVE', 'TRIAL'],
                next_payment_date: { [Op.lt]: graceDate }
            },
            include: [{ model: Company }]
        });

        logger.info(`[CompanyDisableService] Suscripciones vencidas tras periodo de gracia: ${expiredSubscriptions.length}`);

        for (const sub of expiredSubscriptions) {
            const transaction = await sequelize.transaction();
            try {
                // 1. Marcar como EXPIRED
                await sub.update({ status: 'EXPIRED' }, { transaction });

                // 2. Desactivar la empresa
                if (sub.Company) {
                    await sub.Company.update({ is_active: false }, { transaction });
                }

                // 3. Bloquear TODOS los usuarios de la empresa
                await CompanyUser.update(
                    { status: false },
                    { where: { company_id: sub.company_id }, transaction }
                );

                await transaction.commit();
                logger.info(`❌ Empresa ID ${sub.company_id} desactivada por falta de pago tras periodo de gracia.`);
            } catch (err) {
                await transaction.rollback();
                logger.error(`❌ Error desactivando empresa ID ${sub.company_id} (gracia):`, err);
            }
        }

        return expiredSubscriptions.length;
    }
}

module.exports = new CompanyDisableService();
