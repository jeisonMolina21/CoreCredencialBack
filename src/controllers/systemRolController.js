const systemRolService = require('../services/systemRolService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getAll = asyncHandler(async (req, res, next) => {
    const roles = await systemRolService.getAll();
    res.status(200).json({
        success: true,
        data: roles
    });
});

const getById = asyncHandler(async (req, res, next) => {
    const rol = await systemRolService.getById(req.params.id);
    if (!rol) {
        return next(new AppError('Rol no encontrado', 404));
    }
    res.status(200).json({
        success: true,
        data: rol
    });
});

const create = asyncHandler(async (req, res, next) => {
    const rol = await systemRolService.create(req.body);
    res.status(201).json({
        success: true,
        data: rol
    });
});

const update = asyncHandler(async (req, res, next) => {
    try {
        const rol = await systemRolService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: rol
        });
    } catch (error) {
        if (error.message === 'Rol no encontrado') {
            return next(new AppError(error.message, 404));
        }
        throw error;
    }
});

const remove = asyncHandler(async (req, res, next) => {
    try {
        await systemRolService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Rol eliminado correctamente'
        });
    } catch (error) {
        if (error.message === 'Rol no encontrado') {
            return next(new AppError(error.message, 404));
        }
        throw error;
    }
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
