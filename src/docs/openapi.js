/**
 * Especificación OpenAPI 3.0 para CoreCredential / Carnet Digital Backend
 */
module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'Carnet Digital API - Enterprise Suite',
        version: '2.0.0',
        description: 'API RESTful multi-tenant de alto rendimiento para emisión, gestión y control de carnets digitales institucionales.',
        contact: {
            name: 'Soporte CoreCredential',
            email: 'soporte@corecredential.com'
        }
    },
    servers: [
        {
            url: '/api',
            description: 'Servidor Actual'
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Ingresa el token JWT obtenido en /api/auth/login'
            }
        },
        schemas: {
            StandardResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Operación realizada correctamente' },
                    data: { type: 'object' }
                }
            },
            PaginatedMeta: {
                type: 'object',
                properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 25 },
                    total: { type: 'integer', example: 120 },
                    totalPages: { type: 'integer', example: 5 },
                    hasNextPage: { type: 'boolean', example: true },
                    hasPrevPage: { type: 'boolean', example: false }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@empresa.com' },
                    password: { type: 'string', example: 'Password123*' }
                }
            },
            UserCreateRequest: {
                type: 'object',
                required: ['first_name', 'last_name', 'type_id', 'number_id', 'company_email', 'staff_mail', 'password'],
                properties: {
                    first_name: { type: 'string', example: 'Carlos' },
                    last_name: { type: 'string', example: 'Gómez' },
                    type_id: { type: 'string', example: 'CC' },
                    number_id: { type: 'string', example: '1098765432' },
                    rh_type: { type: 'string', example: 'O+' },
                    company_email: { type: 'string', format: 'email', example: 'carlos.gomez@empresa.com' },
                    staff_mail: { type: 'string', format: 'email', example: 'carlos.personal@gmail.com' },
                    staff_phone: { type: 'string', example: '+573001234567' },
                    password: { type: 'string', example: 'Colaborador123*' },
                    system_role: { type: 'string', enum: ['admin', 'visualizer', 'common', 'roster', 'retired'], example: 'common' },
                    company_area_id: { type: 'integer', example: 1 },
                    company_rol_id: { type: 'integer', example: 2 },
                    company_headquarter_id: { type: 'integer', example: 1 }
                }
            },
            CarnetCreateRequest: {
                type: 'object',
                required: ['template_id', 'type_carnet', 'status', 'valid_from', 'valid_to'],
                properties: {
                    template_id: { type: 'integer', example: 1 },
                    type_carnet: { type: 'string', example: 'DIGITAL' },
                    status: { type: 'string', example: 'ACTIVE' },
                    valid_from: { type: 'string', format: 'date-time', example: '2026-01-01T00:00:00Z' },
                    valid_to: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59Z' }
                }
            }
        }
    },
    paths: {
        '/auth/login': {
            post: {
                tags: ['Autenticación'],
                summary: 'Inicio de sesión unificado',
                description: 'Permite autenticar usuarios de sistema (global) o colaboradores de compañía (tenant).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Inicio de sesión exitoso con token JWT generado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StandardResponse' }
                            }
                        }
                    },
                    401: { description: 'Credenciales inválidas' }
                }
            }
        },
        '/company-users': {
            get: {
                tags: ['Colaboradores (Tenant)'],
                summary: 'Listar colaboradores con paginación y filtros',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Número de página' },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 25 }, description: 'Elementos por página' },
                    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por nombre, apellido, documento o email' },
                    { name: 'area_id', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por ID de área' },
                    { name: 'status', in: 'query', schema: { type: 'boolean' }, description: 'Filtrar por estado activo/inactivo' }
                ],
                responses: {
                    200: { description: 'Lista paginada de colaboradores' }
                }
            },
            post: {
                tags: ['Colaboradores (Tenant)'],
                summary: 'Crear nuevo colaborador',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserCreateRequest' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Colaborador creado exitosamente' },
                    403: { description: 'Límite de colaboradores del plan alcanzado' }
                }
            }
        },
        '/company-carnets': {
            get: {
                tags: ['Carnets (Tenant)'],
                summary: 'Listar carnets de la empresa con paginación',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 25 } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'status', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Lista paginada de carnets' }
                }
            },
            post: {
                tags: ['Carnets (Tenant)'],
                summary: 'Generar nuevo carnet digital',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CarnetCreateRequest' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Carnet generado exitosamente' }
                }
            }
        },
        '/companies/dashboard': {
            get: {
                tags: ['Dashboard'],
                summary: 'Métricas agregadas y límites del plan en tiempo real',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Resumen consolidado de métricas (optimizado con micro-caché)' }
                }
            }
        }
    }
};
