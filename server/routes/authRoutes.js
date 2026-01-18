const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Ensure you use bcryptjs or bcrypt consistently
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Middleware
const auth = require('../middleware/authMiddleware'); // Ensure this file exists
const admin = require('../middleware/adminMiddleware'); // Ensure this file exists

// Models
const User = require('../models/User');
const Otp = require('../models/Otp');

// Utils
const sendEmail = require('../utils/sendEmail');

// ==========================================
// 1. OTP ROUTES
// ==========================================

// @route   POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { email, type } = req.body; 
  if (!email) return res.status(400).json({ msg: 'Email is required.' });

  try {
    const user = await User.findOne({ email });

    if (type === 'REGISTER' && user) return res.status(400).json({ msg: 'User already exists. Please Login.' });
    if (type === 'LOGIN' && !user) return res.status(400).json({ msg: 'No account found. Please Register.' });

    // Generate & Save OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.deleteMany({ email }); 
    const newOtp = new Otp({ email, otp: otpCode });
    await newOtp.save();

    // Send Email via Brevo
    const emailSent = await sendEmail(email, "Your Verification Code", `Your OTP Code is: <b>${otpCode}</b>`);
    if (!emailSent) return res.status(500).json({ msg: "Failed to send email." });

    res.json({ msg: `OTP sent to ${email}` });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login-with-otp
router.post('/login-with-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ msg: 'Invalid or Expired OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    await Otp.deleteMany({ email });

    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, isAdmin: user.isAdmin });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. STANDARD AUTH ROUTES
// ==========================================

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, isAdmin: user.isAdmin });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, isAdmin: user.isAdmin });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ==========================================
// 3. PASSWORD RESET ROUTES (Restored!)
// ==========================================

// @route   POST /api/auth/forgotpassword
router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Min
    await user.save();

    // Link points to Vercel Frontend
    const resetUrl = `https://just-helps-foundation-project.vercel.app/reset-password/${resetToken}`;
    
    await sendEmail(email, "Password Reset Request", `Click here to reset password: <a href="${resetUrl}">${resetUrl}</a>`);
    
    res.status(200).json({ msg: 'Email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Email could not be sent' });
  }
});

// @route   PUT /api/auth/resetpassword/:token
router.put('/resetpassword/:token', async (req, res) => {
  const { password } = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ msg: 'Invalid or Expired Token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password Updated Success' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ==========================================
// 4. ADMIN USER MANAGEMENT
// ==========================================

router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ date: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User Deleted Successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
