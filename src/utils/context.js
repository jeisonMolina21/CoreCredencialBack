const { AsyncLocalStorage } = require('async_hooks');

const contextStore = new AsyncLocalStorage();

/**
 * Utility to manage request-scoped context (userId, companyId, etc.)
 */
const Context = {
    run(data, callback) {
        return contextStore.run(data, callback);
    },

    getStore() {
        return contextStore.getStore();
    },

    set(key, value) {
        const store = contextStore.getStore();
        if (store) {
            store[key] = value;
        }
    },

    get(key) {
        const store = contextStore.getStore();
        return store ? store[key] : undefined;
    }
};

module.exports = Context;
