require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); 
const connectDB = require('./db/db');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. TRUST PROXY (Required for Render)
app.set('trust proxy', 1);

// 2. HELMET (Security Headers)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 3. BODY PARSER
app.use(express.json({ limit: '10kb' }));

// 4. CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 5. RATE LIMITING
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100, 
  message: "Too many requests, please try again later."
});
app.use('/api', limiter);

// 6. STATIC FILES (Images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. LOGGING
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});

// Connect Database
connectDB();

app.get('/', (req, res) => res.send('Just Helps API is Running 🚀'));

// --- ROUTES ---
// ✅ UPDATED: Matching your filenames exactly
app.use('/api/auth', require('./routes/authRoutes'));   // Looks for authRoutes.js
app.use('/api/causes', require('./routes/causeRoutes')); // Looks for causeRoutes.js

// Keep these as is (unless you renamed them too)
app.use('/api/payment', require('./routes/payment'));
app.use('/api/site', require('./routes/site'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
