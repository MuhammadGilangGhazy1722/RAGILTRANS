require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const passport = require('./config/passport');

const db = require('./config/db');

// routes
const authRoutes = require('./routes/auth.route');
const oauthRoutes = require('./routes/oauth.route');
const adminAuthRoutes = require('./routes/admin.auth.route');
const carRoutes = require('./routes/car.route');
const bookingRoutes = require('./routes/booking.route');
const paymentRoutes = require('./routes/payment.route');
const uploadRoutes = require('./routes/upload.route');
const analyticsRoutes = require('./routes/analytics.route');
const reviewRoutes = require('./routes/review.route');

// middleware
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Trust proxy for Railway
app.set('trust proxy', 1);

// CORS config - support multiple origins from environment variable
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== SECURITY MIDDLEWARE =====
// Helmet.js - Set security HTTP headers
app.use(helmet());

// Rate Limiting - Global (all requests)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Terlalu banyak request dari IP ini, coba lagi dalam 15 menit',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Rate Limiting - Stricter for auth endpoints (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Terlalu banyak login attempts, coba lagi dalam 15 menit',
  skipSuccessfulRequests: true, // don't count successful requests
  standardHeaders: true,
  legacyHeaders: false
});

// Initialize Passport
app.use(passport.initialize());

// Serve static files untuk uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====
app.use('/api/auth', authLimiter, authRoutes);        // user login (with rate limiting)
app.use('/api/auth', oauthRoutes);                    // oauth (google)
app.use('/api/admin', authLimiter, adminAuthRoutes); // admin login (with rate limiting)
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);    // upload image
app.use('/api/reviews', reviewRoutes);   // reviews & testimonials
app.use('/api/analytics', analyticsRoutes); // analytics & reports (admin only)

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      success: true,
      message: 'API & Database connected'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: err.message
    });
  }
});

// ===== ERROR HANDLER (PALING BAWAH) =====
app.use(errorHandler);

module.exports = app;
