const Context = require('../utils/context');

/**
 * Middleware that initializes the AsyncLocalStorage context for each request.
 */
const contextMiddleware = (req, res, next) => {
    // We initialize the store as an empty object.
    // It will be populated later by the auth middleware or other logic.
    Context.run({}, () => {
        next();
    });
};

module.exports = contextMiddleware;
