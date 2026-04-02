const express = require('express');
const router = express.Router();
const booking = require('../controllers/booking.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');

// Guest route (tanpa auth)
router.post('/guest', validate(schemas.createBooking), booking.createGuestBooking);

// Availability check routes (public - no auth required)
router.get('/check-availability/:mobil_id', booking.checkAvailability);
router.get('/blocked-dates/:mobil_id', booking.getBlockedDates);
router.get('/available-cars', booking.getAvailableCars);

// User routes
router.post('/', auth, validate(schemas.createBooking), booking.createBooking);
router.get('/my-bookings', auth, booking.getMyBookings);
router.delete('/:id/cancel', auth, booking.cancelBooking);

// Admin routes
router.get('/', auth, isAdmin, booking.getAllBookings);
router.get('/search/:order_number', booking.searchBookingByOrderNumber); // Search by order number (public)
router.get('/:id', auth, booking.getBookingById);
router.put('/:id/status', auth, isAdmin, booking.updateBookingStatus);

module.exports = router;
