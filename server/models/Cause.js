const mongoose = require('mongoose');

const CauseSchema = new mongoose.Schema({
  // Link to the User/Admin who created it
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // --- BASIC INFO ---
  title: { type: String, required: true },
  subtitle: { type: String, required: true }, // Shown on Home Page cards
  description: { type: String, required: true }, // Full story on Donate Page
  category: { type: String, default: 'General' }, // Medical, Education, etc.
  image: { type: String, required: true },
  
  // --- FLAGS ---
  isVerified: { type: Boolean, default: false }, // Admin Approval
  isEssential: { type: Boolean, default: false }, // true = "Daily Essentials", false = "Fundraiser"
  
  // --- FINANCIALS ---
  target: { type: Number, required: true },     // Goal Amount
  collected: { type: Number, default: 0 },      // Amount Raised (Updated by Payment)
  
  // --- ESSENTIALS SPECIFIC ---
  costText: { type: String }, // e.g. "₹50 feeds 1 person" (Only for Essentials)
  
  // --- SORTING & URGENCY ---
  deadline: { type: Date }, // Used for "Urgent" popup
  order: { type: Number, default: 100 }, // Admin custom sort order
  
  createdAt: { type: Date, default: Date.now }
});

// Export as 'Cause' to match your controllers
module.exports = mongoose.model('Cause', CauseSchema);
