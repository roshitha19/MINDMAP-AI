const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema(
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
    sourceConceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      required: true,
    },
    targetConceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      required: true,
    },
    relationType: {
      type: String,
      enum: [
        'prerequisite_for',
        'subtopic_of',
        'implements',
        'example_of',
        'relates_to',
        'contrasts_with',
      ],
      default: 'relates_to',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

RelationshipSchema.index({ userId: 1, sourceConceptId: 1, targetConceptId: 1 });

module.exports = mongoose.model('Relationship', RelationshipSchema);
