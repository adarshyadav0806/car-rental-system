/**
 * Review Controller
 * Users can review cars after completed bookings
 */

const Review = require('../models/Review');
const Booking = require('../models/Booking');

// ─── Add Review ───────────────────────────────────────────────────────────────
// POST /api/reviews
exports.addReview = async (req, res) => {
  try {
    const { carId, bookingId, rating, comment } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      user: req.user._id,
      car: carId,
      booking: bookingId,
      rating: parseInt(rating),
      comment
    });

    const populated = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this car' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Reviews for a Car ────────────────────────────────────────────────────
// GET /api/reviews/car/:carId
exports.getCarReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.carId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Review (Admin or Owner) ──────────────────────────────────────────
// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
