const mongoose = require('mongoose');

const CauseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String }, // Short description for card
  description: { type: String }, // Full story
  category: { type: String, required: true },
  target: { type: Number }, 
  
  // 🚨 CRITICAL FIX: Renamed 'collected' to 'raised'
  // This matches your Home.jsx and Payment.js logic
  raised: { type: Number, default: 0 }, 
  
  deadline: { type: Date },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  isVerified: { type: Boolean, default: false },
  
  // --- FIELDS FOR DAILY ESSENTIALS ---
  isEssential: { type: Boolean, default: false }, 
  costText: { type: String }, // e.g. "₹50 feeds 1 person"
  order: { type: Number, default: 1 }, // Added this (useful for sorting items in Admin)
  // -----------------------------------

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('cause', CauseSchema);