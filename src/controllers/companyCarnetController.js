const companyCarnetService = require('../services/companyCarnetService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getCarnets = asyncHandler(async (req, res) => {
    const result = await companyCarnetService.getAll(req.user.company_id, req.query);
    res.status(200).json({
        success: true,
        message: 'Carnets obtenidos correctamente',
        data: result.data,
        meta: result.meta
    });
});

const getCarnet = asyncHandler(async (req, res, next) => {
    const carnet = await companyCarnetService.getById(req.params.id, req.user.company_id);
    if (!carnet) return next(new AppError('Carnet no encontrado', 404));
    res.status(200).json({
        success: true,
        data: carnet
    });
});

const createCarnet = asyncHandler(async (req, res) => {
    const data = { ...req.body, company_id: req.user.company_id };
    const carnet = await companyCarnetService.create(data);
    res.status(201).json({
        success: true,
        message: 'Carnet creado exitosamente',
        data: carnet
    });
});

const updateCarnet = asyncHandler(async (req, res) => {
    const carnet = await companyCarnetService.update(req.params.id, req.user.company_id, req.body);
    res.status(200).json({
        success: true,
        message: 'Carnet actualizado correctamente',
        data: carnet
    });
});

const deleteCarnet = asyncHandler(async (req, res) => {
    await companyCarnetService.delete(req.params.id, req.user.company_id);
    res.status(200).json({
        success: true,
        message: 'Carnet eliminado exitosamente'
    });
});

module.exports = {
    getCarnets,
    getCarnet,
    createCarnet,
    updateCarnet,
    deleteCarnet
};
