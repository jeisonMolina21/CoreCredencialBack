const subscriptionService = require('../services/subscriptionService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await subscriptionService.getAll({
        page: Number(page),
        limit: Number(limit),
        search: search.trim()
    });
    
    res.status(200).json({
        success: true,
        message: 'Suscripciones obtenidas correctamente',
        data: result.data,
        meta: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        }
    });
});

const getById = asyncHandler(async (req, res, next) => {
    const subscription = await subscriptionService.getById(req.params.id);
    if (!subscription) {
        return next(new AppError('Suscripción no encontrada', 404));
    }
    res.status(200).json({
        success: true,
        data: subscription
    });
});

const create = asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.create(req.body);
    res.status(201).json({
        success: true,
        message: 'Suscripción creada exitosamente',
        data: subscription
    });
});

const update = asyncHandler(async (req, res, next) => {
    // Verificar si la suscripción está bloqueada para renovación
    const existing = await subscriptionService.getById(req.params.id);
    if (!existing) {
        return next(new AppError('Suscripción no encontrada', 404));
    }
    
    if (existing.is_renewal_locked) {
        return next(new AppError('Esta suscripción está bloqueada. La empresa está en proceso de desactivación y no se puede renovar.', 403));
    }

    const subscription = await subscriptionService.update(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Suscripción actualizada exitosamente',
        data: subscription
    });
});

const remove = asyncHandler(async (req, res) => {
    await subscriptionService.delete(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Suscripción eliminada correctamente'
    });
});

const getMySubscription = asyncHandler(async (req, res, next) => {
    const companyId = req.user.company_id;
    if (!companyId) {
        return next(new AppError('No se identificó la compañía del usuario', 400));
    }
    
    const subscription = await subscriptionService.getByCompanyId(companyId);
    if (!subscription) {
        return next(new AppError('No tienes ninguna suscripción activa', 404));
    }
    
    res.status(200).json({
        success: true,
        data: subscription
    });
});

const updateMySubscription = asyncHandler(async (req, res, next) => {
    const companyId = req.user.company_id;
    if (!companyId) {
        return next(new AppError('No se identificó la compañía del usuario', 400));
    }

    const { auto_renew, plan_id, billing_cycle } = req.body;

    const subscription = await subscriptionService.getByCompanyId(companyId);
    if (!subscription) {
        return next(new AppError('No tienes ninguna suscripción activa', 404));
    }

    if (subscription.is_renewal_locked) {
        return next(new AppError('Tu suscripción está bloqueada para renovaciones o cambios.', 403));
    }

    const updateData = {};
    if (auto_renew !== undefined) updateData.auto_renew = auto_renew;
    if (plan_id !== undefined) updateData.plan_id = plan_id;
    if (billing_cycle !== undefined) updateData.billing_cycle = billing_cycle;

    const updated = await subscriptionService.update(subscription.id, updateData);

    res.status(200).json({
        success: true,
        message: 'Suscripción actualizada exitosamente',
        data: updated
    });
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getMySubscription,
    updateMySubscription
};
