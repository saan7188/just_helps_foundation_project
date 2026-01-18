const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // 🔐 CRITICAL: Determines if user can see Admin Dashboard
  isAdmin: { type: Boolean, default: false },
  
  // For Password Reset functionality
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
