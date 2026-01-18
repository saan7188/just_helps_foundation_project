const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Middleware
const auth = require('../middleware/authMiddleware'); 
const admin = require('../middleware/adminMiddleware');

// ✅ FIXED IMPORT: Point to 'causeController', NOT 'campaignController'
const causeController = require('../controllers/causeController');

// --- MULTER SETUP (Image Uploads) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ==================================================
// 1. SPECIFIC ROUTES (Order Matters!)
// ==================================================

// @route   GET /api/causes/urgent
// @desc    Home Page Urgent Popup
router.get('/urgent', causeController.getUrgentCause);

// @route   GET /api/causes/mine
// @desc    User Dashboard
router.get('/mine', auth, causeController.getMyCauses);

// @route   GET /api/causes/admin/all
// @desc    Admin Dashboard (Fetches everything)
router.get('/admin/all', auth, admin, causeController.getAllCausesAdmin);

// ==================================================
// 2. GENERAL ROUTES
// ==================================================

// @route   GET /api/causes
// @desc    Public Feed (Verified Only)
router.get('/', causeController.getCauses);

// @route   POST /api/causes
// @desc    Create Campaign (Now with Image Upload)
router.post('/', auth, upload.single('image'), causeController.createCause);

// ==================================================
// 3. DYNAMIC ID ROUTES
// ==================================================

// @route   GET /api/causes/:id
// @desc    Donate Page
router.get('/:id', causeController.getCauseById);

// @route   PUT /api/causes/:id
// @desc    Update/Approve (Now with Image Upload)
router.put('/:id', auth, admin, upload.single('image'), causeController.updateCause);

// @route   DELETE /api/causes/:id
// @desc    Delete Campaign
router.delete('/:id', auth, admin, causeController.deleteCause);

module.exports = router;
