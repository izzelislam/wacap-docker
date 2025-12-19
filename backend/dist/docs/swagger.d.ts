import { Express } from 'express';
/**
 * OpenAPI/Swagger specification
 * Requirements: 7.4
 */
declare const swaggerSpec: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
        contact: {
            name: string;
        };
        license: {
            name: string;
            url: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
                description: string;
            };
            deviceToken: {
                type: string;
                in: string;
                name: string;
                description: string;
            };
        };
        schemas: {
            Error: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    error: {
                        type: string;
                        properties: {
                            code: {
                                type: string;
                                example: string;
                            };
                            message: {
                                type: string;
                                example: string;
                            };
                        };
                    };
                };
            };
            User: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: number;
                    };
                    email: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                };
            };
            Session: {
                type: string;
                properties: {
                    sessionId: {
                        type: string;
                        example: string;
                    };
                    name: {
                        type: string;
                        example: string;
                        nullable: boolean;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    phoneNumber: {
                        type: string;
                        example: string;
                        nullable: boolean;
                    };
                    userName: {
                        type: string;
                        example: string;
                        nullable: boolean;
                    };
                };
            };
        };
    };
    tags: {
        name: string;
        description: string;
    }[];
    paths: {
        '/health': {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/health/live': {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/health/ready': {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    '200': {
                        description: string;
                    };
                    '503': {
                        description: string;
                    };
                };
            };
        };
        '/auth/register': {
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                        example: string;
                                    };
                                    password: {
                                        type: string;
                                        minLength: number;
                                        example: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                    };
                    '400': {
                        description: string;
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/auth/login': {
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                    };
                                    password: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/auth/me': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/tokens': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    name: {
                                        type: string;
                                        example: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                    };
                };
            };
        };
        '/tokens/{id}': {
            delete: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/sessions': {
            get: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                        example: string;
                                    };
                                    name: {
                                        type: string;
                                        example: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                    };
                };
            };
        };
        '/sessions/{id}': {
            get: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
            delete: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/sessions/{id}/stop': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/sessions/{id}/restart': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/sessions/{id}/qr': {
            get: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/send/text': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                        example: string;
                                    };
                                    to: {
                                        type: string;
                                        example: string;
                                    };
                                    message: {
                                        type: string;
                                        example: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                    '400': {
                        description: string;
                    };
                };
            };
        };
        '/send/media': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                    };
                                    to: {
                                        type: string;
                                    };
                                    url: {
                                        type: string;
                                        description: string;
                                    };
                                    base64: {
                                        type: string;
                                        description: string;
                                    };
                                    mimetype: {
                                        type: string;
                                        example: string;
                                    };
                                    caption: {
                                        type: string;
                                    };
                                    fileName: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/send/location': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                    };
                                    to: {
                                        type: string;
                                    };
                                    latitude: {
                                        type: string;
                                        example: number;
                                    };
                                    longitude: {
                                        type: string;
                                        example: number;
                                    };
                                    name: {
                                        type: string;
                                    };
                                    address: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/send/contact': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                    };
                                    to: {
                                        type: string;
                                    };
                                    contact: {
                                        type: string;
                                        properties: {
                                            fullName: {
                                                type: string;
                                            };
                                            phoneNumber: {
                                                type: string;
                                            };
                                            organization: {
                                                type: string;
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/send/presence': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                    };
                                    to: {
                                        type: string;
                                        description: string;
                                    };
                                    presence: {
                                        type: string;
                                        enum: string[];
                                        example: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/send/read': {
            post: {
                tags: string[];
                summary: string;
                security: ({
                    bearerAuth: never[];
                    deviceToken?: undefined;
                } | {
                    deviceToken: never[];
                    bearerAuth?: undefined;
                })[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                    };
                                    to: {
                                        type: string;
                                        description: string;
                                    };
                                    messageIds: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                        description: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/webhooks': {
            post: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    sessionId: {
                                        type: string;
                                    };
                                    url: {
                                        type: string;
                                        format: string;
                                    };
                                    events: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    secret: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                    };
                };
            };
        };
        '/webhooks/session/{sessionId}': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/webhooks/{id}': {
            put: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
            delete: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    in: string;
                    name: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/webhooks/events': {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
    };
};
/**
 * Setup Swagger UI middleware
 */
export declare function setupSwagger(app: Express): void;
export { swaggerSpec };
//# sourceMappingURL=swagger.d.ts.map