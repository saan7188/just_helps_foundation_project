const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  
  // NEW: Distinguish between 'fund' (General) and 'campaign' (Specific)
  type: { 
    type: String, 
    enum: ['fund', 'campaign'], 
    default: 'campaign' 
  },

  // For Specific Campaigns (e.g., "Roof Repair")
  targetAmount: { type: Number }, // Optional for General Funds
  
  // For General Funds (e.g., "Food for Everyone")
  collectedAmount: { type: Number, default: 0 },
  
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);