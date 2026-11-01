const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide subject name'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    color: {
      type: String,
      default: '#8B5CF6', // Electric violet
    },
    icon: {
      type: String,
      default: 'Brain',
    },
    semester: {
      type: String,
      default: 'Semester 5',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

SubjectSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
