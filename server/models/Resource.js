const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
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
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Please provide resource title'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'note', 'link'],
      default: 'note',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    contentText: {
      type: String,
      default: '',
    },
    externalUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

ResourceSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);
