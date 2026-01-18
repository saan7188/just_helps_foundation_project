const Cause = require('../models/Cause');

// GET ALL (Public)
exports.getCauses = async (req, res) => {
  try {
    // Fetch 'core' needs AND 'verified' campaigns
    const causes = await Cause.find({
      $or: [
        { type: 'core' },
        { type: 'campaign', isVerified: true } // Only show verified campaigns
      ]
    });
    res.json(causes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// CREATE CAMPAIGN (Protected)
exports.createCampaign = async (req, res) => {
  const { title, subtitle, category, targetAmount, image } = req.body;
  try {
    const newCampaign = new Cause({
      title,
      subtitle,
      category,
      targetAmount,
      image,
      type: 'campaign',
      isVerified: false, // Must be approved by admin
      creator: req.user.id
    });

    const cause = await newCampaign.save();
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};