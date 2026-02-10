const express = require('express');
const router = express.Router();
const payment = require('../controllers/payment.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// User routes
router.post('/', auth, payment.createPayment);
router.get('/booking/:bookingId', auth, payment.getPaymentByBooking);

// Admin routes
router.get('/', auth, isAdmin, payment.getAllPayments);
router.get('/:id', auth, isAdmin, payment.getPaymentById);
router.put('/:id/status', auth, isAdmin, payment.updatePaymentStatus);

module.exports = router;
