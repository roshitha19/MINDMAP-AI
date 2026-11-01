const mongoose = require('mongoose');

const LearningGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide goal title'],
      trim: true,
    },
    targetRole: {
      type: String,
      default: 'Full Stack Developer',
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Software Engineering',
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stages: [
      {
        stageNumber: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        prerequisites: {
          type: [String],
          default: [],
        },
        requiredConcepts: [
          {
            name: String,
            category: String,
            isCompleted: { type: Boolean, default: false },
            conceptId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Concept',
              default: null,
            },
          },
        ],
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

LearningGoalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('LearningGoal', LearningGoalSchema);
