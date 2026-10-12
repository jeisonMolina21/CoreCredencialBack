const systemParameterService = require('../services/systemParameterService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getParameters = asyncHandler(async (req, res, next) => {
    const params = await systemParameterService.getGlobalParameters();
    res.status(200).json({
        success: true,
        data: params
    });
});

const updateParameters = asyncHandler(async (req, res, next) => {
    const params = await systemParameterService.updateGlobalParameters(req.body);
    res.status(200).json({
        success: true,
        data: params,
        message: 'Ajustes globales actualizados.'
    });
});

module.exports = {
    getParameters,
    updateParameters
};
