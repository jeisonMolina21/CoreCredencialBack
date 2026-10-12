/**
 * ============================================================================
 * SERVIDOR PRINCIPAL - BACKEND CORECREDENTIAL / CARNET DIGITAL
 * ============================================================================
 * Punto de entrada oficial de la aplicación.
 * 
 * Responsabilidades:
 * 1. Cargar variables de entorno y configurar zona horaria del proceso.
 * 2. Conectar y autenticar con el motor de base de datos MySQL (Sequelize).
 * 3. Sincronizar esquemas de datos de forma controlada y segura.
 * 4. Sembrar datos esenciales del sistema (SuperAdmin y Plan Gratuito).
 * 5. Programar tareas periódicas en segundo plano (Cron Jobs).
 * 6. Levantar el servidor HTTP Express y gestionar el cierre elegante (Graceful Shutdown).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const logger = require('./utils/logger');
const app = require('./app');
const { connectDB, sequelize } = require('./config/database');
const initializeSystemData = require('./helpers/initializeSystemData');
const { processExpiredSubscriptions } = require('./jobs/subscriptionExpiryJob');

// --- 1. CONFIGURACIÓN DE ZONA HORARIA GLOBAL ---
// Garantiza consistencia en cálculos de fechas de expiración de suscripciones y carnets
process.env.TZ = process.env.APP_TIMEZONE || 'America/Bogota';

// --- 2. MANEJO DE EXCEPCIONES Y RECHAZOS NO CAPTURADOS ---
// Evita caídas silenciosas del proceso y registra el stack trace completo
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ [Unhandled Rejection] Rechazo no controlado en promesa:', { promise, reason });
});

process.on('uncaughtException', (error) => {
    logger.error('❌ [Uncaught Exception] Excepción crítica no capturada:', error);
    process.exit(1);
});

// Puerto de escucha TCP (por defecto 4000 o 3010 como respaldo)
const PORT = process.env.PORT || 4000;
let server;

/**
 * Inicialización asíncrona secuencial del servidor.
 */
const startServer = async () => {
    try {
        logger.info('⏳ Iniciando secuencia de arranque del servidor CoreCredential...');

        // Paso 1: Conexión y autenticación con MySQL
        await connectDB();

        // Paso 2: Sincronización controlada de esquemas de datos
        // En producción se evita 'alter: true' para prevenir locks y saturación de information_schema
        const isDev = process.env.NODE_ENV === 'development';
        const enableSync = process.env.DB_SYNC !== 'false';
        const useAlter = process.env.DB_SYNC_ALTER === 'true' || isDev;

        if (enableSync) {
            logger.info(`⏳ Sincronizando esquemas de BD (alter: ${useAlter})...`);
            await sequelize.sync({ alter: useAlter, logging: false });
            logger.info('✅ Esquemas de base de datos sincronizados con éxito.');
        } else {
            logger.info('ℹ️ Sincronización de esquemas omitida por configuración.');
        }
        
        // Paso 3: Sembrado inicial de datos (SuperAdmin global y Plan Free por defecto)
        await initializeSystemData();

        // Paso 4: Registro de Tareas Programadas (Cron Jobs)
        try {
            const cron = require('node-cron');
            // Se ejecuta diariamente a las 00:05 AM para evaluar vencimientos de suscripciones
            cron.schedule('5 0 * * *', () => {
                logger.info('⏰ Ejecutando cron job diario [subscriptionExpiryJob]...');
                processExpiredSubscriptions();
            });
            logger.info('✅ Cron job [subscriptionExpiryJob] registrado (diario a las 00:05 AM).');
        } catch (e) {
            logger.warn('⚠️ node-cron no disponible. Las tareas programadas automáticas no estarán activas.');
        }

        // Paso 5: Puesta en marcha del listener HTTP
        server = app.listen(PORT, () => {
            logger.info(`🚀 Servidor HTTP CoreCredential activo en http://localhost:${PORT}`);
            logger.info(`📖 Documentación Swagger OpenAPI disponible en http://localhost:${PORT}/api/docs`);
            logger.info(`💓 Chequeo de salud del sistema disponible en http://localhost:${PORT}/health`);
        });

        // Manejo de colisiones de puerto TCP
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`❌ El puerto TCP ${PORT} ya se encuentra ocupado por otro proceso.`);
                process.exit(1);
            } else {
                logger.error('❌ Error no controlado en servidor HTTP:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        logger.error('❌ Error crítico durante la secuencia de arranque:', error);
        process.exit(1);
    }
};

/**
 * Cierre elegante del servidor (Graceful Shutdown)
 * Permite culminar las solicitudes en vuelo y cerrar los pools de base de datos antes de terminar.
 * 
 * @param {string} signal - Señal del sistema operativo recibida (SIGINT, SIGTERM)
 */
const shutdown = async (signal) => {
    logger.info(`🛑 Señal ${signal} recibida. Iniciando cierre elegante (Graceful Shutdown)...`);
    
    if (server) {
        server.close(async () => {
            logger.info('Servidor HTTP cerrado. No se aceptan nuevas conexiones.');
            try {
                await sequelize.close();
                logger.info('Pool de conexiones a MySQL cerrado correctamente.');
                process.exit(0);
            } catch (err) {
                logger.error('Error al cerrar el pool de conexiones de base de datos:', err);
                process.exit(1);
            }
        });
    } else {
        process.exit(0);
    }

    // Forzar terminación del proceso si las conexiones abiertas tardan más de 10 segundos
    setTimeout(() => {
        logger.warn('Tiempo límite de cierre agotado (10s). Forzando terminación del proceso.');
        process.exit(1);
    }, 10000);
};

// Escucha de señales estándar de terminación de procesos en Linux/Windows/Docker
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Ejecutar arranque
startServer();
