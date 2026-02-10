const express = require('express');
const cors = require('cors');

const db = require('./config/db');

// routes
const authRoutes = require('./routes/auth.route');
const adminAuthRoutes = require('./routes/admin.auth.route');
const carRoutes = require('./routes/car.route');
const bookingRoutes = require('./routes/booking.route');
const paymentRoutes = require('./routes/payment.route');

// middleware
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// CORS config untuk development
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://10.212.74.152:5173',  // Backend IP
    'http://10.212.74.152:3000',
    'http://10.212.74.191:5173',  // Frontend IP  BARU
    'http://10.212.74.191:3000',
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);        // user login
app.use('/api/admin', adminAuthRoutes);  // admin login
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

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
