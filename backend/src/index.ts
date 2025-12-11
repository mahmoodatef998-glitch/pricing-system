import app from './app';
import { logger } from './utils/logger';
import { testCloudinaryConnection } from './utils/cloudinaryTest';

const PORT = process.env.PORT || 4000;

// Test Cloudinary connection on startup (if configured)
async function initialize() {
  const storageProvider = process.env.STORAGE_PROVIDER || 'local';
  
  if (storageProvider === 'cloudinary' || storageProvider === 'hybrid') {
    logger.info('Testing Cloudinary connection...');
    const cloudinaryOk = await testCloudinaryConnection();
    
    if (!cloudinaryOk) {
      logger.warn('⚠️  Cloudinary test failed, but server will continue');
      logger.warn('   Files will fallback to local storage');
    }
  } else {
    logger.info('Using local storage (Cloudinary not configured)');
  }
}

// Initialize and start server
let server: any;

initialize().then(() => {
  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
}).catch((error) => {
  logger.error('Failed to initialize server:', error);
  process.exit(1);
});

