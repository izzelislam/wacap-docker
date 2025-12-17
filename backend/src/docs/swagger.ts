import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * OpenAPI/Swagger configuration
 * Requirements: 7.4
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wacap Docker API',
      version: '1.0.0',
      description: 'WhatsApp API for managing multi-session WhatsApp connections',
      contact: {
        name: 'API Support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'API Server'
      }
    ],
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
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                expiresIn: { type: 'string', example: '24h' }
              }
            }
          }
        },
        DeviceToken: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'My App Token' },
            token: { type: 'string', example: 'dt_abc123...' },
            createdAt: { type: 'string', format: 'date-time' },
            lastUsedAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Session: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'session-1' },
            name: { type: 'string', example: 'My WhatsApp', nullable: true },
            status: { 
              type: 'string', 
              enum: ['disconnected', 'connecting', 'qr', 'connected', 'error'],
              example: 'connected'
            },
            phoneNumber: { type: 'string', example: '628123456789', nullable: true },
            userName: { type: 'string', example: 'John Doe', nullable: true }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 3600 },
            version: { type: 'string', example: '1.0.0' },
            services: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['connected', 'disconnected'] },
                    latency: { type: 'number', example: 5 }
                  }
                },
                wacap: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['initialized', 'not_initialized'] },
                    activeSessions: { type: 'integer', example: 2 }
                  }
                }
              }
            }
          }
        },
        SendTextRequest: {
          type: 'object',
          required: ['sessionId', 'to', 'message'],
          properties: {
            sessionId: { type: 'string', example: 'session-1' },
            to: { type: 'string', example: '628123456789' },
            message: { type: 'string', example: 'Hello, World!' },
            mentions: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['628123456789']
            }
          }
        },
        SendMediaRequest: {
          type: 'object',
          required: ['sessionId', 'to', 'mimetype'],
          properties: {
            sessionId: { type: 'string', example: 'session-1' },
            to: { type: 'string', example: '628123456789' },
            url: { type: 'string', example: 'https://example.com/image.jpg' },
            base64: { type: 'string', description: 'Base64 encoded media' },
            mimetype: { type: 'string', example: 'image/jpeg' },
            caption: { type: 'string', example: 'Check this out!' },
            fileName: { type: 'string', example: 'document.pdf' }
          }
        },
        SendLocationRequest: {
          type: 'object',
          required: ['sessionId', 'to', 'latitude', 'longitude'],
          properties: {
            sessionId: { type: 'string', example: 'session-1' },
            to: { type: 'string', example: '628123456789' },
            latitude: { type: 'number', example: -6.2088 },
            longitude: { type: 'number', example: 106.8456 },
            name: { type: 'string', example: 'Jakarta' },
            address: { type: 'string', example: 'Jakarta, Indonesia' }
          }
        },
        SendContactRequest: {
          type: 'object',
          required: ['sessionId', 'to', 'contact'],
          properties: {
            sessionId: { type: 'string', example: 'session-1' },
            to: { type: 'string', example: '628123456789' },
            contact: {
              type: 'object',
              properties: {
                fullName: { type: 'string', example: 'John Doe' },
                phoneNumber: { type: 'string', example: '628123456789' },
                organization: { type: 'string', example: 'Company Inc' }
              }
            }
          }
        },
        MessageResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                messageId: { type: 'string', example: 'ABCD1234' },
                status: { type: 'string', example: 'sent' }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Device Tokens', description: 'Device token management' },
      { name: 'Sessions', description: 'WhatsApp session management' },
      { name: 'Messaging', description: 'Send messages via WhatsApp' }
    ]
  },
  apis: ['./src/docs/api-docs.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Setup Swagger UI middleware
 */
export function setupSwagger(app: Express): void {
  // Serve Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Wacap Docker API Documentation'
  }));

  // Serve raw OpenAPI spec as JSON
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export { swaggerSpec };
