const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Middleware
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Models
const User = require('../models/User');
const Otp = require('../models/Otp');

// Utils
const sendEmail = require('../utils/sendEmail');

// ==========================================
// 1. OTP ROUTES
// ==========================================

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { msg: 'Too many OTP requests. Please try again in a few minutes.' }
});

// @route   POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const type = String(req.body.type || '').toUpperCase();

  if (!email) return res.status(400).json({ msg: 'Email is required.' });

  try {
    const user = await User.findOne({ email });

    if (type === 'REGISTER' && user) {
      return res.status(400).json({ msg: 'User already exists. Please Login.' });
    }

    if (type === 'LOGIN' && !user) {
      return res.status(400).json({ msg: 'No account found. Please Register.' });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    await Otp.deleteMany({ email });
    await new Otp({ email, otp: otpCode }).save();

    const emailSent = await sendEmail(
      email,
      'Your Verification Code',
      `Your OTP Code is: <b>${otpCode}</b>`
    );

    if (!emailSent) {
      await Otp.deleteMany({ email });
      return res.status(500).json({ msg: 'Failed to send email.' });
    }

    res.json({ msg: `OTP sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST /api/auth/verify-otp
// Used by registration to verify the code before asking for account details.
router.post('/verify-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();

  if (!email || !/^\d{4}$/.test(otp)) {
    return res.status(400).json({ msg: 'Enter a valid 4-digit OTP.' });
  }

  try {
    const validOtp = await Otp.findOne({ email, otp });

    if (!validOtp) {
      return res.status(400).json({ msg: 'Invalid or Expired OTP.' });
    }

    const verificationToken = jwt.sign(
      { email, purpose: 'registration' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ verified: true, verificationToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST /api/auth/login-with-otp
router.post('/login-with-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();

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
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const verificationToken = String(req.body.verificationToken || '');

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ msg: 'Name must be between 2 and 80 characters.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ msg: 'Enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
  }

  if (!verificationToken) {
    return res.status(400).json({ msg: 'Please verify your email first.' });
  }

  try {
    let verification;
    try {
      verification = jwt.verify(verificationToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ msg: 'Email verification has expired. Please verify again.' });
    }

    if (
      verification.purpose !== 'registration' ||
      verification.email !== email
    ) {
      return res.status(400).json({ msg: 'Invalid email verification.' });
    }

    // Consume the OTP during registration so it cannot be reused.
    const validOtp = await Otp.findOne({ email });
    if (!validOtp) {
      return res.status(400).json({ msg: 'Verification expired. Please request a new OTP.' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists. Please Login.' });

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
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

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  try {
    const user = await User.findOne({ email });
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
// 3. PASSWORD RESET ROUTES
// ==========================================

// @route   POST /api/auth/forgotpassword
router.post('/forgotpassword', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `https://just-helps-foundation-project.vercel.app/reset-password/${resetToken}`;

    await sendEmail(
      email,
      'Password Reset Request',
      `Click here to reset password: <a href="${resetUrl}">${resetUrl}</a>`
    );

    res.status(200).json({ msg: 'Email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Email could not be sent' });
  }
});

// @route   PUT /api/auth/resetpassword/:token
router.put('/resetpassword/:token', async (req, res) => {
  const password = String(req.body.password || '');
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
  }

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

    res.status(200).json({ msg: 'Password Updated Successfully' });
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
