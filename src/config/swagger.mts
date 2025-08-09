// src/config/swagger.mts
import swaggerJsdoc from 'swagger-jsdoc';
import { PORT } from './env.mts';

const port = PORT ?? 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Archimydes Challenge API',
      version: '1.0.0',
      description: 'API for user management — roles: USER, ADMIN, SUPER_ADMIN'
    },
    servers: [
      { url: `http://localhost:${port}`, description: 'Local dev server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Uniform response schema examples
        AuthSuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: ['object','array','null'] }
          }
        },
        AuthErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Invalid credentials' },
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User retrieved' },
            data: { type: ['object','array','null'] }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.mts', './src/controllers/*.mts'] 
};

export const swaggerSpec = swaggerJsdoc(options);
