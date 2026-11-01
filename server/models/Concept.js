const mongoose = require('mongoose');

const ConceptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide concept name'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'main_topic',
        'subtopic',
        'definition',
        'formula',
        'example',
        'prerequisite',
        'advanced',
      ],
      default: 'subtopic',
    },
    definition: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      default: '',
    },
    formula: {
      type: String,
      default: '',
    },
    examples: {
      type: [String],
      default: [],
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Concept',
      },
    ],
    relatedConcepts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Concept',
      },
    ],
    masteryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    lastReviewed: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

ConceptSchema.index({ userId: 1, subjectId: 1, name: 1 });

module.exports = mongoose.model('Concept', ConceptSchema);
