const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const Cause = require('../models/Cause');
const multer = require('multer');
const path = require('path');

// --- MULTER STORAGE SETUP (For Image Uploads) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generates unique filename: "fieldname-timestamp.jpg"
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ==============================================
// 1. PUBLIC ROUTES (For Home Page)
// ==============================================

// GET ALL VERIFIED (Sorted by Order ID: 1, 2, 3...)
router.get('/', async (req, res) => {
  try {
    const causes = await Cause.find({ isVerified: true }).sort({ order: 1, createdAt: -1 });
    res.json(causes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET URGENT (Ending in 48 Hours)
router.get('/urgent', async (req, res) => {
  try {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    
    const urgentCause = await Cause.findOne({
      isVerified: true,
      deadline: { $gt: now, $lte: fortyEightHoursFromNow }
    }).sort({ deadline: 1 });
    
    res.json(urgentCause);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET SINGLE CAUSE (By ID)
router.get('/:id', async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Cause not found' });
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ==============================================
// 2. ADMIN ROUTES (Protected)
// ==============================================

// GET ALL CAUSES (For Admin Dashboard)
// *** CRITICAL FIX APPLIED HERE ***
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    // REMOVED .populate('user') to prevent 500 Crash
    const causes = await Cause.find().sort({ order: 1, createdAt: -1 });
    res.json(causes);
  } catch (err) {
    console.error("Admin Route Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// VERIFY A CAUSE (Approve Pending)
router.put('/verify/:id', auth, admin, async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Cause not found' });

    cause.isVerified = true;
    await cause.save();
    res.json(cause);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// CREATE NEW CAUSE (With Image)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, category, target, deadline, isEssential, costText, order } = req.body;
    
    // Validate Image
    if (!req.file) return res.status(400).json({ msg: 'Please upload an image' });

    const newCause = new Cause({
      user: req.user.id, // Links to the admin who created it
      title,
      subtitle,
      category,
      
      // Image URL construction
      image: `http://https://just-helps-foundation-project.vercel.app/uploads/${req.file.filename}`,
      
      // Data Type Handling
      isEssential: isEssential === 'true', // Converts string "true" to boolean
      isVerified: true, // Admins are automatically verified
      costText: costText || '',
      target: target || 0,
      deadline: deadline || null,
      order: order ? parseInt(order) : 100 // Defaults to 100 if empty
    });

    const cause = await newCause.save();
    res.json(cause);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// UPDATE EXISTING CAUSE
router.put('/:id', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, category, target, deadline, isEssential, costText, order } = req.body;
    
    let cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ msg: 'Cause not found' });

    // Update Text Fields
    if (title) cause.title = title;
    if (subtitle) cause.subtitle = subtitle;
    if (category) cause.category = category;
    if (costText) cause.costText = costText;
    if (target) cause.target = target;
    if (deadline) cause.deadline = deadline;
    if (order) cause.order = parseInt(order);
    
    // Boolean Handling
    if (isEssential !== undefined) {
        cause.isEssential = isEssential === 'true';
    }

    // Update Image ONLY if a new file is sent
    if (req.file) {
      cause.image = `http://https://just-helps-foundation-project.vercel.app/uploads/${req.file.filename}`;
    }

    await cause.save();
    res.json(cause);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE CAUSE
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    await Cause.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Cause deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;