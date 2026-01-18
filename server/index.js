require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');
const path = require('path');


// --- SECURITY PACKAGES ---

const rateLimit = require('express-rate-limit');
const { approveCampaign } = require('./controllers/campaignController');

const app = express();
app.set('trust proxy',1);
// 1. HELMET (FIXED: Allow images to load on frontend)


// 2. BODY PARSER
app.use(express.json({ limit: '10kb' }));

// 3. CORS
app.use(cors({
  origin: process.env.CLIENT_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 4. RATE LIMITING
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100,
  message: "Too many requests, please try again later."
});
app.use('/api', limiter);

// 5. STATIC FILES (Images)
// Make sure you have an 'uploads' folder in your server directory!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. LOGGING
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});

// Connect Database
connectDB();

// Test Route
app.get('/', (req, res) => res.send('API Running 🚀'));

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/causes', require('./routes/causeRoutes'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/site',require('./routes/site'))
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));