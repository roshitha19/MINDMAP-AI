const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema(
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
      default: null,
    },
    activityType: {
      type: String,
      enum: ['graph_exploration', 'quiz', 'revision', 'tutor_chat', 'resource_reading'],
      default: 'graph_exploration',
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 15,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

StudySessionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('StudySession', StudySessionSchema);
