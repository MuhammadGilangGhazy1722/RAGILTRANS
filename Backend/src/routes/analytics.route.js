const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analytics.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// Public endpoint for landing page stats (no auth required)
router.get('/landing-stats', analytics.getLandingPageStats);

// All routes below require admin authentication
router.use(auth, isAdmin);

// Financial Reports
router.get('/monthly-report', analytics.getMonthlyFinancialReport);
router.get('/yearly-comparison', analytics.getYearlyComparison);
router.get('/car-performance', analytics.getCarPerformance);

module.exports = router;
