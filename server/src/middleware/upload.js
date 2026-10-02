import multer from 'multer';
import { BadRequestError } from '../utils/errors.js';

// 5MB limit
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (file.mimetype !== 'application/pdf') {
      return cb(new BadRequestError('Only PDF files are allowed for resume upload', 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
}).single('resume');

/**
 * Validates PDF Magic Bytes (%PDF / 0x25 0x50 0x44 0x46) in memory
 */
export function validatePDFBuffer(buffer) {
  if (!buffer || buffer.length < 4) {
    return false;
  }
  // %PDF in ASCII is [0x25, 0x50, 0x44, 0x46]
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  );
}
