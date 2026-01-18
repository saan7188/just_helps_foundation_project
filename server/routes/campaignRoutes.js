const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public
router.get('/', campaignController.getCampaigns);
router.post('/', campaignController.createCampaign);

// Admin Only (Protected by Middleware)
router.put('/:id/approve', verifyToken, verifyAdmin, campaignController.approveCampaign);

module.exports = router;