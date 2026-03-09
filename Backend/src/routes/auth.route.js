const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
