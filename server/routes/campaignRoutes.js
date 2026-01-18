const express = require('express');
const router = express.Router();

// Middleware (Matches your auth.js setup)
const auth = require('../middleware/authMiddleware'); 
const admin = require('../middleware/adminMiddleware');

// Controller
const campaignController = require('../controllers/campaignController');

// ==================================================
// 1. SPECIFIC ROUTES (MUST be defined first!)
// ==================================================

// @route   GET /api/causes/urgent
// @desc    Get the most urgent campaign for Home Popup
// @access  Public
router.get('/urgent', campaignController.getUrgentCampaign);

// @route   GET /api/causes/mine
// @desc    Get logged-in user's campaigns
// @access  Private (User)
router.get('/mine', auth, campaignController.getMyCampaigns);

// @route   GET /api/causes/admin/all
// @desc    Get ALL campaigns (Active, Pending, Rejected)
// @access  Private (Admin Only)
router.get('/admin/all', auth, admin, campaignController.getAllCampaignsAdmin);

// ==================================================
// 2. GENERAL ROUTES
// ==================================================

// @route   GET /api/causes
// @desc    Get all ACTIVE/VERIFIED campaigns (Public)
// @access  Public
router.get('/', campaignController.getCampaigns);

// @route   POST /api/causes
// @desc    Create a new campaign
// @access  Private (User)
router.post('/', auth, campaignController.createCampaign);

// ==================================================
// 3. DYNAMIC ID ROUTES (MUST be defined last!)
// ==================================================

// @route   GET /api/causes/:id
// @desc    Get single campaign details (Donate Page)
// @access  Public
router.get('/:id', campaignController.getCampaignById);

// @route   PUT /api/causes/:id
// @desc    Update/Approve a campaign
// @access  Private (Admin Only)
router.put('/:id', auth, admin, campaignController.updateCampaign);

// @route   DELETE /api/causes/:id
// @desc    Delete a campaign
// @access  Private (Admin Only)
router.delete('/:id', auth, admin, campaignController.deleteCampaign);

module.exports = router;
