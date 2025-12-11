import multer from 'multer';
import path from 'path';
import { logger } from '../utils/logger';

const storage = multer.memoryStorage();

// Allowed MIME types for additional security
const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/acad', // DWG files
  'application/x-dwg',
  'image/vnd.dwg',
];

// Allowed file extensions
const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.dwg'];

/**
 * Sanitize filename to prevent directory traversal and other security issues
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '')
    .replace(/^\.+/, '')
    .substring(0, 255); // Limit filename length
}

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check file extension
    if (!allowedExtensions.includes(ext)) {
      logger.warn(`File upload rejected: Invalid extension ${ext} from IP ${req.ip}`);
      return cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedExtensions.join(', ')}`));
    }

    // Check MIME type (additional security layer)
    if (file.mimetype && !allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      logger.warn(`File upload rejected: Invalid MIME type ${file.mimetype} from IP ${req.ip}`);
      return cb(new Error(`File MIME type ${file.mimetype} not allowed.`));
    }

    // Sanitize filename
    file.originalname = sanitizeFilename(file.originalname);

    cb(null, true);
  } catch (error) {
    logger.error('File filter error:', error);
    cb(error as Error);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB default
    files: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10', 10), // Max 10 files per upload
  },
});

