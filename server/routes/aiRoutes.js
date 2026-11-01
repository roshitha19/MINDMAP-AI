const express = require('express');
const router = express.Router();
const {
  extractFromText,
  extractFromFile,
  saveGeneratedGraph,
  tutorChat,
  getConversations,
  deleteConversation,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/extract-text', protect, extractFromText);
router.post('/extract-file', protect, upload.single('file'), extractFromFile);
router.post('/save-generated-graph', protect, saveGeneratedGraph);
router.post('/tutor-chat', protect, tutorChat);
router.post('/chat', protect, tutorChat);
router.get('/conversations', protect, getConversations);
router.delete('/conversations/:id', protect, deleteConversation);

module.exports = router;
