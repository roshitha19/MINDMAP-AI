const express = require('express');
const router = express.Router();
const {
  generateQuiz,
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  getQuizAttempts,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateQuiz);
router.get('/', protect, getQuizzes);
router.get('/attempts/history', protect, getQuizAttempts);
router.get('/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuizAttempt);

module.exports = router;
