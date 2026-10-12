const companyAreaService = require('../services/companyAreaService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getAreas = asyncHandler(async (req, res, next) => {
    const areas = await companyAreaService.getAll(req.user.company_id);
    res.status(200).json({
        success: true,
        data: areas
    });
});

const getArea = asyncHandler(async (req, res, next) => {
    const area = await companyAreaService.getById(req.params.id, req.user.company_id);
    if (!area) return next(new AppError('Área no encontrada', 404));
    res.status(200).json({
        success: true,
        data: area
    });
});

const createArea = asyncHandler(async (req, res, next) => {
    // Inyectar company_id del token
    const data = { ...req.body, company_id: req.user.company_id };
    const area = await companyAreaService.create(data);
    res.status(201).json({
        success: true,
        data: area
    });
});

const updateArea = asyncHandler(async (req, res, next) => {
    const area = await companyAreaService.update(req.params.id, req.user.company_id, req.body);
    res.status(200).json({
        success: true,
        data: area
    });
});

const deleteArea = asyncHandler(async (req, res, next) => {
    await companyAreaService.delete(req.params.id, req.user.company_id);
    res.status(204).json({
        success: true,
        data: null
    });
});

module.exports = {
    getAreas,
    getArea,
    createArea,
    updateArea,
    deleteArea
};
