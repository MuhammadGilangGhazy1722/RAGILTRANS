const express = require('express');
const router = express.Router();
const payment = require('../controllers/payment.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// User routes (Manual Transfer)
router.post('/', auth, payment.createPayment);
router.get('/booking/:bookingId', auth, payment.getPaymentByBooking);

// Midtrans routes
router.post('/midtrans/create', payment.createMidtransTransaction); // Tidak perlu auth karena guest booking
router.post('/midtrans/notification', payment.handleMidtransNotification); // Webhook dari Midtrans server
router.get('/midtrans/status/:order_id', payment.checkMidtransStatus); // Cek status transaksi
router.post('/midtrans/sync/:order_id', auth, isAdmin, payment.syncPaymentStatus); // Manual sync untuk sandbox testing

// Admin routes
router.get('/', auth, isAdmin, payment.getAllPayments);
router.get('/:id', auth, isAdmin, payment.getPaymentById);
router.put('/:id/status', auth, isAdmin, payment.updatePaymentStatus);

module.exports = router;
