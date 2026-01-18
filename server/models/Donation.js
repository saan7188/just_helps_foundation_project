const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  
  // MONEY FIELDS
  amount: { type: Number, required: true },       // Donation Amount
  tipAmount: { type: Number, default: 0 },        // Platform Tip
  totalPaid: { type: Number, required: true },    // Total (Amount + Tip)

  // CAUSE INFO (Changed to String to prevent "CastError")
  cause: { type: String, required: true }, 
  causeTitle: { type: String },

  // PRO FEATURES
  isAnonymous: { type: Boolean, default: false },
  dedication: { type: String, default: '' },
  
  // META DATA
  transactionId: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('donation', DonationSchema);