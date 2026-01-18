const Cause = require('../models/Cause');

// @desc    Get all verified causes for public home page
exports.getCauses = async (req, res) => {
  try {
    const causes = await Cause.find({ isVerified: true }).sort({ date: -1 });
    res.json(causes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get the single urgent/featured cause for the popup
exports.getUrgentCause = async (req, res) => {
  try {
    const cause = await Cause.findOne({ isVerified: true }).sort({ date: 1 });
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get all causes (Verified + Unverified) for Admin
exports.getAllCausesAdmin = async (req, res) => {
  try {
    const causes = await Cause.find().sort({ date: -1 });
    res.json(causes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get single cause by ID
exports.getCauseById = async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Cause not found' });
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Create new cause
exports.createCause = async (req, res) => {
  try {
    const newCause = new Cause({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
      isVerified: true 
    });
    const cause = await newCause.save();
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Update/Verify cause
exports.updateCause = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    
    const cause = await Cause.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Delete cause
exports.deleteCause = async (req, res) => {
  try {
    await Cause.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
