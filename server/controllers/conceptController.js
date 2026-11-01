const Concept = require('../models/Concept');
const Mastery = require('../models/Mastery');
const RevisionSchedule = require('../models/RevisionSchedule');

// @desc    Get concepts with optional filters
// @route   GET /api/concepts
// @access  Private
const getConcepts = async (req, res, next) => {
  try {
    const { subjectId, category, search } = req.query;
    const filter = { userId: req.user.id };

    if (subjectId) filter.subjectId = subjectId;
    if (category) filter.category = category;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const concepts = await Concept.find(filter)
      .populate('prerequisites', 'name category')
      .populate('relatedConcepts', 'name category')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: concepts.length,
      data: concepts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single concept with mastery and revision metadata
// @route   GET /api/concepts/:id
// @access  Private
const getConceptById = async (req, res, next) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('prerequisites', 'name category definition')
      .populate('relatedConcepts', 'name category definition')
      .populate('subjectId', 'name color');

    if (!concept) {
      return res.status(404).json({ success: false, message: 'Concept not found' });
    }

    const mastery = await Mastery.findOne({ conceptId: concept._id, userId: req.user.id });
    const revision = await RevisionSchedule.findOne({ conceptId: concept._id, userId: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        ...concept.toObject(),
        masteryDetails: mastery || null,
        revisionDetails: revision || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new concept
// @route   POST /api/concepts
// @access  Private
const createConcept = async (req, res, next) => {
  try {
    const {
      subjectId,
      name,
      category,
      definition,
      explanation,
      formula,
      examples,
      prerequisites,
      relatedConcepts,
      tags,
    } = req.body;

    if (!subjectId || !name) {
      return res.status(400).json({ success: false, message: 'Subject ID and Concept name are required' });
    }

    const concept = await Concept.create({
      userId: req.user.id,
      subjectId,
      name,
      category: category || 'subtopic',
      definition: definition || '',
      explanation: explanation || '',
      formula: formula || '',
      examples: examples || [],
      prerequisites: prerequisites || [],
      relatedConcepts: relatedConcepts || [],
      tags: tags || [],
    });

    // Initialize Mastery tracker
    await Mastery.create({
      userId: req.user.id,
      conceptId: concept._id,
      subjectId,
      masteryScore: 0,
      status: 'untested',
    });

    // Initialize Spaced Repetition queue
    await RevisionSchedule.create({
      userId: req.user.id,
      conceptId: concept._id,
      subjectId,
      intervalDays: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date(),
    });

    res.status(201).json({
      success: true,
      data: concept,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update concept
// @route   PUT /api/concepts/:id
// @access  Private
const updateConcept = async (req, res, next) => {
  try {
    let concept = await Concept.findOne({ _id: req.params.id, userId: req.user.id });
    if (!concept) {
      return res.status(404).json({ success: false, message: 'Concept not found' });
    }

    concept = await Concept.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: concept,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete concept
// @route   DELETE /api/concepts/:id
// @access  Private
const deleteConcept = async (req, res, next) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id, userId: req.user.id });
    if (!concept) {
      return res.status(404).json({ success: false, message: 'Concept not found' });
    }

    await Mastery.deleteOne({ conceptId: concept._id });
    await RevisionSchedule.deleteOne({ conceptId: concept._id });
    await concept.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Concept and tracking records deleted',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConcepts,
  getConceptById,
  createConcept,
  updateConcept,
  deleteConcept,
};
