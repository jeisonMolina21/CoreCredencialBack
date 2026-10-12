const Context = require('./context');
const logger = require('./logger');

const SENSITIVE_KEYS = new Set([
    'password',
    'token',
    'token_carnet',
    'secret',
    'access_token',
    'refresh_token',
    'credit_card',
    'cvv',
    'auth_token'
]);

/**
 * Sanitiza recursivamente un objeto o arreglo para ocultar datos sensibles
 * en los registros de auditoría (logs).
 */
const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') return data;
    
    // Si es un objeto Date o Buffer, no mutar
    if (data instanceof Date || Buffer.isBuffer(data)) return data;

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }

    const clean = {};
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_KEYS.has(lowerKey) || 
                            lowerKey.includes('password') || 
                            lowerKey.includes('secret') || 
                            lowerKey.includes('token');

        if (isSensitive) {
            clean[key] = '[REDACTED]';
        } else if (value && typeof value === 'object') {
            clean[key] = sanitizeData(value);
        } else {
            clean[key] = value;
        }
    }
    return clean;
};

/**
 * Capture snapshots of data and save to the appropriate log table.
 * 
 * @param {string} type - 'system' or 'company'
 * @param {string} action - 'CREATE', 'UPDATE', or 'DELETE'
 * @param {Object} instance - The Sequelize model instance
 * @param {Object} options - Sequelize options
 * @param {Object} allModels - Reference to all models to avoid circular imports
 */
const logEvent = async (type, action, instance, options, allModels) => {
    // Avoid logging the log tables themselves to prevent infinite loops
    if (instance.constructor.name === 'SystemLog' || instance.constructor.name === 'CompanyLog') {
        return;
    }

    try {
        const store = Context.getStore() || {};
        const tableName = instance.constructor.tableName;
        const recordId = instance.id;

        const rawBefore = action === 'CREATE' ? null : (instance._previousDataValues || instance.dataValues);
        const rawAfter = action === 'DELETE' ? null : instance.dataValues;

        const before = rawBefore ? JSON.stringify(sanitizeData(rawBefore)) : null;
        const after = rawAfter ? JSON.stringify(sanitizeData(rawAfter)) : null;

        if (type === 'system') {
            const SystemLog = allModels.SystemLog;
            if (!SystemLog) return;
            
            await SystemLog.create({
                user_id: store.userId || 1,
                action,
                table_name: tableName,
                record_id: recordId,
                before,
                after
            }, { transaction: options.transaction });
            
        } else if (type === 'company') {
            const CompanyLog = allModels.CompanyLog;
            if (!CompanyLog) return;

            // Priority: context companyId > instance company_id
            const companyId = store.companyId || instance.company_id;
            
            if (!companyId) return; // Can't log company event without companyId

            await CompanyLog.create({
                company_id: companyId,
                id_user_company: store.companyUserId || 0,
                action,
                table_name: tableName,
                record_id: recordId,
                before,
                after
            }, { transaction: options.transaction });
        }
    } catch (error) {
        logger.error(`Audit Logging Error [${action} on ${instance.constructor.name}]: ${error.message}`);
    }
};

/**
 * Attaches hooks to a model.
 */
const attachLogHooks = (model, type, allModels) => {
    model.addHook('afterCreate', (instance, options) => logEvent(type, 'CREATE', instance, options, allModels));
    model.addHook('afterUpdate', (instance, options) => logEvent(type, 'UPDATE', instance, options, allModels));
    model.addHook('afterDestroy', (instance, options) => logEvent(type, 'DELETE', instance, options, allModels));
};

module.exports = { attachLogHooks, sanitizeData };
