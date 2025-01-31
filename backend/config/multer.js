import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory with proper permissions
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}

// Allowed file types and their extensions
const ALLOWED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

// Helper function to validate file extension
const validateFileExtension = (originalname, mimetype) => {
  const ext = path.extname(originalname).toLowerCase();
  return ALLOWED_TYPES[mimetype]?.includes(ext);
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing upload:', file.originalname);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    try {
      if (!file.originalname) {
        throw new Error('No original filename provided');
      }

      const timestamp = Date.now();
      const randomString = crypto.randomBytes(16).toString('hex');
      const extension = path.extname(file.originalname).toLowerCase();
      const sanitizedFilename = `${timestamp}-${randomString}${extension}`;

      // Set file properties
      file.filename = sanitizedFilename;
      file.path = path.join(uploadsDir, sanitizedFilename);

      if (process.env.NODE_ENV === 'development') {
        console.log('Generated filename:', sanitizedFilename);
      }

      cb(null, sanitizedFilename);
    } catch (error) {
      cb(error);
    }
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  try {
    // Validate file existence and properties
    if (!file?.originalname || !file?.mimetype) {
      throw new Error('Invalid file object');
    }

    // Check mime type
    if (!ALLOWED_TYPES[file.mimetype]) {
      throw new Error(`File type not allowed: ${file.mimetype}`);
    }

    // Validate file extension matches mime type
    if (!validateFileExtension(file.originalname, file.mimetype)) {
      throw new Error('File extension does not match its content type');
    }

    // Check file size (also enforced by limits)
    if (file.size && file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds limit (10MB)');
    }

    cb(null, true);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('File validation error:', error.message);
    }
    cb(error);
  }
};

// Upload limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 10,                   // Maximum number of files
  fieldSize: 20 * 1024 * 1024 // Max field value size (20MB)
};

export { storage, fileFilter, limits };
