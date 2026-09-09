const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeFileName: {
    type: String,
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  jobDescriptionText: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    required: true
  },
  matchingKeywords: {
    type: [String],
    default: []
  },
  missingKeywords: {
    type: [String],
    default: []
  },
  suggestions: [
    {
      category: {
        type: String,
        required: true // e.g. "Skills", "Contact Info", "Formatting"
      },
      message: {
        type: String,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scan', ScanSchema);
