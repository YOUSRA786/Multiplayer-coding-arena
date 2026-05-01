const express = require('express');
const { getTopics, generatePracticeProblem, completeProblem, getProgress } = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/topics', protect, getTopics);
router.post('/generate', protect, generatePracticeProblem);
router.post('/complete', protect, completeProblem);
router.get('/progress', protect, getProgress);

module.exports = router;
