const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const causeController = require('../controllers/causeController');

// Multer setup
const uploadDirectory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
  }
});

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG and WebP images are allowed'));
    }

    cb(null, true);
  }
});

const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, error => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'Image must be 5 MB or smaller' });
    }

    return res.status(400).json({ msg: error.message || 'Invalid image upload' });
  });
};

// --- ROUTES ---

// Specific paths
router.get('/urgent', causeController.getUrgentCause);
router.get('/admin/all', auth, admin, causeController.getAllCausesAdmin);

// Public paths
router.get('/', causeController.getCauses);

// Protected actions
// Any signed-in user can submit a campaign. New campaigns stay pending until admin approval.
router.post('/', auth, uploadImage, causeController.createCause);

// ID-based paths
router.get('/:id', causeController.getCauseById);
router.put('/:id', auth, admin, uploadImage, causeController.updateCause);
router.delete('/:id', auth, admin, causeController.deleteCause);

module.exports = router;
