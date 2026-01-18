const Campaign = require('../models/Campaign');

// 1. GET CAMPAIGNS (Filter logic)
exports.getCampaigns = async (req, res) => {
  const statusFilter = req.query.status;
  let query = { status: 'active' };
  
  if (statusFilter === 'pending') query = { status: 'pending' };
  
  try {
    const campaigns = await Campaign.find({});
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. CREATE CAMPAIGN
exports.createCampaign = async (req, res) => {
  try {
    const newCampaign = new Campaign({ ...req.body, status: 'pending' });
    const saved = await newCampaign.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Failed to create." });
  }
};

// 3. APPROVE CAMPAIGN (Admin Only)
exports.approveCampaign = async (req, res) => {
  try {
    await Campaign.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.json({ message: "Campaign LIVE." });
  } catch (err) {
    res.status(500).json({ message: "Failed." });
  }
};