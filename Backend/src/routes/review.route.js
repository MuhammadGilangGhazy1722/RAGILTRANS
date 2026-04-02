const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { auth } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');

// Public - Get all reviews (landing page testimonials)
router.get('/public', reviewController.getAllReviews);

// Protected - Submit review
router.post('/submit', auth, validate(schemas.submitReview), reviewController.submitReview);

// Protected - Get user's reviews
router.get('/my-reviews', auth, reviewController.getUserReviews);

// Protected - Check if booking has review
router.get('/booking/:booking_id/status', auth, reviewController.getBookingReviewStatus);

module.exports = router;
