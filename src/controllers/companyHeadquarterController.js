const companyHeadquarterService = require('../services/companyHeadquarterService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getHeadquarters = asyncHandler(async (req, res, next) => {
    const headquarters = await companyHeadquarterService.getAll(req.user.company_id);
    res.status(200).json({
        success: true,
        data: headquarters
    });
});

const getHeadquarter = asyncHandler(async (req, res, next) => {
    const headquarter = await companyHeadquarterService.getById(req.params.id, req.user.company_id);
    if (!headquarter) return next(new AppError('Sede no encontrada', 404));
    res.status(200).json({
        success: true,
        data: headquarter
    });
});

const createHeadquarter = asyncHandler(async (req, res, next) => {
    const data = { ...req.body, company_id: req.user.company_id };
    const headquarter = await companyHeadquarterService.create(data);
    res.status(201).json({
        success: true,
        data: headquarter
    });
});

const updateHeadquarter = asyncHandler(async (req, res, next) => {
    const headquarter = await companyHeadquarterService.update(req.params.id, req.user.company_id, req.body);
    res.status(200).json({
        success: true,
        data: headquarter
    });
});

const deleteHeadquarter = asyncHandler(async (req, res, next) => {
    await companyHeadquarterService.delete(req.params.id, req.user.company_id);
    res.status(204).json({
        success: true,
        data: null
    });
});

module.exports = {
    getHeadquarters,
    getHeadquarter,
    createHeadquarter,
    updateHeadquarter,
    deleteHeadquarter
};
