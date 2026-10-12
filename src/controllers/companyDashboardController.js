const companyDashboardService = require('../services/companyDashboardService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../utils/appError');

const getDashboardStats = asyncHandler(async (req, res, next) => {
    // El id de la empresa viene del token del usuario autenticado
    const companyId = req.user.company_id;

    if (!companyId) {
        return next(new AppError('No se encontró una empresa asociada a este usuario', 400));
    }

    const data = await companyDashboardService.getStats(companyId);

    res.status(200).json({
        success: true,
        message: 'Estadísticas del dashboard obtenidas correctamente',
        data
    });
});

module.exports = {
    getDashboardStats
};
