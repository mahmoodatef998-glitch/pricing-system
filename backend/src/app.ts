import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import 'express-async-errors';
import { logger } from './utils/logger';
import { apiLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiter';
import { swaggerSpec } from './utils/swagger';
import productRoutes from './routes/products';
import matchRoutes from './routes/match';
import authRoutes from './routes/auth';
import exportRoutes from './routes/export';
import bulkRoutes from './routes/bulk';
import analyticsRoutes from './routes/analytics';
import historyRoutes from './routes/history';

const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      fontSrc: ["'self'", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Cloudinary images
}));

// Middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || (process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3001'] 
    : ['http://localhost:3001', 'http://localhost:3000']), // Allow frontend origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Pricing System API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Apply general API rate limiting to all routes
app.use('/api', apiLimiter);

// Serve static files from uploads directory with proper headers for downloads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir), {
  setHeaders: (res, filePath) => {
    // Set headers to allow downloads
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/history', historyRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 *                 services:
 *                   type: object
 *       503:
 *         description: Service is degraded
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unknown',
        cloudinary: 'unknown',
      },
    };

    // Check database connection
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check Cloudinary (if configured)
    if (process.env.STORAGE_PROVIDER === 'cloudinary' || process.env.STORAGE_PROVIDER === 'hybrid') {
      try {
        const { testCloudinaryConnection } = await import('./utils/cloudinaryTest');
        const cloudinaryOk = await testCloudinaryConnection();
        health.services.cloudinary = cloudinaryOk ? 'connected' : 'disconnected';
        if (!cloudinaryOk) {
          health.status = 'degraded';
        }
      } catch (error) {
        health.services.cloudinary = 'error';
        health.status = 'degraded';
      }
    } else {
      health.services.cloudinary = 'not_configured';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;

