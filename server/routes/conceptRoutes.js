const express = require('express');
const router = express.Router();
const {
  getConcepts,
  getConceptById,
  createConcept,
  updateConcept,
  deleteConcept,
} = require('../controllers/conceptController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getConcepts)
  .post(protect, createConcept);

router.route('/:id')
  .get(protect, getConceptById)
  .put(protect, updateConcept)
  .delete(protect, deleteConcept);

module.exports = router;
