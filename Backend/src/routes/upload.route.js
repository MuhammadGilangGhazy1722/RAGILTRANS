const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { uploadImage, deleteImage } = require('../controllers/upload.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// Upload single image (admin only)
router.post('/', auth, isAdmin, upload.single('image'), uploadImage);

// Delete image (admin only)
router.delete('/:filename', auth, isAdmin, deleteImage);

module.exports = router;
