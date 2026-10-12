const AppError = require('../utils/appError');

/**
 * Middleware genérico para validar datos usando esquemas de Joi
 * @param {Object} schema - El esquema de Joi para validar
 * @param {string} property - La propiedad de 'req' a validar (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false, // Capturar todos los errores, no solo el primero
            errors: {
                label: 'key',
                wrap: {
                    label: false
                }
            }
        });

        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(message, 400));
        }

        next();
    };
};

module.exports = validate;
