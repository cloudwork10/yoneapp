const mongoose = require('mongoose');

const programmingTermSchema = new mongoose.Schema({
  term: {
    type: String,
    required: [true, 'Term name is required'],
    trim: true,
    maxlength: [50, 'Term cannot be more than 50 characters']
  },
  definition: {
    type: String,
    required: [true, 'Term definition is required'],
    maxlength: [1000, 'Definition cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Term category is required'],
    enum: ['Basics', 'Functions', 'Data Structures', 'OOP', 'Advanced']
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go']
  },
  audioUrl: {
    type: String,
    required: [true, 'Audio URL is required']
  },
  duration: {
    type: String,
    required: [true, 'Audio duration is required']
  },
  examples: [{
    code: String,
    explanation: String
  }],
  relatedTerms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgrammingTerm'
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
programmingTermSchema.index({ term: 'text', definition: 'text' });
programmingTermSchema.index({ language: 1, category: 1 });
programmingTermSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('ProgrammingTerm', programmingTermSchema);
