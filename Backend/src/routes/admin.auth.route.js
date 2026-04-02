const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin, resetUserPassword, getAllUsers } = require('../controllers/admin.auth.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');

router.post('/register', validate(schemas.adminLogin), registerAdmin);
router.post('/login', validate(schemas.adminLogin), loginAdmin);

// Admin manage users
router.get('/users', auth, isAdmin, getAllUsers);
router.put('/users/:userId/reset-password', auth, isAdmin, resetUserPassword);

module.exports = router;
