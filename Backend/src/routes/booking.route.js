const express = require('express');
const router = express.Router();
const booking = require('../controllers/booking.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// User routes
router.post('/', auth, booking.createBooking);
router.get('/my-bookings', auth, booking.getMyBookings);
router.delete('/:id/cancel', auth, booking.cancelBooking);

// Admin routes
router.get('/', auth, isAdmin, booking.getAllBookings);
router.get('/:id', auth, booking.getBookingById);
router.put('/:id/status', auth, isAdmin, booking.updateBookingStatus);

module.exports = router;
