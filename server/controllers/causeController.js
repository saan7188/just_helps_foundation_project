const mongoose = require('mongoose');
const Cause = require('../models/Cause');

const getDateSort = { createdAt: -1 };

exports.getCauses = async (req, res) => {
  try {
    const filter = { isVerified: true, status: { $in: ['approved'] } };
    if (req.query.category) { const category = String(req.query.category).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\if (req.query.category) filter.category = new RegExp(`^${String(req.query.category).trim()}$ `, 'i');'); filter.category = new RegExp(`^${category}const mongoose = require('mongoose');
const Cause = require('../models/Cause');

const getDateSort = { createdAt: -1 };

exports.getCauses = async (req, res) => {
  try {
    const filter = { isVerified: true, status: { $in: ['approved'] } };
    , 'i'); }
    const causes = await Cause.find(filter).sort({ isUrgent: -1, deadline: 1, order: 1, createdAt: -1 });
    res.json(causes);
  } catch (error) {
    console.error('Get causes error:', error);
    res.status(500).json({ msg: 'Unable to load campaigns' });
  }
};

exports.getUrgentCause = async (req, res) => {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const cause = await Cause.findOne({
      isVerified: true,
      status: 'approved',
      deadline: { $gt: now, $lte: soon }
    }).sort({ isUrgent: -1, deadline: 1, createdAt: -1 });
    res.json(cause || null);
  } catch (error) {
    console.error('Get urgent cause error:', error);
    res.status(500).json({ msg: 'Unable to load campaign' });
  }
};

exports.getAllCausesAdmin = async (req, res) => {
  try {
    const causes = await Cause.find().populate('createdBy', 'name email').sort(getDateSort);
    res.json(causes);
  } catch (error) {
    console.error('Admin causes error:', error);
    res.status(500).json({ msg: 'Unable to load campaigns' });
  }
};

exports.getMyCauses = async (req, res) => {
  try {
    const causes = await Cause.find({ createdBy: req.user.id }).sort(getDateSort);
    res.json(causes);
  } catch (error) {
    console.error('My campaigns error:', error);
    res.status(500).json({ msg: 'Unable to load your campaigns' });
  }
};

exports.getCauseById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid campaign ID' });
  }

  try {
    const cause = await Cause.findOne({
      _id: req.params.id,
      isVerified: true,
      status: 'approved'
    });

    if (!cause) return res.status(404).json({ msg: 'Campaign not found' });
    res.json(cause);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ msg: 'Unable to load campaign' });
  }
};

exports.createCause = async (req, res) => {
  const { title, subtitle, description, category, target, deadline } = req.body;

  if (!title?.trim() || !subtitle?.trim() || !description?.trim()) {
    return res.status(400).json({ msg: 'Title, subtitle and description are required' });
  }

  const targetAmount = Number(target || req.body.goalAmount);
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return res.status(400).json({ msg: 'A valid target amount is required' });
  }

  if (!req.files?.image?.[0]) {
    return res.status(400).json({ msg: 'Campaign image is required' });
  }

  if (!deadline || Number.isNaN(new Date(deadline).getTime()) || new Date(deadline) <= new Date()) {
    return res.status(400).json({ msg: 'Choose a valid future deadline' });
  }

  try {
    const cause = await Cause.create({
      createdBy: req.user.id,
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      category: category?.trim() || 'General',
      target: targetAmount,
      deadline: new Date(deadline),
      image: `/uploads/${req.files.image[0].filename}`,
      proofFiles: (req.files.proof || []).map(file => `/uploads/${file.filename}`),
      isVerified: false,
      status: 'pending'
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

  const allowedFields = [
    'title', 'subtitle', 'description', 'category', 'target', 'isVerified',
    'isEssential', 'isUrgent', 'costText', 'deadline', 'order', 'status', 'verificationNote'
  ];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  }

  if (req.file) updateData.image = `/uploads/${req.file.filename}`;
  if (req.files?.image?.[0]) updateData.image = `/uploads/${req.files.image[0].filename}`;
  if (req.files?.proof?.length) {
    updateData.proofFiles = req.files.proof.map(file => `/uploads/${file.filename}`);
  }

  if (updateData.target !== undefined) {
    const targetAmount = Number(updateData.target);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({ msg: 'Invalid target amount' });
    }
    updateData.target = targetAmount;
  }

  if (updateData.deadline !== undefined && Number.isNaN(new Date(updateData.deadline).getTime())) {
    return res.status(400).json({ msg: 'Invalid deadline' });
  }

  if (updateData.isVerified === true) {
    updateData.status = 'approved';
    updateData.reviewedAt = new Date();
  } else if (updateData.isVerified === false && updateData.status === undefined) {
    updateData.status = 'paused';
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
