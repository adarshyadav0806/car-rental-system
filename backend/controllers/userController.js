/**
 * User Controller
 * Admin user management
 */

const User = require('../models/User');
const Booking = require('../models/Booking');

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, page, limit } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single User (Admin) ──────────────────────────────────────────────────
// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const bookings = await Booking.find({ user: req.params.id })
      .populate('car', 'name brand')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, user, recentBookings: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle User Active Status (Admin) ────────────────────────────────────────
// PUT /api/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
