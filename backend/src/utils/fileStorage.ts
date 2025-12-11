import * as fs from 'fs/promises';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

export interface FileStorage {
  putFile(productId: number, file: Express.Multer.File): Promise<string>;
  getFileUrl(productId: number, filename: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
}

class LocalFileStorage implements FileStorage {
  private uploadDir: string;

  constructor(uploadDir: string) {
    this.uploadDir = uploadDir;
  }

  async putFile(productId: number, file: Express.Multer.File): Promise<string> {
    const productDir = path.join(this.uploadDir, productId.toString());
    
    // Ensure product directory exists
    await fs.mkdir(productDir, { recursive: true });

    const timestamp = Date.now();
    const filename = `${timestamp}_${file.originalname}`;
    const filePath = path.join(productDir, filename);

    await fs.writeFile(filePath, file.buffer);

    return filePath;
  }

  async getFileUrl(productId: number, filename: string): Promise<string> {
    // Extract just the filename if it's a full path
    let actualFilename = filename;
    if (filename.includes('/') || filename.includes('\\')) {
      const pathParts = filename.split(/[/\\]/);
      actualFilename = pathParts[pathParts.length - 1];
    }
    // Return relative path for Express static serving
    return `/uploads/${productId}/${actualFilename}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        logger.error('Error deleting file:', error);
        throw error;
      }
    }
  }

  async deleteProductDirectory(productId: number): Promise<void> {
    const productDir = path.join(this.uploadDir, productId.toString());
    try {
      await fs.rm(productDir, { recursive: true, force: true });
    } catch (error: any) {
      logger.error('Error deleting product directory:', error);
      // Don't throw - directory might not exist
    }
  }
}

class CloudinaryFileStorage implements FileStorage {
  private folder: string;

  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });

    this.folder = process.env.CLOUDINARY_FOLDER || 'pricing-system';
  }

  async putFile(productId: number, file: Express.Multer.File): Promise<string> {
    try {
      // Create unique filename
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const publicId = `${this.folder}/products/${productId}/${timestamp}_${sanitizedName}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          public_id: publicId,
          resource_type: 'auto', // auto-detect: image, video, raw, etc.
          folder: `${this.folder}/products/${productId}`,
        }
      );

