import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pricing System API',
      version: '1.0.0',
      description: 'Professional product pricing and matching system API',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID',
              example: 1,
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'ATS',
            },
            size: {
              type: 'string',
              description: 'Product size',
              example: '34',
            },
            breakers: {
              type: 'string',
              description: 'Breakers type',
              example: 'CONTACTORS',
            },
            brand: {
              type: 'string',
              description: 'Product brand',
              example: 'LS',
            },
            ipEnclosure: {
              type: 'string',
              nullable: true,
              description: 'IP enclosure rating',
              example: '54',
            },
            pole: {
              type: 'string',
              nullable: true,
              description: 'Pole configuration',
              example: '3P',
            },
            price: {
              type: 'string',
              nullable: true,
              description: 'Product price',
              example: 'MANUAL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            drawings: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Drawing',
              },
            },
          },
        },
        Drawing: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Drawing ID',
            },
            filePath: {
              type: 'string',
              description: 'File path',
            },
            fileType: {
              type: 'string',
              description: 'File type (pdf, jpg, png, dwg)',
            },
            url: {
              type: 'string',
              description: 'Download URL',
            },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['description', 'size', 'breakers', 'brand'],
          properties: {
            description: {
              type: 'string',
              example: 'ATS',
            },
            size: {
              type: 'string',
              example: '34',
            },
            breakers: {
              type: 'string',
              example: 'CONTACTORS',
            },
            brand: {
              type: 'string',
              example: 'LS',
            },
            ipEnclosure: {
              type: 'string',
              example: '54',
            },
            pole: {
              type: 'string',
              example: '3P',
            },
            price: {
              type: 'string',
              example: 'MANUAL',
            },
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
              description: 'Drawing files (PDF, JPG, PNG, DWG)',
            },
          },
        },
        MatchCriteria: {
          type: 'object',
          required: ['description', 'size', 'breakers', 'brand'],
          properties: {
            description: {
              type: 'string',
              example: 'ATS',
            },
            size: {
              type: 'string',
              example: '34',
            },
            breakers: {
              type: 'string',
              example: 'CONTACTORS',
            },
            brand: {
              type: 'string',
              example: 'LS',
            },
            ipEnclosure: {
              type: 'string',
              example: '54',
            },
            pole: {
              type: 'string',
              example: '3P',
            },
          },
        },
        MatchResult: {
          type: 'object',
          properties: {
            matched: {
              type: 'boolean',
              description: 'Whether a match was found',
            },
            product: {
              $ref: '#/components/schemas/Product',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        PaginatedProducts: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                },
                limit: {
                  type: 'integer',
                },
                total: {
                  type: 'integer',
                },
                totalPages: {
                  type: 'integer',
                },
              },
            },
          },
        },
        AnalyticsData: {
          type: 'object',
          properties: {
            totalProducts: {
              type: 'integer',
            },
            totalDrawings: {
              type: 'integer',
            },
            productsByBrand: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  brand: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
            recentProducts: {
              type: 'integer',
            },
            averageDrawingsPerProduct: {
              type: 'number',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints',
      },
      {
        name: 'Products',
        description: 'Product management endpoints',
      },
      {
        name: 'Match',
        description: 'Product matching endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Export',
        description: 'Export endpoints',
      },
      {
        name: 'Bulk Operations',
        description: 'Bulk operations endpoints',
      },
      {
        name: 'Analytics',
        description: 'Analytics endpoints',
      },
      {
        name: 'History',
        description: 'Product history endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

