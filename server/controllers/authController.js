const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module
const nodemailer = require('nodemailer');

// 1. REGISTER (With Validation)
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // A. PASSWORD VALIDATION
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    // B. EMAIL UNIQUE CHECK
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'This email is already registered.' });
    }

    // C. CREATE USER
    user = new User({ name, email, password });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    // D. LOGIN IMMEDIATELY
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. LOGIN (Standard)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// 3. FORGOT PASSWORD (Send Email)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email not found' });

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // Create Reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const message = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;

    await transporter.sendMail({
      from: '"Just Helps Security" <no-reply@justhelps.org>',
      to: email,
      subject: 'Password Reset Token',
      html: message
    });

    res.status(200).json({ msg: 'Email sent' });

  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ msg: 'Email could not be sent' });
  }
};

// 4. RESET PASSWORD (Verify Token & Update)
exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ msg: 'Invalid or Expired Token' });

    // Update Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear Token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ msg: 'Password Updated Success' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};