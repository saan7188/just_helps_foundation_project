const express = require('express');
const router = express.Router();

// ✅ 1. Import the correct controller (paymentController)
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// ==========================================
// 1. DONATION ROUTES (Public)
// ==========================================

// @route   POST /api/payment/donate
// @desc    Process a donation & Send Email
// @access  Public
// ⚠️ MATCHES FRONTEND: axios.post(`${API_URL}/api/payment/donate`)
router.post('/donate', paymentController.processDonation);

// @route   POST /api/payment/cancel
// @desc    Log cancelled transaction
// ⚠️ MATCHES FRONTEND: axios.post(`${API_URL}/api/payment/cancel`)
router.post('/cancel', (req, res) => {
  // You can add logic here to log "Dropped Off" users
  res.json({ msg: "Transaction Cancelled" });
});

// ==========================================
// 2. ADMIN ROUTES (Protected)
// ==========================================

// @route   GET /api/payment/all
// @desc    Get Donation History for Admin Dashboard
// ⚠️ MATCHES ADMIN: axios.get(`${API_URL}/api/payment/all`)
router.get('/all', auth, admin, async (req, res) => {
    try {
        // You might need to create a Payment/Donation Model to fetch this data
        // For now, returning an empty array to prevent Admin crash
        res.json([]); 
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
