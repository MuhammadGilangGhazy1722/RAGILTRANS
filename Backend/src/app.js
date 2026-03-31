require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// middleware
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

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

// Initialize Passport
app.use(passport.initialize());

// Serve static files untuk uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);        // user login
app.use('/api/auth', oauthRoutes);       // oauth (google)
app.use('/api/admin', adminAuthRoutes);  // admin login
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);    // upload image
app.use('/api/analytics', analyticsRoutes); // analytics & reports (admin only)

// ===== HEALTH CHECK =====
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
