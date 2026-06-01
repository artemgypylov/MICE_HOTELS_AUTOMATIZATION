import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';
import { put } from '@vercel/blob';

/**
 * File upload middleware (multer).
 *
 * Saves uploaded images under UPLOAD_DIR/{folder}/{timestamp}_{originalname}.
 * OR, if process.env.BLOB_READ_WRITE_TOKEN is present, uploads to Vercel Blob.
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
 * Custom Multer storage for Vercel Blob
 */
class VercelBlobStorage implements multer.StorageEngine {
  constructor(private opts: { folder: string }) {}

  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error?: any, info?: Partial<Express.Multer.File>) => void
  ) {
    const ext = path.extname(file.originalname);
    const safeName = sanitizeFilename(path.basename(file.originalname, ext));
    const pathname = `${this.opts.folder}/${Date.now()}_${safeName}${ext}`;

    put(pathname, file.stream, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
      .then((blob) => {
        cb(null, {
          filename: blob.url,
        });
      })
      .catch((err) => {
        cb(err);
      });
  }

  _removeFile(
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null) => void
  ) {
    // Implementing delete is optional.
    cb(null);
  }
}

/**
 * Build a multer instance that stores files in UPLOAD_DIR/<folder> or Vercel Blob.
 */
export function createUploader(folder: 'hotels' | 'halls' | 'catering' | 'services') {
  const isVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  let storage: multer.StorageEngine;

  if (isVercelBlob) {
    storage = new VercelBlobStorage({ folder });
  } else {
    const destDir = path.join(UPLOAD_DIR, folder);
    storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        fs.mkdir(destDir, { recursive: true }, (err) => cb(err, destDir));
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safe = sanitizeFilename(path.basename(file.originalname, ext));
        cb(null, `${Date.now()}_${safe}${ext}`);
      },
    });
  }

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
 * `/uploads` middleware or return Vercel Blob URL directly.
 */
export function fileToUrl(folder: string, filename: string): string {
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `/uploads/${folder}/${filename}`;
}

export { UPLOAD_DIR, MAX_FILE_SIZE };
