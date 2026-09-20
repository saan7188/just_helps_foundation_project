const mongoose = require('mongoose');
const path = require('path');
const Cause = require('../models/Cause');

const getDateSort = { createdAt: -1 };
const publicStatusFilter = {
  isVerified: true,
  $or: [{ status: 'approved' }, { status: { $exists: false } }]
};

const escapeRegex = value => String(value).replace(/[.*+?^$\${}()|[\]\\]/g, '\\$&');

exports.getCauses = async (req, res) => {
  try {
    const filter = { ...publicStatusFilter };
    if (req.query.category) {
      const category = String(req.query.category).trim();
      if (category) filter.category = new RegExp(escapeRegex(category), 'i');
    }
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
      ...publicStatusFilter,
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
    const cause = await Cause.findOne({ _id: req.params.id, ...publicStatusFilter });
    if (!cause) return res.status(404).json({ msg: 'Campaign not found' });
    res.json(cause);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ msg: 'Unable to load campaign' });
  }
};

exports.getProofFile = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid campaign ID' });
  }

  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0) {
    return res.status(400).json({ msg: 'Invalid proof document' });
  }

  try {
    const cause = await Cause.findById(req.params.id).select('proofFiles');
    if (!cause || !cause.proofFiles[index]) {
      return res.status(404).json({ msg: 'Proof document not found' });
    }

    const reference = String(cause.proofFiles[index]);
    const filename = path.basename(reference);
    const proofPath = path.join(__dirname, '..', 'private_uploads', filename);

    if (!proofPath.startsWith(path.join(__dirname, '..', 'private_uploads') + path.sep)) {
      return res.status(400).json({ msg: 'Invalid proof document' });
    }

    return res.sendFile(proofPath, error => {
      if (error && !res.headersSent) {
        res.status(error.statusCode === 404 ? 404 : 500).json({
          msg: error.statusCode === 404 ? 'Proof document not found' : 'Unable to open proof document'
        });
      }
    });
  } catch (error) {
    console.error('Proof document error:', error);
    res.status(500).json({ msg: 'Unable to open proof document' });
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
      image: '/uploads/' + req.files.image[0].filename,
      proofFiles: (req.files.proof || []).map(file => file.filename),
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

  if (req.files?.image?.[0]) updateData.image = '/uploads/' + req.files.image[0].filename;
  if (req.files?.proof?.length) updateData.proofFiles = req.files.proof.map(file => file.filename);

  if (updateData.title !== undefined && !String(updateData.title).trim()) {
    return res.status(400).json({ msg: 'Campaign title cannot be empty' });
  }
  if (updateData.subtitle !== undefined && !String(updateData.subtitle).trim()) {
    return res.status(400).json({ msg: 'Campaign subtitle cannot be empty' });
  }
  if (updateData.description !== undefined && !String(updateData.description).trim()) {
    return res.status(400).json({ msg: 'Campaign story cannot be empty' });
  }

  if (updateData.target !== undefined) {
    const targetAmount = Number(updateData.target);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({ msg: 'Invalid target amount' });
    }
    updateData.target = targetAmount;
  }

  if (updateData.deadline !== undefined) {
    const deadline = new Date(updateData.deadline);
    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({ msg: 'Invalid deadline' });
    }
    if (updateData.status === 'approved' || updateData.isVerified === true) {
      if (deadline <= new Date()) {
        return res.status(400).json({ msg: 'A published campaign needs a future deadline' });
      }
    }
    updateData.deadline = deadline;
  }

  if (updateData.isVerified === true || updateData.status === 'approved') {
    updateData.status = 'approved';
    updateData.isVerified = true;
    updateData.reviewedAt = new Date();
  } else if (updateData.isVerified === false && updateData.status === undefined) {
    updateData.status = 'paused';
    updateData.reviewedAt = new Date();
  }

  try {
    const cause = await Cause.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
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
