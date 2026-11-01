const mongoose = require('mongoose');

const RevisionScheduleSchema = new mongoose.Schema(
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
    // SuperMemo SM-2 Parameters
    intervalDays: {
      type: Number,
      default: 1, // Days until next review
    },
    repetitions: {
      type: Number,
      default: 0, // Number of successful consecutive reviews
    },
    easeFactor: {
      type: Number,
      default: 2.5, // Initial SM-2 ease factor
      min: 1.3,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastReviewDate: {
      type: Date,
      default: null,
    },
    history: [
      {
        rating: {
          type: String,
          enum: ['again', 'difficult', 'good', 'easy'],
        },
        reviewDate: {
          type: Date,
          default: Date.now,
        },
        newInterval: Number,
        newEaseFactor: Number,
      },
    ],
  },
  { timestamps: true }
);

RevisionScheduleSchema.index({ userId: 1, conceptId: 1 }, { unique: true });

module.exports = mongoose.model('RevisionSchedule', RevisionScheduleSchema);
