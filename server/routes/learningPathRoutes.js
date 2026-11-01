const express = require('express');
const router = express.Router();
const {
  getPaths,
  getPathById,
  createPath,
  toggleMilestone,
} = require('../controllers/learningPathController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPaths)
  .post(protect, createPath);

router.route('/:id')
  .get(protect, getPathById);

router.put('/:id/toggle-concept', protect, toggleMilestone);

module.exports = router;
