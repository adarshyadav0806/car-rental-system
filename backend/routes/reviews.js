/**
 * Review Routes
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { addReview, getCarReviews, deleteReview } = require('../controllers/reviewController');

router.post('/',                protect,                    addReview);
router.get('/car/:carId',                                   getCarReviews);
router.delete('/:id',           protect,                    deleteReview);

module.exports = router;
