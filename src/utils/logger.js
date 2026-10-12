const { createLogger, format, transports } = require('winston');
const { combine, printf, colorize, errors } = format;

/**
 * Formateador personalizado para incluir el timestamp en la zona horaria configurada (Bogotá por defecto).
 */
const timezonedTimestamp = format((info) => {
    const tz = process.env.APP_TIMEZONE || 'America/Bogota';
    info.timestamp = new Date().toLocaleString('sv-SE', {
        timeZone: tz,
    }).replace(',', '');
    return info;
});

/**
 * Formato final del log: [Timestamp] [Nivel]: [Mensaje/Stack]
 */
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }), // Capturar stacks de errores
        timezonedTimestamp(),
        colorize(),
        logFormat
    ),
    transports: [
        new transports.Console()
    ]
});

// Stream para integrar con Morgan
logger.stream = {
    write: (message) => logger.info(message.trim())
};

module.exports = logger;
