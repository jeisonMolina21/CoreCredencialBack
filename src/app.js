/**
 * ============================================================================
 * CONFIGURACIÓN DE LA APLICACIÓN EXPRESS (HTTP PIPELINE)
 * ============================================================================
 * Define el middleware pipeline de Express, cabeceras de seguridad, límites
 * de peticiones, enrutamiento centralizado y captura de errores.
 * 
 * Capas del Pipeline (de entrada a salida):
 * 1. Timeouts: Previene requests colgados bloqueando hilos del event loop.
 * 2. Archivos Estáticos: Servidos con caché inmutable de 7 días.
 * 3. Compresión Gzip/Brotli: Reduce ancho de banda en respuestas JSON y assets.
 * 4. ContextMiddleware: Inyecta AsyncLocalStorage para trazabilidad y auditoría.
 * 5. Helmet: Cabeceras de protección (X-Content-Type-Options, CSP, HSTS).
 * 6. CORS: Control de orígenes permitidos.
 * 7. Morgan: Logging HTTP unificado hacia Winston.
 * 8. BodyParsers: Límite de carga útil de 1MB contra ataques DoS por memoria.
 * 9. Health & Docs: Endpoints de observabilidad y Swagger OpenAPI.
 * 10. Rate Limiting: Protección contra ataques de fuerza bruta y DoS.
 * 11. Rutas /api: Enrutador modular del sistema.
 * 12. ErrorMiddleware: Formateador uniforme de respuestas de error.
 */

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const timeout = require('connect-timeout');
const logger = require('./utils/logger');
const { sequelize } = require('./config/database');

const contextMiddleware = require('./middleware/contextMiddleware');
const swaggerDocs = require('./docs/swaggerUi');

const app = express();

// ============================================================================
// 1. LIMITADORES DE VELOCIDAD (RATE LIMITING)
// ============================================================================

// Límite general para la API: máximo 200 peticiones cada 15 minutos por IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 200, 
    message: { 
        success: false, 
        message: 'Demasiadas peticiones desde esta dirección IP. Por favor intente más tarde.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Límite estricto para autenticación: máximo 15 intentos cada 15 minutos por IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 15, 
    message: { 
        success: false, 
        message: 'Demasiados intentos de acceso desde esta IP. Por seguridad, intente de nuevo en 15 minutos.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================================================
// 2. TIMEOUTS Y ARCHIVOS ESTÁTICOS
// ============================================================================

// Interrumpe cualquier petición que tarde más de 15 segundos sin responder
app.use(timeout('15s'));

// Servir logos, fotos de perfil e imágenes de plantillas con caché HTTP de 7 días
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    immutable: true,
    index: false
}));

// ============================================================================
// 3. MIDDLEWARES GLOBALES DE INFRAESTRUCTURA Y SEGURIDAD
// ============================================================================

// Compresión HTTP automática de respuestas
app.use(compression()); 

// Contexto asíncrono para almacenar tenantId, userId durante el ciclo de vida del request
app.use(contextMiddleware);

// Blindaje de cabeceras HTTP con compatibilidad para la UI de Swagger CDN
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Permitir peticiones cross-origin desde clientes web
app.use(cors());

// Registro de peticiones HTTP en Winston
app.use(morgan('combined', { stream: logger.stream }));

// Límite estricto de tamaño de payload a 1MB para prevenir desbordamientos de memoria
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// ============================================================================
// 4. OBSERVABILIDAD Y DOCUMENTACIÓN INTERACTIVA
// ============================================================================

/**
 * @route GET /health
 * @desc Chequeo de salud del sistema (consumido por Docker, Kubernetes y balanceadores)
 */
app.get('/health', async (req, res) => {
    let dbStatus = 'UP';
    try {
        await sequelize.authenticate();
    } catch (e) {
        dbStatus = 'DOWN';
    }

    const memory = process.memoryUsage();
    const isHealthy = dbStatus === 'UP';

    res.status(isHealthy ? 200 : 503).json({ 
        status: isHealthy ? 'UP' : 'DEGRADED',
        database: dbStatus,
        uptime: `${Math.floor(process.uptime())}s`,
        memory: {
            rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`
        },
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Portal interactivo Swagger OpenAPI 3.0 para pruebas de API
app.use('/api/docs', swaggerDocs);

// ============================================================================
// 5. ENRUTAMIENTO DE NEGOCIO Y RATE LIMITING
// ============================================================================

const routes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

// Aplicar rate limits a las rutas de la API
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Montar todas las rutas funcionales bajo el prefijo /api
app.use('/api', routes);

// Middleware de verificación de timeout
app.use((req, res, next) => {
    if (!req.timedout) next();
});

// Middleware centralizado de gestión de errores
app.use(errorMiddleware);

module.exports = app;
