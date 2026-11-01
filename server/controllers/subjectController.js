const Subject = require('../models/Subject');
const Concept = require('../models/Concept');
const KnowledgeGraph = require('../models/KnowledgeGraph');

// @desc    Get all subjects for current user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Attach concept and graph counts
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subj) => {
        const conceptCount = await Concept.countDocuments({ subjectId: subj._id });
        const graphCount = await KnowledgeGraph.countDocuments({ subjectId: subj._id });
        return {
          ...subj.toObject(),
          conceptCount,
          graphCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: subjectsWithCounts.length,
      data: subjectsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const conceptCount = await Concept.countDocuments({ subjectId: subject._id });
    const graphCount = await KnowledgeGraph.countDocuments({ subjectId: subject._id });

    res.status(200).json({
      success: true,
      data: {
        ...subject.toObject(),
        conceptCount,
        graphCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, color, icon, semester, tags } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }

    const subject = await Subject.create({
      userId: req.user.id,
      name,
      code,
      description,
      color: color || '#8B5CF6',
      icon: icon || 'Brain',
      semester: semester || 'Semester 5',
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res, next) => {
  try {
    let subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await Concept.deleteMany({ subjectId: subject._id });
    await KnowledgeGraph.deleteMany({ subjectId: subject._id });
    await subject.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subject and associated knowledge graphs deleted',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
