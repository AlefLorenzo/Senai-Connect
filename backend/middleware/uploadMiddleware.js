// backend/middleware/uploadMiddleware.js

const path = require('path');
const multer = require('multer');
const fs = require('fs');

/**
 * Returns a Multer instance configured for a specific upload folder.
 * The folder is a subdirectory under the global "uploads" directory.
 * Example usage: `uploadMiddleware('avatars')` will store files in `uploads/avatars/`.
 */
function uploadMiddleware(folder) {
  // Ensure the destination directory exists.
  const destDir = path.resolve(__dirname, '..', '..', 'uploads', folder);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      // Use a timestamp + original name to avoid collisions.
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s+/g, '_');
      cb(null, `${timestamp}_${safeName}`);
    },
  });

  // Accept only common image types and limit size to 5 MB.
  const fileFilter = (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: JPEG, PNG, WEBP'), false);
    }
  };

  const limits = { fileSize: 5 * 1024 * 1024 }; // 5 MB

  return multer({ storage, fileFilter, limits }).single('file');
}

module.exports = uploadMiddleware;
