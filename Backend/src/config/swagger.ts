import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BluelearnerHub API',
    version: '1.0.0',
    description: 'API documentation for BluelearnerHub - Engineering Learning Platform',
    contact: {
      name: 'BluelearnerHub Team',
      url: 'https://bluelearnerhub.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Development server',
    },
    ...(config.frontendUrl
      ? [
          {
            url: `${config.frontendUrl.replace(':3000', ':5000')}/api/v1`,
            description: 'Production server',
          },
        ]
      : []),
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'JWT access token stored in httpOnly cookie',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token (alternative to cookie auth)',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          requestId: { type: 'string', format: 'uuid' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'objectId' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['STUDENT', 'MENTOR', 'ADMIN', 'CORPORATE'] },
          avatarUrl: { type: 'string', format: 'uri' },
          isActive: { type: 'boolean' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'object' } },
          nextCursor: { type: 'string', nullable: true },
          hasNextPage: { type: 'boolean' },
          limit: { type: 'integer' },
        },
      },
    },
  },
  security: [
    { cookieAuth: [] },
    { bearerAuth: [] },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

let _cachedSpec: ReturnType<typeof swaggerJSDoc> | null = null;

/**
 * Generate Swagger spec lazily — only when first requested.
 * Avoids parsing all route/controller files on startup in production.
 */
export function getSwaggerSpec() {
  if (!_cachedSpec) {
    _cachedSpec = swaggerJSDoc(options);
  }
  return _cachedSpec;
}
