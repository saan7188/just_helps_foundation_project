const Cause = require('../models/Cause');

// 1. GET PUBLIC CAUSES (Home Page)
// Shows: All Essentials + Only VERIFIED Campaigns
exports.getCauses = async (req, res) => {
  try {
    const causes = await Cause.find({
      $or: [
        { isEssential: true },           // Always show essentials (Food/Medical)
        { isEssential: false, isVerified: true } // Only show Approved Fundraisers
      ]
    }).sort({ order: 1, createdAt: -1 }); // Respect "order" set by Admin
    
    res.json(causes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// 2. GET ADMIN ALL (Admin Dashboard)
// Shows: EVERYTHING (Pending, Rejected, Active, Essentials)
exports.getAllCausesAdmin = async (req, res) => {
  try {
    const causes = await Cause.find({}).sort({ createdAt: -1 });
    res.json(causes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 3. GET URGENT CAMPAIGN (Home Popup)
// Logic: Find verified fundraiser ending soonest
exports.getUrgentCause = async (req, res) => {
  try {
    const urgent = await Cause.findOne({
      isEssential: false,      // Must be a fundraiser
      isVerified: true,        // Must be active
      deadline: { $gt: new Date() } // Must not be expired
    }).sort({ deadline: 1 });  // Sort by closest date

    res.json(urgent);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 4. GET SINGLE CAUSE (Donate Page)
exports.getCauseById = async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Cause not found' });
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 5. GET MY CAMPAIGNS (User Dashboard)
exports.getMyCauses = async (req, res) => {
  try {
    // req.user.id comes from the 'auth' middleware
    const causes = await Cause.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(causes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 6. CREATE CAUSE (User or Admin)
exports.createCause = async (req, res) => {
  try {
    // Handle File Upload (If using Multer, file path is in req.file.path)
    // If sending base64 string or URL, it's in req.body.image
    let imagePath = req.body.image; 
    if (req.file) imagePath = req.file.path; // Adjust based on your upload setup

    const newCause = new Cause({
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      category: req.body.category,
      target: req.body.target,
      deadline: req.body.deadline,
      costText: req.body.costText, // For essentials
      isEssential: req.body.isEssential === 'true' || req.body.isEssential === true,
      
      // Admin Logic: If User creates it -> Pending. If Admin -> Verified immediately.
      isVerified: req.user.isAdmin ? true : false, 
      createdBy: req.user.id,
      image: imagePath,
      collected: 0
    });

    const cause = await newCause.save();
    res.json(cause);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// 7. UPDATE CAUSE (Admin Verify/Edit)
exports.updateCause = async (req, res) => {
  try {
    // Handle Image Update if new file uploaded
    let updateData = { ...req.body };
    if (req.file) updateData.image = req.file.path;

    const cause = await Cause.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true } // Return updated doc
    );
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 8. DELETE CAUSE (Admin)
exports.deleteCause = async (req, res) => {
  try {
    await Cause.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Cause deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
