const express = require('express');
const { createRoom, getRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createRoom);
router.route('/:roomId').get(protect, getRoom);

module.exports = router;
