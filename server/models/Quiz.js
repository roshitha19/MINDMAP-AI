const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length >= 2, 'At least 2 options are required'],
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
  conceptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Concept',
    default: null,
  },
});

const QuizSchema = new mongoose.Schema(
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
    conceptIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Concept',
      },
    ],
    title: {
      type: String,
      required: [true, 'Please provide quiz title'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard'],
      default: 'intermediate',
    },
    timeLimitMinutes: {
      type: Number,
      default: 10,
    },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

QuizSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', QuizSchema);
