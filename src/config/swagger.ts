// config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet Auth API',
      version,
      description: 'API documentation for the Wallet Authentication System',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        url: 'https://your-website.com',
        email: 'support@your-email.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.your-production-url.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                code: {
                  type: 'string',
                  example: 'INTERNAL_ERROR',
                },
                status: {
                  type: 'number',
                  example: 500,
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            walletAddress: {
              type: 'string',
              example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['USER', 'CREATOR', 'ADMIN'],
              },
              example: ['USER'],
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              example: 'cryptouser',
            },
            bio: {
              type: 'string',
              example: 'Crypto enthusiast',
            },
            avatar: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/avatar.jpg',
            },
            socialLinks: {
              type: 'object',
              properties: {
                twitter: {
                  type: 'string',
                  example: 'https://twitter.com/username',
                },
                github: {
                  type: 'string',
                  example: 'https://github.com/username',
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);