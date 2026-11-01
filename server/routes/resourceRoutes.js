const express = require('express');
const router = express.Router();
const {
  getResources,
  uploadResource,
  createManualResource,
  attachResourceToConcept,
  deleteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getResources);
router.post('/upload', protect, upload.single('file'), uploadResource);
router.post('/manual', protect, createManualResource);
router.put('/:id/attach', protect, attachResourceToConcept);
router.delete('/:id', protect, deleteResource);

module.exports = router;
