const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Resolve to the SAME absolute path server.js uses for express.static('/uploads', ...)
// — this file also lives in src/config, so the relative path up matches exactly.
// A relative path here (e.g. './uploads') would instead resolve against
// process.cwd() at request time, which isn't guaranteed to be the same
// directory the static server reads from, and previously caused writes to
// fail outright with ENOENT if that directory didn't already exist.
const UPLOAD_DIR = process.env.UPLOAD_PATH
  ? path.resolve(process.env.UPLOAD_PATH)
  : path.join(__dirname, '../../uploads');

// Ensure the directory exists before multer ever tries to write into it —
// covers first deploy, a wiped uploads folder, or any environment where it
// simply hasn't been created yet.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

module.exports = upload;
