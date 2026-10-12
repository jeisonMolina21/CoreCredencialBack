const planService = require('../services/planService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getAll = asyncHandler(async (req, res) => {
    const plans = await planService.getAll();
    res.status(200).json({
        success: true,
        message: 'Planes obtenidos correctamente',
        data: plans
    });
});

const getById = asyncHandler(async (req, res, next) => {
    const plan = await planService.getById(req.params.id);
    if (!plan) {
        return next(new AppError('Plan no encontrado', 404));
    }
    res.status(200).json({
        success: true,
        data: plan
    });
});

const create = asyncHandler(async (req, res) => {
    const plan = await planService.create(req.body);
    res.status(201).json({
        success: true,
        message: 'Plan creado exitosamente',
        data: plan
    });
});

const update = asyncHandler(async (req, res) => {
    const plan = await planService.update(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Plan actualizado correctamente',
        data: plan
    });
});

const remove = asyncHandler(async (req, res) => {
    await planService.delete(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Plan eliminado correctamente'
    });
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
