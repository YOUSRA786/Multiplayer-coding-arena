const express = require('express');
const { 
  getTopics, 
  generatePracticeProblem, 
  completeProblem, 
  getProgress, 
  getDoneIds,
  getProblemsByTopic 
} = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/topics', protect, getTopics);
router.get('/done', protect, getDoneIds);
router.get('/problems/:topicId', protect, getProblemsByTopic);
router.post('/generate', protect, generatePracticeProblem);
router.post('/complete', protect, completeProblem);
router.get('/progress', protect, getProgress);

module.exports = router;
