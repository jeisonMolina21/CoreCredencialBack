/**
 * Utilidad empresarial para Paginación, Ordenamiento y Metadatos de consultas.
 */

/**
 * Normaliza y extrae parámetros de paginación desde los query params.
 *
 * @param {Object} query - req.query del request de Express
 * @param {Object} options - Parámetros por defecto { defaultLimit, maxLimit, defaultSortBy, defaultSortOrder }
 * @returns {Object} { page, limit, offset, sortBy, sortOrder, search }
 */
const getPaginationParams = (query = {}, options = {}) => {
    const defaultLimit = options.defaultLimit || 20;
    const maxLimit = options.maxLimit || 100;

    let page = parseInt(query.page, 10);
    if (isNaN(page) || page < 1) page = 1;

    let limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    const offset = (page - 1) * limit;

    const sortBy = query.sortBy || options.defaultSortBy || 'created_at';
    const sortOrder = (query.sortOrder && query.sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
    const search = query.search ? String(query.search).trim() : null;

    return { 
        page, 
        limit, 
        offset, 
        sortBy, 
        sortOrder, 
        search 
    };
};

/**
 * Construye una respuesta paginada estandarizada con metadatos claros.
 *
 * @param {Array} items - Arreglo de datos del resultado
 * @param {number} totalCount - Total de registros encontrados
 * @param {number} page - Página actual
 * @param {number} limit - Límite de elementos por página
 * @returns {Object} { data, meta }
 */
const formatPaginatedResponse = (items, totalCount, page, limit) => {
    const totalPages = Math.ceil(totalCount / limit) || 1;
    return {
        data: items,
        meta: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

module.exports = {
    getPaginationParams,
    formatPaginatedResponse
};
