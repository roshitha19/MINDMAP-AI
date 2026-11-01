const Resource = require('../models/Resource');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res, next) => {
  try {
    const { subjectId, type, search } = req.query;
    const filter = { userId: req.user.id };

    if (subjectId) filter.subjectId = subjectId;
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const resources = await Resource.find(filter)
      .populate('subjectId', 'name color')
      .populate('conceptId', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload file resource (PDF, DOCX, TXT)
// @route   POST /api/resources/upload
// @access  Private
const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { subjectId, conceptId, title, tags } = req.body;
    const filePath = req.file.path;
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let contentText = '';

    if (ext === 'pdf') {
      const buffer = fs.readFileSync(filePath);
      const pdf = await pdfParse(buffer);
      contentText = pdf.text;
    } else if (ext === 'docx') {
      const docx = await mammoth.extractRawText({ path: filePath });
      contentText = docx.value;
    } else {
      contentText = fs.readFileSync(filePath, 'utf-8');
    }

    const resource = await Resource.create({
      userId: req.user.id,
      subjectId: subjectId || null,
      conceptId: conceptId || null,
      title: title || req.file.originalname,
      type: ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : 'txt',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      contentText: contentText ? contentText.substring(0, 15000) : '',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    });

    res.status(201).json({
      success: true,
      message: 'Resource uploaded and indexed successfully',
      data: resource,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create manual note or external link
// @route   POST /api/resources/manual
// @access  Private
const createManualResource = async (req, res, next) => {
  try {
    const { title, type, contentText, externalUrl, subjectId, conceptId, tags } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Resource title is required' });
    }

    const resource = await Resource.create({
      userId: req.user.id,
      subjectId: subjectId || null,
      conceptId: conceptId || null,
      title,
      type: type || 'note',
      contentText: contentText || '',
      externalUrl: externalUrl || '',
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Attach resource to concept
// @route   PUT /api/resources/:id/attach
// @access  Private
const attachResourceToConcept = async (req, res, next) => {
  try {
    const { conceptId } = req.body;
    const resource = await Resource.findOne({ _id: req.params.id, userId: req.user.id });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.conceptId = conceptId;
    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource attached to concept node',
      data: resource,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await resource.deleteOne();
    res.status(200).json({ success: true, message: 'Resource removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResources,
  uploadResource,
  createManualResource,
  attachResourceToConcept,
  deleteResource,
};
