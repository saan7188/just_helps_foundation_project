const mongoose = require('mongoose');
const Cause = require('../models/Cause');

const getDateSort = { createdAt: -1 };

exports.getCauses = async (req, res) => {
  try {
    const causes = await Cause.find({ isVerified: true }).sort(getDateSort);
    res.json(causes);
  } catch (error) {
    console.error('Get causes error:', error);
    res.status(500).json({ msg: 'Unable to load campaigns' });
  }
};

exports.getUrgentCause = async (req, res) => {
  try {
    const cause = await Cause.findOne({ isVerified: true }).sort({ deadline: 1, createdAt: -1 });
    res.json(cause || null);
  } catch (error) {
    console.error('Get urgent cause error:', error);
    res.status(500).json({ msg: 'Unable to load campaign' });
  }
};

exports.getAllCausesAdmin = async (req, res) => {
  try {
    const causes = await Cause.find().sort(getDateSort);
    res.json(causes);
  } catch (error) {
    console.error('Admin causes error:', error);
    res.status(500).json({ msg: 'Unable to load campaigns' });
  }
};

exports.getCauseById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid campaign ID' });
  }

  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Campaign not found' });
    res.json(cause);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ msg: 'Unable to load campaign' });
  }
};

exports.createCause = async (req, res) => {
  const { title, subtitle, description, category, target } = req.body;

  if (!title?.trim() || !subtitle?.trim() || !description?.trim()) {
    return res.status(400).json({ msg: 'Title, subtitle and description are required' });
  }

  const targetAmount = Number(target || req.body.goalAmount);
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return res.status(400).json({ msg: 'A valid target amount is required' });
  }

  if (!req.file && !req.body.image) {
    return res.status(400).json({ msg: 'Campaign image is required' });
  }

  try {
    const cause = await Cause.create({
      createdBy: req.user.id,
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      category: category?.trim() || 'General',
      target: targetAmount,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
      isVerified: false
    });

    res.status(201).json(cause);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ msg: 'Unable to create campaign' });
  }
};

exports.updateCause = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid campaign ID' });
  }

  const allowedFields = ['title', 'subtitle', 'description', 'category', 'target', 'isVerified', 'isEssential', 'costText', 'deadline', 'order'];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  }

  if (req.file) updateData.image = `/uploads/${req.file.filename}`;

  if (updateData.target !== undefined) {
    const targetAmount = Number(updateData.target);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({ msg: 'Invalid target amount' });
    }
    updateData.target = targetAmount;
  }

  try {
    const cause = await Cause.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!cause) return res.status(404).json({ msg: 'Campaign not found' });
    res.json(cause);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ msg: 'Unable to update campaign' });
  }
};

exports.deleteCause = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid campaign ID' });
  }

  try {
    const cause = await Cause.findByIdAndDelete(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Campaign not found' });
    res.json({ msg: 'Campaign deleted' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ msg: 'Unable to delete campaign' });
  }
};
