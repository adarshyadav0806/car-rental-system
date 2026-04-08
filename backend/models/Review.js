/**
 * Review Model
 * User reviews and ratings for cars
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true });
// One review per user per car
reviewSchema.index({ user: 1, car: 1 }, { unique: true });

// Update car average rating after saving a review
reviewSchema.post('save', async function () {
  const Car = require('./Car');
  const stats = await this.constructor.aggregate([
    { $match: { car: this.car } },
    { $group: { _id: '$car', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await Car.findByIdAndUpdate(this.car, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
