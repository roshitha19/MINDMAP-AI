const express = require('express');
const router = express.Router();
const {
  getRevisionQueue,
  submitRevisionFeedback,
  getRevisionStats,
} = require('../controllers/revisionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/queue', protect, getRevisionQueue);
router.get('/stats', protect, getRevisionStats);
router.post('/:conceptId/review', protect, submitRevisionFeedback);

module.exports = router;
