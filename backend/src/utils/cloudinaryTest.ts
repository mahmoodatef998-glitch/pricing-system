import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

/**
 * Test Cloudinary connection and credentials
 */
export async function testCloudinaryConnection(): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Check if credentials are provided
  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn('Cloudinary credentials not provided');
    return false;
  }

  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Test connection by trying to ping Cloudinary API
    // We'll use a simple API call to verify credentials
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      logger.info('✅ Cloudinary connection test: SUCCESS');
      logger.info(`   Cloud Name: ${cloudName}`);
      logger.info(`   API Key: ${apiKey.substring(0, 8)}...`);
      return true;
    } else {
      logger.error('❌ Cloudinary connection test: FAILED');
      logger.error(`   Status: ${result.status}`);
      return false;
    }
  } catch (error: any) {
    logger.error('❌ Cloudinary connection test: FAILED');
    logger.error(`   Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('Invalid API Key')) {
      logger.error('   → Check your CLOUDINARY_API_KEY');
    } else if (error.message.includes('Invalid API Secret')) {
      logger.error('   → Check your CLOUDINARY_API_SECRET');
    } else if (error.message.includes('Invalid Cloud Name')) {
      logger.error('   → Check your CLOUDINARY_CLOUD_NAME');
    } else if (error.message.includes('401')) {
      logger.error('   → Authentication failed. Check your API credentials.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      logger.error('   → Network error. Check your internet connection.');
    }
    
    return false;
  }
}



