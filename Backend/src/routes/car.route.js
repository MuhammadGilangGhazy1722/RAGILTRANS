const express = require('express');
const router = express.Router();
const car = require('../controllers/car.controller');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.get('/', car.getCars);
router.post('/', auth, isAdmin, car.createCar);
router.put('/:id', auth, isAdmin, car.updateCar);
router.delete('/:id', auth, isAdmin, car.deleteCar);

module.exports = router;
