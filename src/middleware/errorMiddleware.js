/**
 * ============================================================================
 * MIDDLEWARE CENTRALIZADO DE MANEJO DE ERRORES (ERROR BOUNDARY)
 * ============================================================================
 * Intercepta todas las excepciones lanzadas sincrónica o asincrónicamente
 * por controladores y servicios mediante next(err) o rechazos de promesas.
 * 
 * Funciones Principales:
 * 1. Estandariza la estructura JSON de salida para todos los errores:
 *    { success: false, message: '...', stack?: '...' }
 * 2. Mapea excepciones de infraestructura a códigos HTTP apropiados:
 *    - Timeout (connect-timeout) -> HTTP 503
 *    - Payload Too Large (body-parser) -> HTTP 413
 *    - SequelizeValidationError -> HTTP 400
 *    - SequelizeUniqueConstraintError -> HTTP 400 (con detalle del campo duplicado)
 *    - AppError personalizado -> err.statusCode (400, 401, 403, 404, etc.)
 * 3. Registra el error en Winston con contexto (userId, companyId, URL, método, stack trace).
 * 4. Protege la seguridad ocultando el stack trace en entornos de producción.
 */

const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
    // Código de estado HTTP por defecto: 500 (Error Interno)
    err.statusCode = err.statusCode || 500;
    
    // Estructura de respuesta uniforme
    const response = {
        success: false,
        message: err.message || 'Ha ocurrido un error interno en el servidor.'
    };

    // 1. Manejo de Errores de Timeout (connect-timeout tras 15 segundos)
    if (err.timeout) {
        err.statusCode = 503;
        response.message = 'La petición ha tardado demasiado tiempo en procesarse (Timeout de 15s excedido).';
    }

    // 2. Manejo de Errores de Tamaño de Cuerpo (body-parser tras 1MB)
    if (err.type === 'entity.too.large') {
        err.statusCode = 413;
        response.message = 'El tamaño de los datos enviados supera el límite máximo permitido (1MB).';
    }

    // 3. Manejo de Errores de Validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
        err.statusCode = 400;
        response.message = err.errors.map(e => e.message).join(', ');
    }
    
    // 4. Manejo de Conflictos de Unicidad (Email, Cédula o NIT ya registrados)
    if (err.name === 'SequelizeUniqueConstraintError') {
        err.statusCode = 400;
        const field = err.errors[0]?.path;
        response.message = field 
            ? `El valor para el campo '${field}' ya existe registrado y debe ser único.`
            : 'Dato duplicado: el recurso ya existe en el sistema.';
    }

    // 5. Registro formal en Winston para monitoreo y depuración
    logger.error(`${req.method} ${req.originalUrl} - HTTP ${err.statusCode} - ${response.message}`, {
        stack: err.stack,
        userId: req.user?.id,
        companyId: req.user?.company_id,
        ip: req.ip
    });

    // 6. Exposición de Stack Trace únicamente en desarrollo
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
};

module.exports = errorMiddleware;
