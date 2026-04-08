/**
 * Booking Routes
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking, getMyBookings, getAllBookings,
  getBooking, cancelBooking, updateBookingStatus
} = require('../controllers/bookingController');

router.post('/',                protect,                    createBooking);
router.get('/my',               protect,                    getMyBookings);
router.get('/',                 protect, authorize('admin'), getAllBookings);
router.get('/:id',              protect,                    getBooking);
router.put('/:id/cancel',       protect,                    cancelBooking);
router.put('/:id/status',       protect, authorize('admin'), updateBookingStatus);

module.exports = router;
