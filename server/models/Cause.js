const mongoose = require('mongoose');

const CauseSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, default: 'General', trim: true },
  image: { type: String, required: true },

  isVerified: { type: Boolean, default: false },
  isEssential: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'more_info', 'paused', 'completed'],
    default: 'pending'
  },
  verificationNote: { type: String, default: '' },
  reviewedAt: { type: Date },
  proofFiles: [{ type: String }],

  target: { type: Number, required: true },
  collected: { type: Number, default: 0 },
  costText: { type: String },
  deadline: { type: Date },
  order: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cause', CauseSchema);
