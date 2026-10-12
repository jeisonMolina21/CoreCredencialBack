const companyRolService = require('../services/companyRolService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getRoles = asyncHandler(async (req, res, next) => {
    const roles = await companyRolService.getAll(req.user.company_id);
    res.status(200).json({
        success: true,
        data: roles
    });
});

const getRole = asyncHandler(async (req, res, next) => {
    const role = await companyRolService.getById(req.params.id, req.user.company_id);
    if (!role) return next(new AppError('Cargo no encontrado', 404));
    res.status(200).json({
        success: true,
        data: role
    });
});

const createRole = asyncHandler(async (req, res, next) => {
    const data = { ...req.body, company_id: req.user.company_id };
    const role = await companyRolService.create(data);
    res.status(201).json({
        success: true,
        data: role
    });
});

const updateRole = asyncHandler(async (req, res, next) => {
    const role = await companyRolService.update(req.params.id, req.user.company_id, req.body);
    res.status(200).json({
        success: true,
        data: role
    });
});

const deleteRole = asyncHandler(async (req, res, next) => {
    await companyRolService.delete(req.params.id, req.user.company_id);
    res.status(204).json({
        success: true,
        data: null
    });
});

module.exports = {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole
};
