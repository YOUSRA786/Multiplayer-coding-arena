const express = require('express');
const { getLeaderboard, getStats, getHistory, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/stats', protect, getStats);
router.get('/history', protect, getHistory);
router.put('/profile', protect, updateProfile);

module.exports = router;
