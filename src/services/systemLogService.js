const { SystemLog, SystemUser } = require('../models');

class SystemLogService {
    async getRecentLogs(limit = 20) {
        return await SystemLog.findAll({
            order: [['created_at', 'DESC']],
            limit: limit,
            include: [
                {
                    model: SystemUser,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
    }
}

module.exports = new SystemLogService();
