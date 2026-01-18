const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const causeController = require('../controllers/causeController');

// Multer Setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. Specific Paths (MUST come first)
router.get('/urgent', causeController.getUrgentCause);
router.get('/admin/all', auth, admin, causeController.getAllCausesAdmin);

// 2. General Public Paths
router.get('/', causeController.getCauses);

// 3. Protected Actions
router.post('/', auth, admin, upload.single('image'), causeController.createCause);

// 4. ID-based Paths
router.get('/:id', causeController.getCauseById);
router.put('/:id', auth, admin, upload.single('image'), causeController.updateCause);
router.delete('/:id', auth, admin, causeController.deleteCause);

module.exports = router;
