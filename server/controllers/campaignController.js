const Campaign = require('../models/Campaign');

// 1. GET PUBLIC CAMPAIGNS (Home Page)
// Only returns Active/Verified campaigns to the public
exports.getCampaigns = async (req, res) => {
  try {
    // Fix: We only show 'active' campaigns to the public
    // You can add ?category=Medical filtering here if needed
    const campaigns = await Campaign.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. GET ADMIN CAMPAIGNS (Admin Dashboard)
// Returns EVERYTHING (Pending, Active, Rejected)
exports.getAllCampaignsAdmin = async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. GET URGENT CAMPAIGN (Home Popup)
// Finds the campaign ending soonest
exports.getUrgentCampaign = async (req, res) => {
  try {
    const urgent = await Campaign.findOne({ 
      status: 'active', 
      isEssential: false, // Don't show essentials (like rice/food) as urgent popup
      deadline: { $gt: new Date() } 
    }).sort({ deadline: 1 }); // Sort by closest deadline

    res.json(urgent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. GET SINGLE CAMPAIGN (Donate Page)
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Not Found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. GET MY CAMPAIGNS (Fundraiser Dashboard)
exports.getMyCampaigns = async (req, res) => {
  try {
    // Assumes auth middleware adds req.user
    const campaigns = await Campaign.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. CREATE CAMPAIGN
exports.createCampaign = async (req, res) => {
  try {
    // If file upload middleware (Multer) was used
    let imagePath = '';
    if (req.file) {
      // If using Cloudinary/Render disk
      imagePath = req.file.path || req.file.location; 
    } else {
        // Fallback or use the string URL if sent as text
        imagePath = req.body.image; 
    }

    const newCampaign = new Campaign({
      ...req.body,
      image: imagePath,
      createdBy: req.user ? req.user.id : null, // Link to user if logged in
      status: 'pending', // Always pending until Admin approves
      isVerified: false,
      collected: 0
    });

    const saved = await newCampaign.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create campaign." });
  }
};

// 7. UPDATE CAMPAIGN (Admin Edit)
exports.updateCampaign = async (req, res) => {
  try {
    const updated = await Campaign.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Return the updated doc
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed." });
  }
};

// 8. DELETE CAMPAIGN (Admin)
exports.deleteCampaign = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: "Campaign deleted." });
  } catch (err) {
    res.status(500).json({ message: "Delete failed." });
  }
};
