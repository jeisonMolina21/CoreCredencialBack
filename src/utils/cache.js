const NodeCache = require('node-cache');

/**
 * Sistema de caché en memoria.
 * stdTTL: Tiempo de vida por defecto (3600 segundos = 1 hora).
 * checkperiod: Intervalo de limpieza automática de llaves expiradas (600 segundos).
 */
const cache = new NodeCache({ 
    stdTTL: 3600, 
    checkperiod: 600,
    useClones: false // Mejora rendimiento si no necesitamos mutar los objetos cacheados
});

module.exports = cache;
