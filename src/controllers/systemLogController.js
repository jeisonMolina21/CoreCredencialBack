const systemLogService = require('../services/systemLogService');
const asyncHandler = require('../helpers/asyncHandler');

const getRecentActivity = asyncHandler(async (req, res, next) => {
    // Tomamos como límite estandar las últimas 20 acciones globales
    const limit = parseInt(req.query.limit) || 20;
    const logs = await systemLogService.getRecentLogs(limit);
    
    res.status(200).json({
        success: true,
        data: logs
    });
});

module.exports = {
    getRecentActivity
};
