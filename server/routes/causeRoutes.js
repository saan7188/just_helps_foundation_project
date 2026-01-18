const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const causeController = require('../controllers/causeController');

// Multer Config for Images
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ADMIN FUNCTIONS
router.get('/admin/all', auth, admin, causeController.getAllCausesAdmin);
router.post('/', auth, admin, upload.single('image'), causeController.createCause);
router.put('/:id', auth, admin, upload.single('image'), causeController.updateCause);
router.delete('/:id', auth, admin, causeController.deleteCause);

// PUBLIC FUNCTIONS
router.get('/', causeController.getCauses); 
router.get('/:id', causeController.getCauseById);

module.exports = router;
