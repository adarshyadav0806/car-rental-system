/**
 * Car Controller
 * Admin: Create, Update, Delete cars
 * Public: List and search cars
 */

const Car = require('../models/Car');
const Booking = require('../models/Booking');
const path = require('path');
const fs = require('fs');

// ─── Get All Cars (with search & filter) ──────────────────────────────────────
// GET /api/cars
exports.getCars = async (req, res) => {
  try {
    const {
      search, type, minPrice, maxPrice, transmission,
      fuelType, seats, location, available, sort, page, limit
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (type) query.type = type;
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (seats) query.seats = parseInt(seats);
    if (location) query.location = { $regex: location, $options: 'i' };
    if (available === 'true') query.isAvailable = true;

    // Price range
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price_asc')  sortOption = { pricePerDay: 1 };
    if (sort === 'price_desc') sortOption = { pricePerDay: -1 };
    if (sort === 'rating')     sortOption = { rating: -1 };
    if (sort === 'popular')    sortOption = { totalBookings: -1 };

    const total = await Car.countDocuments(query);
    const cars = await Car.find(query)
      .populate('addedBy', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: cars.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      cars
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Car ───────────────────────────────────────────────────────────
// GET /api/cars/:id
exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('addedBy', 'name email');
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create Car (Admin) ───────────────────────────────────────────────────────
// POST /api/cars
exports.createCar = async (req, res) => {
  try {
    const {
      name, brand, model, year, type, transmission, fuelType,
      seats, pricePerDay, description, features, location, mileage
    } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    // Parse features if sent as string
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try { parsedFeatures = JSON.parse(features); } catch { parsedFeatures = features.split(',').map(f => f.trim()); }
    }

    const car = await Car.create({
      name, brand, model, year: parseInt(year), type, transmission, fuelType,
      seats: parseInt(seats), pricePerDay: parseFloat(pricePerDay),
      description, features: parsedFeatures || [], location,
      mileage: parseFloat(mileage) || 0, images, addedBy: req.user._id
    });

    res.status(201).json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Car (Admin) ───────────────────────────────────────────────────────
// PUT /api/cars/:id
exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });

    const updateData = { ...req.body };

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    // Parse features
    if (typeof updateData.features === 'string') {
      try { updateData.features = JSON.parse(updateData.features); }
      catch { updateData.features = updateData.features.split(',').map(f => f.trim()); }
    }

    car = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    });

    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Car (Admin) ───────────────────────────────────────────────────────
// DELETE /api/cars/:id
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      car: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete car with active bookings'
      });
    }

    // Delete car images from disk
    car.images.forEach(imgPath => {
      const fullPath = path.join(__dirname, '..', imgPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    await car.deleteOne();
    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Car Availability ─────────────────────────────────────────────────────
// GET /api/cars/:id/availability
exports.getCarAvailability = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0);

    // Get all bookings for this car in the month
    const bookings = await Booking.find({
      car: req.params.id,
      status: { $in: ['confirmed', 'active'] },
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth }
    }).select('startDate endDate status');

    // Build array of booked dates
    const bookedDates = [];
    bookings.forEach(b => {
      let d = new Date(b.startDate);
      while (d <= b.endDate) {
        bookedDates.push(new Date(d).toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
    });

    res.json({ success: true, bookedDates, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin Analytics ──────────────────────────────────────────────────────────
// GET /api/cars/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalCars, availableCars,
      totalBookings, activeBookings, cancelledBookings,
      revenue, topCars, bookingsByMonth
    ] = await Promise.all([
      Car.countDocuments(),
      Car.countDocuments({ isAvailable: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['confirmed', 'active'] } }),
      Booking.countDocuments({ status: 'cancelled' }),

      // Total revenue from completed & confirmed bookings
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed', 'active'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // Top 5 most booked cars
      Booking.aggregate([
        { $group: { _id: '$car', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'cars', localField: '_id', foreignField: '_id', as: 'car' } },
        { $unwind: '$car' },
        { $project: { 'car.name': 1, 'car.brand': 1, count: 1, revenue: 1 } }
      ]),

      // Bookings per month (last 6 months)
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const totalUsers = await require('../models/User').countDocuments({ role: 'user' });

    res.json({
      success: true,
      analytics: {
        cars: { total: totalCars, available: availableCars },
        bookings: { total: totalBookings, active: activeBookings, cancelled: cancelledBookings },
        revenue: revenue[0]?.total || 0,
        totalUsers,
        topCars,
        bookingsByMonth
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
