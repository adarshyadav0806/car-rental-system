/**
 * Car Model
 * Stores car listing information including specs, pricing, and availability
 */

const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be 2000 or later'],
    max: [new Date().getFullYear() + 1, 'Invalid year']
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Truck', 'Van', 'Luxury', 'Electric', 'Hybrid']
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual'],
    default: 'Automatic'
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    default: 'Petrol'
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: 2,
    max: 15
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [1, 'Price must be positive']
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  features: {
    type: [String], // e.g. ['GPS', 'Bluetooth', 'Sunroof', 'AC']
    default: []
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  mileage: {
    type: Number, // km per litre
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for search
carSchema.index({ name: 'text', brand: 'text', model: 'text', location: 'text' });

module.exports = mongoose.model('Car', carSchema);
