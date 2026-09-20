require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db/db');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust the first proxy hop on hosted deployments.
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Keep JSON requests small.
app.use(express.json({ limit: '10kb' }));

// Allow the deployed frontend when CLIENT_URL is configured.
// A wildcard is used only for local setups where no client URL is provided.
const clientOrigin = process.env.CLIENT_URL;

app.use(cors({
  origin: clientOrigin || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: Boolean(clientOrigin)
}));

// Basic API rate limiting.
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests, please try again later.' }
});

app.use('/api', limiter);

// Uploaded campaign images are served as static files.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple request logging.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

connectDB();

app.get('/', (req, res) => res.send('Just Helps API is Running 🚀'));

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/causes', require('./routes/causeRoutes'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/site', require('./routes/site'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
