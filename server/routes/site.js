const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');

// ✅ FIX: Import middleware exactly like you did in campaignroutes.js
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// GET SETTINGS (Public - for Home Page)
router.get('/', async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
        // Create default if not exists
        config = new SiteConfig();
        await config.save();
    }
    res.json(config);
  } catch (err) { 
    console.error(err);
    res.status(500).send('Server Error'); 
  }
});

// UPDATE SETTINGS (Admin Only)
// ✅ FIX: Use 'auth' and 'admin' variables here
router.put('/', auth, admin, async (req, res) => {
  try {
    const { heroTitle, heroSubtitle, maintenanceMode, announcement } = req.body;
    let config = await SiteConfig.findOne();
    if (!config) config = new SiteConfig();

    config.heroTitle = heroTitle;
    config.heroSubtitle = heroSubtitle;
    config.maintenanceMode = maintenanceMode;
    config.announcement = announcement;

    await config.save();
    res.json(config);
  } catch (err) { 
    console.error(err);
    res.status(500).send('Server Error'); 
  }
});

module.exports = router;