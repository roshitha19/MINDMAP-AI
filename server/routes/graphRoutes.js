const express = require('express');
const router = express.Router();
const {
  getSubjectsAndTopicsMap,
  generateGraphForTopic,
  getGraphs,
  getGraphById,
  createGraph,
  updateGraph,
  deleteGraph,
} = require('../controllers/graphController');
const { protect } = require('../middleware/authMiddleware');

router.get('/meta/topics', protect, getSubjectsAndTopicsMap);
router.post('/generate-for-topic', protect, generateGraphForTopic);

router.route('/')
  .get(protect, getGraphs)
  .post(protect, createGraph);

router.route('/:id')
  .get(protect, getGraphById)
  .put(protect, updateGraph)
  .delete(protect, deleteGraph);

module.exports = router;
