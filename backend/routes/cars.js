/**
 * Car Routes
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getCars, getCar, createCar, updateCar, deleteCar,
  getCarAvailability, getAnalytics
} = require('../controllers/carController');

// Admin analytics
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// Public routes
router.get('/', getCars);
router.get('/:id', getCar);
router.get('/:id/availability', getCarAvailability);

// Admin-only routes
router.post('/',    protect, authorize('admin'), upload.array('images', 5), createCar);
router.put('/:id',  protect, authorize('admin'), upload.array('images', 5), updateCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

module.exports = router;
