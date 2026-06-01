import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';

/**
 * File upload middleware (multer).
 *
 * Saves uploaded images under UPLOAD_DIR/{folder}/{timestamp}_{originalname}.
 * Only jpeg/png/webp are accepted; max size is MAX_FILE_SIZE bytes
 * (default 10 MB). The destination sub-folder is derived from the route
 * parameter or a fixed value supplied by the caller.
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10 MB

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Build a multer instance that stores files in UPLOAD_DIR/<folder>.
 */
export function createUploader(folder: 'hotels' | 'halls' | 'catering' | 'services') {
  const destDir = path.join(UPLOAD_DIR, folder);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdir(destDir, { recursive: true }, (err) => cb(err, destDir));
    },
    filename: (_req, file, cb) => {
      const safe = sanitizeFilename(file.originalname);
      cb(null, `${Date.now()}_${safe}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req: Request, file, cb) => {
      if (ALLOWED_MIME.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG and WebP images are allowed'));
      }
    },
  });
}

/**
 * Convert a stored file into a public URL path served by the static
 * `/uploads` middleware.
 */
export function fileToUrl(folder: string, filename: string): string {
  return `/uploads/${folder}/${filename}`;
}

export { UPLOAD_DIR, MAX_FILE_SIZE };
