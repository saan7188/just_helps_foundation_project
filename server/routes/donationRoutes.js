const express = require('express');
const router = express.Router();
const { processDonation } = require('../controllers/donationController');

router.post('/pay', processDonation);

module.exports = router;