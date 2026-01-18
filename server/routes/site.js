const express = require('express');
const router = express.Router();
const Site = require('../models/Site');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// @route   GET /api/site
// @desc    Get Site Config (Public - used by App.jsx)
router.get('/', async (req, res) => {
  try {
    // Return the first config found, or create one if missing
    let site = await Site.findOne();
    if (!site) {
      site = new Site();
      await site.save();
    }
    res.json(site);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/site
// @desc    Update Site Config (Admin Only)
router.put('/', auth, admin, async (req, res) => {
  try {
    let site = await Site.findOne();
    if (!site) site = new Site();

    // Update fields
    if (req.body.heroTitle) site.heroTitle = req.body.heroTitle;
    if (req.body.heroSubtitle) site.heroSubtitle = req.body.heroSubtitle;
    if (req.body.announcement !== undefined) site.announcement = req.body.announcement;
    if (req.body.maintenanceMode !== undefined) site.maintenanceMode = req.body.maintenanceMode;

    await site.save();
    res.json(site);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
