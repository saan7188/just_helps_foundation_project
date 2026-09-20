const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const causeController = require('../controllers/causeController');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
  }
});

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const proofTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    const allowed = file.fieldname === 'image' ? imageTypes : proofTypes;
    if (!allowed.has(file.mimetype)) {
      return cb(new Error(file.fieldname === 'image'
        ? 'Campaign image must be JPG, PNG or WebP'
        : 'Proof must be PDF, JPG, PNG or WebP'));
    }
    cb(null, true);
  }
});

const uploadCampaignFiles = (req, res, next) => {
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'proof', maxCount: 5 }
  ])(req, res, error => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'Each uploaded file must be 10 MB or smaller' });
    }

    return res.status(400).json({ msg: error.message || 'Invalid file upload' });
  });
};

router.get('/urgent', causeController.getUrgentCause);
router.get('/admin/all', auth, admin, causeController.getAllCausesAdmin);
router.get('/mine', auth, causeController.getMyCauses);
router.get('/', causeController.getCauses);

router.post('/', auth, uploadCampaignFiles, causeController.createCause);
router.get('/:id', causeController.getCauseById);
router.put('/:id', auth, admin, uploadCampaignFiles, causeController.updateCause);
router.delete('/:id', auth, admin, causeController.deleteCause);

module.exports = router;
