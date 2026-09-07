const mongoose = require('mongoose');

const legalSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true, maxlength: 120 },
    body: { type: String, default: '', maxlength: 20000 },
  },
  { _id: true }
);

const legalPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ['privacy', 'terms', 'refund', 'about'],
    },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    subtitle: { type: String, default: '', trim: true, maxlength: 160 },
    sections: { type: [legalSectionSchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LegalPage', legalPageSchema);
