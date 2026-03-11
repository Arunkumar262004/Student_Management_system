const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

// Make sure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Save file with a unique name
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const validExt     = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const validMime    = allowedTypes.test(file.mimetype);

  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
  }
};

const uploadPhoto = multer({
  storage:  storage,
  limits:   { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: fileFilter,
});

module.exports = uploadPhoto;