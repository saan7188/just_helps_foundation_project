const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const causeController = require('../controllers/causeController');

// Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
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
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
    }

    cb(null, true);
  }
});

// --- ROUTES ---

// Specific paths
router.get('/urgent', causeController.getUrgentCause);
router.get('/admin/all', auth, admin, causeController.getAllCausesAdmin);

// Public paths
router.get('/', causeController.getCauses);

// Protected actions
// Any signed-in user can submit a campaign. New campaigns stay pending until admin approval.
router.post('/', auth, upload.single('image'), causeController.createCause);

// ID-based paths
router.get('/:id', causeController.getCauseById);
router.put('/:id', auth, admin, upload.single('image'), causeController.updateCause);
router.delete('/:id', auth, admin, causeController.deleteCause);

module.exports = router;
