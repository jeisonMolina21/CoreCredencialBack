const companyUserService = require('../services/companyUserService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getUsers = asyncHandler(async (req, res) => {
    const result = await companyUserService.getAll(req.user.company_id, req.query);
    res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos correctamente',
        data: result.data,
        meta: result.meta
    });
});

const getUser = asyncHandler(async (req, res, next) => {
    const user = await companyUserService.getById(req.params.id, req.user.company_id);
    if (!user) return next(new AppError('Usuario no encontrado', 404));
    res.status(200).json({
        success: true,
        data: user
    });
});

const createUser = asyncHandler(async (req, res) => {
    const data = { ...req.body, company_id: req.user.company_id };
    const user = await companyUserService.create(data);
    res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await companyUserService.update(req.params.id, req.user.company_id, req.body);
    res.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: user
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    await companyUserService.delete(req.params.id, req.user.company_id);
    res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
    });
});

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};
