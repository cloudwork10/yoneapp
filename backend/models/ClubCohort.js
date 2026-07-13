const mongoose = require('mongoose');

const whatsappGroupSchema = new mongoose.Schema({
  label: { type: String, default: 'Group 1', trim: true },
  link: { type: String, default: '', trim: true },
}, { _id: true });

// Weekly live slots per specialization (evening times after 19:00)
const weeklySlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sunday … 6=Saturday
  time: { type: String, default: '19:00' }, // HH:mm 24h
  label: { type: String, default: '' },
}, { _id: true });

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  unlockWeek: { type: Number, default: 1 },
  zoomLink: { type: String, default: '', trim: true }, // permanent Zoom room for this track’s weekly lives
  whatsappGroups: { type: [whatsappGroupSchema], default: [] },
  weeklySlots: { type: [weeklySlotSchema], default: [] },
}, { _id: true });

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  trackId: { type: mongoose.Schema.Types.ObjectId, default: null },
  startsAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 120 },
  zoomLink: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { _id: true });

const clubCohortSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'النادي · دفعة أكتوبر 2026',
  },
  description: {
    type: String,
    default: 'Live cohort inside ELNADY — tracks, Zoom sessions, and WhatsApp communities.',
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed'],
    default: 'upcoming',
  },
  price: { type: Number, default: 0 },
  maxSeats: { type: Number, default: 0 },
  whatsappLink: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  tracks: [trackSchema],
  sessions: [sessionSchema],
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

clubCohortSchema.index({ startDate: 1, isPublished: 1, status: 1 });

module.exports = mongoose.model('ClubCohort', clubCohortSchema);
