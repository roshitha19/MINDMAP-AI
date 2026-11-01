const mongoose = require('mongoose');

const MasterySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    masteryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    quizAttemptsCount: {
      type: Number,
      default: 0,
    },
    quizCorrectCount: {
      type: Number,
      default: 0,
    },
    accuracyRate: {
      type: Number,
      default: 0, // 0 - 100%
    },
    revisionCount: {
      type: Number,
      default: 0,
    },
    lastQuizDate: {
      type: Date,
      default: null,
    },
    lastRevisionDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['strong', 'moderate', 'weak', 'untested'],
      default: 'untested',
    },
  },
  { timestamps: true }
);

MasterySchema.index({ userId: 1, conceptId: 1 }, { unique: true });

module.exports = mongoose.model('Mastery', MasterySchema);
