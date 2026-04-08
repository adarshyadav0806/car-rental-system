/**
 * Booking Controller
 * Create, view, cancel bookings
 */

const Booking = require('../models/Booking');
const Car = require('../models/Car');

// ─── Create Booking ───────────────────────────────────────────────────────────
// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      carId, startDate, endDate,
      pickupLocation, dropoffLocation,
      paymentMethod, driverLicense, specialRequests
    } = req.body;

    // Validate car exists and is available
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (!car.isAvailable) return res.status(400).json({ success: false, message: 'Car is not available' });

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date()) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    // Check for conflicting bookings
    const conflict = await Booking.findOne({
      car: carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Car is already booked for the selected dates'
      });
    }

    // Calculate totals
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * car.pricePerDay;

    // Generate dummy transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay: car.pricePerDay,
      totalAmount,
      pickupLocation: pickupLocation || car.location,
      dropoffLocation: dropoffLocation || car.location,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid',
      transactionId,
      driverLicense,
      specialRequests
    });

    // Increment car booking count
    await Car.findByIdAndUpdate(carId, { $inc: { totalBookings: 1 } });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('car', 'name brand model images pricePerDay')
      .populate('user', 'name email phone');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get My Bookings (User) ───────────────────────────────────────────────────
// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('car', 'name brand model images pricePerDay type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ success: true, bookings, total, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Bookings (Admin) ─────────────────────────────────────────────────
// GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('car', 'name brand model images')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ success: true, bookings, total, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Booking ───────────────────────────────────────────────────────
// GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'name brand model images pricePerDay type location')
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // User can only view their own booking; admin can view all
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Cancel Booking ───────────────────────────────────────────────────────────
// PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Check ownership
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    // Cannot cancel if already started and active
    if (booking.status === 'active' && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an active rental' });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Booking Status (Admin) ────────────────────────────────────────────
// PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('car user');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
