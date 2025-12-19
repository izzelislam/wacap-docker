"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
exports.setupSwagger = setupSwagger;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
/**
 * OpenAPI/Swagger specification
 * Requirements: 7.4
 */
const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Wacap Docker API',
        version: '1.0.0',
        description: 'WhatsApp API for managing multi-session WhatsApp connections',
        contact: { name: 'API Support' },
        license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' }
    },
    servers: [{ url: '/api', description: 'API Server' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token obtained from login endpoint'
            },
            deviceToken: {
                type: 'apiKey',
                in: 'header',
                name: 'X-Device-Token',
                description: 'Device token for API access'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', example: 'VALIDATION_ERROR' },
                            message: { type: 'string', example: 'Invalid input' }
                        }
                    }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Session: {
                type: 'object',
                properties: {
                    sessionId: { type: 'string', example: 'session-1' },
                    name: { type: 'string', example: 'My WhatsApp', nullable: true },
                    status: { type: 'string', enum: ['disconnected', 'connecting', 'qr', 'connected', 'error'] },
                    phoneNumber: { type: 'string', example: '628123456789', nullable: true },
                    userName: { type: 'string', example: 'John Doe', nullable: true }
                }
            }
        }
    },
    tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Authentication', description: 'User authentication endpoints' },
        { name: 'Device Tokens', description: 'Device token management' },
        { name: 'Sessions', description: 'WhatsApp session management' },
        { name: 'Messaging', description: 'Send messages via WhatsApp' },
        { name: 'Webhooks', description: 'Webhook configuration' }
    ],
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Get service health status',
                responses: { '200': { description: 'Service health status' } }
            }
        },
        '/health/live': {
            get: {
                tags: ['Health'],
                summary: 'Liveness probe',
                responses: { '200': { description: 'Service is alive' } }
            }
        },
        '/health/ready': {
            get: {
                tags: ['Health'],
                summary: 'Readiness probe',
                responses: { '200': { description: 'Service is ready' }, '503': { description: 'Service not ready' } }
            }
        },
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                                    password: { type: 'string', minLength: 8, example: 'password123' }
                                }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'User created' }, '400': { description: 'Validation error' }, '409': { description: 'Email exists' } }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Login user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } }
            }
        },
        '/auth/me': {
            get: {
                tags: ['Authentication'],
                summary: 'Get current user',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'User info' }, '401': { description: 'Not authenticated' } }
            }
        },
        '/tokens': {
            get: {
                tags: ['Device Tokens'],
                summary: 'List device tokens',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'List of tokens' } }
            },
            post: {
                tags: ['Device Tokens'],
                summary: 'Create device token',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: { name: { type: 'string', example: 'My App Token' } }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'Token created' } }
            }
        },
        '/tokens/{id}': {
            delete: {
                tags: ['Device Tokens'],
                summary: 'Revoke device token',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Token revoked' }, '404': { description: 'Not found' } }
            }
        },
        '/sessions': {
            get: {
                tags: ['Sessions'],
                summary: 'List sessions',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                responses: { '200': { description: 'List of sessions' } }
            },
            post: {
                tags: ['Sessions'],
                summary: 'Create session',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId'],
                                properties: {
                                    sessionId: { type: 'string', example: 'my-session' },
                                    name: { type: 'string', example: 'My WhatsApp' }
                                }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'Session created' } }
            }
        },
        '/sessions/{id}': {
            get: {
                tags: ['Sessions'],
                summary: 'Get session',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Session details' }, '404': { description: 'Not found' } }
            },
            delete: {
                tags: ['Sessions'],
                summary: 'Delete session',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Session deleted' } }
            }
        },
        '/sessions/{id}/stop': {
            post: {
                tags: ['Sessions'],
                summary: 'Stop session',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Session stopped' } }
            }
        },
        '/sessions/{id}/restart': {
            post: {
                tags: ['Sessions'],
                summary: 'Restart session',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Session restarted' } }
            }
        },
        '/sessions/{id}/qr': {
            get: {
                tags: ['Sessions'],
                summary: 'Get QR code',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'QR code data' } }
            }
        },
        '/send/text': {
            post: {
                tags: ['Messaging'],
                summary: 'Send text message',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'to', 'message'],
                                properties: {
                                    sessionId: { type: 'string', example: 'my-session' },
                                    to: { type: 'string', example: '628123456789' },
                                    message: { type: 'string', example: 'Hello!' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Message sent' }, '400': { description: 'Validation error' } }
            }
        },
        '/send/media': {
            post: {
                tags: ['Messaging'],
                summary: 'Send media (image/video/document)',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'to', 'mimetype'],
                                properties: {
                                    sessionId: { type: 'string' },
                                    to: { type: 'string' },
                                    url: { type: 'string', description: 'Media URL' },
                                    base64: { type: 'string', description: 'Base64 encoded media' },
                                    mimetype: { type: 'string', example: 'image/jpeg' },
                                    caption: { type: 'string' },
                                    fileName: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Media sent' } }
            }
        },
        '/send/location': {
            post: {
                tags: ['Messaging'],
                summary: 'Send location',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'to', 'latitude', 'longitude'],
                                properties: {
                                    sessionId: { type: 'string' },
                                    to: { type: 'string' },
                                    latitude: { type: 'number', example: -6.2088 },
                                    longitude: { type: 'number', example: 106.8456 },
                                    name: { type: 'string' },
                                    address: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Location sent' } }
            }
        },
        '/send/contact': {
            post: {
                tags: ['Messaging'],
                summary: 'Send contact card',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'to', 'contact'],
                                properties: {
                                    sessionId: { type: 'string' },
                                    to: { type: 'string' },
                                    contact: {
                                        type: 'object',
                                        properties: {
                                            fullName: { type: 'string' },
                                            phoneNumber: { type: 'string' },
                                            organization: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Contact sent' } }
            }
        },
        '/send/presence': {
            post: {
                tags: ['Messaging'],
                summary: 'Send presence update (typing, online, etc)',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'presence'],
                                properties: {
                                    sessionId: { type: 'string' },
                                    to: { type: 'string', description: 'Phone number (optional, for chat-specific presence)' },
                                    presence: { type: 'string', enum: ['available', 'unavailable', 'composing', 'recording', 'paused'], example: 'composing' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Presence sent' } }
            }
        },
        '/send/read': {
            post: {
                tags: ['Messaging'],
                summary: 'Mark messages as read',
                security: [{ bearerAuth: [] }, { deviceToken: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'to', 'messageIds'],
                                properties: {
                                    sessionId: { type: 'string' },
                                    to: { type: 'string', description: 'Phone number of the chat' },
                                    messageIds: { type: 'array', items: { type: 'string' }, description: 'Array of message IDs to mark as read' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Messages marked as read' } }
            }
        },
        '/webhooks': {
            post: {
                tags: ['Webhooks'],
                summary: 'Create webhook for session',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'url', 'events'],
                                properties: {
                                    sessionId: { type: 'string' },
                                    url: { type: 'string', format: 'uri' },
                                    events: { type: 'array', items: { type: 'string' } },
                                    secret: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'Webhook created' } }
            }
        },
        '/webhooks/session/{sessionId}': {
            get: {
                tags: ['Webhooks'],
                summary: 'Get webhook for session',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Webhook config' } }
            }
        },
        '/webhooks/{id}': {
            put: {
                tags: ['Webhooks'],
                summary: 'Update webhook',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Webhook updated' } }
            },
            delete: {
                tags: ['Webhooks'],
                summary: 'Delete webhook',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Webhook deleted' } }
            }
        },
        '/webhooks/events': {
            get: {
                tags: ['Webhooks'],
                summary: 'List available webhook events',
                responses: { '200': { description: 'List of events' } }
            }
        }
    }
};
exports.swaggerSpec = swaggerSpec;
/**
 * Setup Swagger UI middleware
 */
function setupSwagger(app) {
    app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Wacap Docker API Documentation'
    }));
    app.get('/api/docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}
//# sourceMappingURL=swagger.js.map