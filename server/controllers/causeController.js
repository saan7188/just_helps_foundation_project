const Cause = require('../models/Cause');
const fs = require('fs');
const path = require('path');

// @desc    Get all causes for Admin (Verified + Unverified)
exports.getAllCausesAdmin = async (req, res) => {
  try {
    const causes = await Cause.find().sort({ date: -1 });
    res.json(causes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new cause/essential (Add function)
exports.createCause = async (req, res) => {
  try {
    const newCause = new Cause({
      ...req.body,
      // If image uploaded via multer, use that path, else use provided URL
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
      isVerified: true 
    });
    const cause = await newCause.save();
    res.json(cause);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a cause (Edit / Accept / Reject function)
exports.updateCause = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const cause = await Cause.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!cause) return res.status(404).json({ msg: 'Cause not found' });
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a cause
exports.deleteCause = async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Cause not found' });

    await cause.deleteOne();
    res.json({ msg: 'Removed successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
