const systemUserService = require('../services/systemUserService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getAll = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await systemUserService.getAll({
        page: Number(page),
        limit: Number(limit),
        search: search.trim()
    });
    res.status(200).json({
        success: true,
        ...result   // { data, total, page, totalPages }
    });
});

const getById = asyncHandler(async (req, res, next) => {
    const user = await systemUserService.getById(req.params.id);
    if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
    }
    res.status(200).json({
        success: true,
        data: user
    });
});

const create = asyncHandler(async (req, res, next) => {
    const user = await systemUserService.create(req.body);
    res.status(201).json({
        success: true,
        data: user
    });
});

const update = asyncHandler(async (req, res, next) => {
    try {
        const user = await systemUserService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return next(new AppError(error.message, 404));
        }
        throw error;
    }
});

const toggleStatus = asyncHandler(async (req, res, next) => {
    try {
        const user = await systemUserService.toggleStatus(req.params.id);
        res.status(200).json({
            success: true,
            message: `Usuario ${user.status ? 'activado' : 'desactivado'} correctamente`,
            data: user
        });
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return next(new AppError(error.message, 404));
        }
        if (error.message === 'El usuario administrador predeterminado debe estar siempre activo.') {
            return next(new AppError(error.message, 400));
        }
        throw error;
    }
});

const remove = asyncHandler(async (req, res, next) => {
    try {
        await systemUserService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return next(new AppError(error.message, 404));
        }
        // Manejar el error específico de borrado de admin (ID 1)
        if (error.message === 'No se puede eliminar el usuario administrador predeterminado.') {
            return next(new AppError(error.message, 400));
        }
        throw error;
    }
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    toggleStatus,
    remove
};
