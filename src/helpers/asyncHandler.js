/**
 * Envuelve una función asíncrona para capturar errores y pasarlos al middleware global.
 * Elimina la necesidad de bloques try-catch repetitivos en los controladores.
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = asyncHandler;
