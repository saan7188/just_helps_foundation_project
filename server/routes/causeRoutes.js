const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Middleware
const auth = require('../middleware/authMiddleware'); 
const admin = require('../middleware/adminMiddleware');

// Controller
const campaignController = require('../controllers/campaignController');

// --- MULTER SETUP (Image Uploads) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists in your root!
  },
  filename: function (req, file, cb) {
    // Saves as: image-123456789.jpg
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ==================================================
// 1. SPECIFIC ROUTES (Order Matters!)
// ==================================================

// @route   GET /api/causes/urgent
// @desc    Home Page Urgent Popup
router.get('/urgent', campaignController.getUrgentCampaign);

// @route   GET /api/causes/mine
// @desc    User Dashboard (MISSING IN YOUR CODE - ADDED HERE)
router.get('/mine', auth, campaignController.getMyCampaigns);

// @route   GET /api/causes/admin/all
// @desc    Admin Dashboard (Fetches everything)
router.get('/admin/all', auth, admin, campaignController.getAllCampaignsAdmin);

// ==================================================
// 2. GENERAL ROUTES
// ==================================================

// @route   GET /api/causes
// @desc    Public Feed (Verified Only)
router.get('/', campaignController.getCampaigns);

// @route   POST /api/causes
// @desc    Create Campaign (Now with Image Upload)
router.post('/', auth, upload.single('image'), campaignController.createCampaign);

// ==================================================
// 3. DYNAMIC ID ROUTES
// ==================================================

// @route   GET /api/causes/:id
// @desc    Donate Page
router.get('/:id', campaignController.getCampaignById);

// @route   PUT /api/causes/:id
// @desc    Update/Approve (Now with Image Upload)
router.put('/:id', auth, admin, upload.single('image'), campaignController.updateCampaign);

// @route   DELETE /api/causes/:id
// @desc    Delete Campaign
router.delete('/:id', auth, admin, campaignController.deleteCampaign);

module.exports = router;
