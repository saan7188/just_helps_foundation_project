const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donorName: { type: String, required: true, trim: true },
  donorEmail: { type: String, required: true, trim: true, lowercase: true },
  amount: { type: Number, required: true, min: 1 },
  tipAmount: { type: Number, default: 0, min: 0 },
  totalPaid: { type: Number, required: true, min: 1 },
  cause: { type: String, required: true },
  causeTitle: { type: String },
  category: { type: String, default: 'General' },
  isAnonymous: { type: Boolean, default: false },
  dedication: { type: String, default: '' },
  transactionId: { type: String, unique: true, sparse: true },
  paymentStatus: {
    type: String,
    enum: ['success', 'cancelled', 'failed'],
    default: 'success'
  },
  paymentMethod: { type: String, default: 'demo' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('donation', DonationSchema);