      // Store the public_id (Cloudinary identifier) as filePath
      return result.public_id;
    } catch (error: any) {
      logger.error('Error uploading file to Cloudinary:', error);
      throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    }
  }

  async getFileUrl(productId: number, filename: string): Promise<string> {
    try {
      // filename is actually the public_id from Cloudinary
      const url = cloudinary.url(filename, {
        secure: true,
        resource_type: 'auto',
        // Add transformation for download support
        transformation: [
          { flags: 'attachment' }
        ],
      });
      return url;
    } catch (error: any) {
      logger.error('Error getting file URL from Cloudinary:', error);
      throw new Error(`Failed to get file URL from Cloudinary: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // filePath is actually the public_id from Cloudinary
      const result = await cloudinary.uploader.destroy(filePath, {
        resource_type: 'auto',
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        logger.warn(`Cloudinary delete result: ${result.result} for ${filePath}`);
      }
    } catch (error: any) {
      logger.error('Error deleting file from Cloudinary:', error);
      // Don't throw - file might not exist
    }
  }
}

class HybridFileStorage implements FileStorage {
  private cloudinaryStorage: CloudinaryFileStorage;
  private localStorage: LocalFileStorage;
  private uploadDir: string;

  // File types that should go to Cloudinary
  private readonly cloudinaryTypes = ['jpg', 'jpeg', 'png', 'pdf'];
  // File types that should stay local
  private readonly localTypes = ['dwg'];

  constructor(uploadDir: string) {
    this.cloudinaryStorage = new CloudinaryFileStorage();
    this.localStorage = new LocalFileStorage(uploadDir);
    this.uploadDir = uploadDir;
  }

  private getFileType(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  async putFile(productId: number, file: Express.Multer.File): Promise<string> {
    const fileType = this.getFileType(file.originalname);

    // DWG files go to local storage
    if (this.localTypes.includes(fileType)) {
      logger.info(`Storing ${fileType} file locally: ${file.originalname}`);
      return await this.localStorage.putFile(productId, file);
    }

    // Images and PDF go to Cloudinary
    if (this.cloudinaryTypes.includes(fileType)) {
      logger.info(`Storing ${fileType} file on Cloudinary: ${file.originalname}`);
      return await this.cloudinaryStorage.putFile(productId, file);
    }

    // Default: try Cloudinary first, fallback to local
    try {
      logger.info(`Attempting Cloudinary for ${fileType} file: ${file.originalname}`);
      return await this.cloudinaryStorage.putFile(productId, file);
    } catch (error) {
      logger.warn(`Cloudinary failed, falling back to local for ${fileType} file`);
      return await this.localStorage.putFile(productId, file);
    }
  }

  async getFileUrl(productId: number, filename: string): Promise<string> {
    // Check if it's a Cloudinary public_id or local path
    // Cloudinary public_id format: "pricing-system/products/65/..."
    // Local path format: "/usr/src/app/uploads/65/..." or "./uploads/65/..." or contains backslashes
    
    // If it's a local path (contains uploads directory or backslashes)
    if (filename.includes('/uploads') || filename.includes('\\') || filename.startsWith('/usr/src/app/uploads') || filename.startsWith('./uploads')) {
      // Extract just the filename from the path
      const pathParts = filename.split(/[/\\]/);
      const actualFilename = pathParts[pathParts.length - 1];
      return await this.localStorage.getFileUrl(productId, actualFilename);
    }
    
    // If it starts with the Cloudinary folder structure, it's a Cloudinary public_id
    if (filename.startsWith('pricing-system/') || filename.includes('/products/')) {
      return await this.cloudinaryStorage.getFileUrl(productId, filename);
    }
    
    // Default: treat as local file (extract filename)
    const pathParts = filename.split(/[/\\]/);
    const actualFilename = pathParts[pathParts.length - 1];
    return await this.localStorage.getFileUrl(productId, actualFilename);
  }

  async deleteFile(filePath: string): Promise<void> {
    // Check if it's a Cloudinary public_id or local path
    if (filePath.includes('/') && !filePath.startsWith('/uploads') && !filePath.includes('\\')) {
      // Likely a Cloudinary public_id
      await this.cloudinaryStorage.deleteFile(filePath);
    } else {
      // Local file path
      await this.localStorage.deleteFile(filePath);
    }
  }
}

class S3FileStorage implements FileStorage {
  // S3 implementation placeholder
  // This would use AWS SDK to upload to S3
  // For now, throw error to indicate it needs implementation

  async putFile(productId: number, file: Express.Multer.File): Promise<string> {
    throw new Error('S3 storage not yet implemented. Set STORAGE_PROVIDER=local');
  }

  async getFileUrl(productId: number, filename: string): Promise<string> {
    throw new Error('S3 storage not yet implemented. Set STORAGE_PROVIDER=local');
  }

  async deleteFile(filePath: string): Promise<void> {
    throw new Error('S3 storage not yet implemented. Set STORAGE_PROVIDER=local');
  }
}

export function createFileStorage(): FileStorage {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  const uploadDir = process.env.UPLOAD_DIR || './uploads';

  if (provider === 'cloudinary') {
    // Check if Cloudinary credentials are provided
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      logger.warn('Cloudinary credentials not found. Falling back to local storage.');
      logger.warn('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
      // Fallback to local storage
      fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
        logger.error('Failed to create upload directory:', err);
      });
      return new LocalFileStorage(uploadDir);
    }

    logger.info('Using Cloudinary storage');
    return new CloudinaryFileStorage();
  }

  if (provider === 'hybrid') {
    // Check if Cloudinary credentials are provided
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      logger.warn('Cloudinary credentials not found. Using local storage only.');
      logger.warn('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for hybrid mode');
      // Fallback to local storage
      fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
        logger.error('Failed to create upload directory:', err);
      });
      return new LocalFileStorage(uploadDir);
    }

    logger.info('Using Hybrid storage (Cloudinary + Local)');
    // Ensure upload directory exists for local files
    fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
      logger.error('Failed to create upload directory:', err);
    });
    return new HybridFileStorage(uploadDir);
  }

  if (provider === 's3') {
    // TODO: Initialize S3 client with AWS credentials
    // const s3Client = new S3Client({ ... });
    return new S3FileStorage();
  }

  // Default: Local storage
  logger.info('Using Local storage');
  // Ensure upload directory exists
  fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
    logger.error('Failed to create upload directory:', err);
  });

  return new LocalFileStorage(uploadDir);
}

// Export for use in services
export const fileStorage = createFileStorage();

