/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUser, toggleUserStatus } = require('../controllers/userController');

router.get('/',                      protect, authorize('admin'), getUsers);
router.get('/:id',                   protect, authorize('admin'), getUser);
router.put('/:id/toggle-status',     protect, authorize('admin'), toggleUserStatus);

module.exports = router;
