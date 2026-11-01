const express = require('express');
const router = express.Router();
const { getAchievements } = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/achievements', protect, getAchievements);

module.exports = router;
