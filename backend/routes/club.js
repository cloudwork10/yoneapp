const express = require('express');
const router = express.Router();
const ClubCohort = require('../models/ClubCohort');
const ClubEnrollment = require('../models/ClubEnrollment');
const Subscription = require('../models/Subscription');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const DEFAULT_START = new Date('2026-10-10T17:00:00.000Z');
const DEFAULT_END = new Date('2026-12-05T21:00:00.000Z');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Stable “random-looking” weekly slots — 2 days/week, all after 7 PM
const DEFAULT_TRACKS = [
  {
    title: 'Intro to Programming',
    description: 'Logic, fundamentals, and first projects',
    order: 1,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 0, time: '19:00', label: 'Sunday 7:00 PM' },
      { dayOfWeek: 3, time: '20:00', label: 'Wednesday 8:00 PM' },
    ],
  },
  {
    title: 'Cyber Security',
    description: 'Networks, security basics, and ethical hacking intro',
    order: 2,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 1, time: '19:30', label: 'Monday 7:30 PM' },
      { dayOfWeek: 4, time: '21:00', label: 'Thursday 9:00 PM' },
    ],
  },
  {
    title: 'Front End',
    description: 'HTML, CSS, JavaScript, and modern UI',
    order: 3,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 2, time: '19:00', label: 'Tuesday 7:00 PM' },
      { dayOfWeek: 6, time: '20:30', label: 'Saturday 8:30 PM' },
    ],
  },
  {
    title: 'Back End',
    description: 'APIs, databases, and server-side development',
    order: 4,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 0, time: '20:00', label: 'Sunday 8:00 PM' },
      { dayOfWeek: 4, time: '19:00', label: 'Thursday 7:00 PM' },
    ],
  },
  {
    title: 'Mobile Apps',
    description: 'Build iOS & Android apps with React Native',
    order: 5,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 1, time: '20:00', label: 'Monday 8:00 PM' },
      { dayOfWeek: 5, time: '19:30', label: 'Friday 7:30 PM' },
    ],
  },
  {
    title: 'Data Analysis',
    description: 'Excel, SQL, dashboards, and insights',
    order: 6,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 2, time: '20:30', label: 'Tuesday 8:30 PM' },
      { dayOfWeek: 5, time: '21:00', label: 'Friday 9:00 PM' },
    ],
  },
  {
    title: 'UI UX Design',
    description: 'Research, wireframes, prototypes, and testing',
    order: 7,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 3, time: '19:00', label: 'Wednesday 7:00 PM' },
      { dayOfWeek: 6, time: '19:00', label: 'Saturday 7:00 PM' },
    ],
  },
  {
    title: 'AI Automation',
    description: 'AI tools, workflows, and practical automation',
    order: 8,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 0, time: '21:00', label: 'Sunday 9:00 PM' },
      { dayOfWeek: 2, time: '21:00', label: 'Tuesday 9:00 PM' },
    ],
  },
  {
    title: 'Media Buying',
    description: 'Paid ads, campaigns, and performance marketing',
    order: 9,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 1, time: '21:30', label: 'Monday 9:30 PM' },
      { dayOfWeek: 3, time: '20:30', label: 'Wednesday 8:30 PM' },
    ],
  },
  {
    title: 'Freelancing',
    description: 'Pricing, proposals, clients, and delivery',
    order: 10,
    unlockWeek: 1,
    whatsappGroups: [{ label: 'Group 1', link: '' }],
    weeklySlots: [
      { dayOfWeek: 4, time: '20:00', label: 'Thursday 8:00 PM' },
      { dayOfWeek: 6, time: '21:00', label: 'Saturday 9:00 PM' },
    ],
  },
];

const EXPECTED_TITLES = DEFAULT_TRACKS.map((t) => t.title.toLowerCase());

function formatSlotLabel(dayOfWeek, time) {
  const [h, m] = String(time || '19:00').split(':').map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const mm = String(m || 0).padStart(2, '0');
  return `${DAY_NAMES[dayOfWeek] || 'Day'} ${hour12}:${mm} ${ampm}`;
}

/** Build a Date in Egypt time (UTC+3) from calendar parts. */
function egyptLocalDate(year, monthIndex, day, hours, minutes) {
  const pad = (n) => String(n).padStart(2, '0');
  return new Date(
    `${year}-${pad(monthIndex + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes || 0)}:00+03:00`
  );
}

function sessionKey(trackId, startsAt) {
  const d = new Date(startsAt);
  return `${String(trackId || '')}|${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}`;
}

/**
 * Auto-build today's live sessions from each track’s fixed weeklySlots (Egypt time).
 */
function generateSessionsFromWeeklySlots(cohort, now = new Date()) {
  const cohortStart = cohort.startDate ? new Date(cohort.startDate) : null;
  const cohortEnd = cohort.endDate ? new Date(cohort.endDate) : null;

  // Only build for "today" in Africa/Cairo
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const year = Number(get('year'));
  const month = Number(get('month')) - 1;
  const day = Number(get('day'));
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const wd = weekdayMap[get('weekday')];
  if (wd === undefined) return [];

  // Before cohort start / after end → no daily schedule
  const todayNoon = egyptLocalDate(year, month, day, 12, 0);
  if (cohortStart && todayNoon < new Date(cohortStart.getTime() - 12 * 60 * 60 * 1000)) {
    return [];
  }
  if (cohortEnd && todayNoon > cohortEnd) {
    return [];
  }

  const generated = [];
  const seen = new Set();

  for (const track of cohort.tracks || []) {
    for (const slot of track.weeklySlots || []) {
      if (Number(slot.dayOfWeek) !== wd) continue;
      const [hours, minutes] = String(slot.time || '19:00').split(':').map(Number);
      if (Number.isNaN(hours)) continue;

      const startsAt = egyptLocalDate(year, month, day, hours, minutes || 0);
      const key = `${track._id || track.title}|${startsAt.toISOString()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      generated.push({
        _id: `auto-${key}`,
        title: `${track.title} — Live`,
        trackId: track._id || null,
        startsAt,
        durationMinutes: 120,
        zoomLink: track.zoomLink || '',
        recordingUrl: '',
        notes: '',
        isAuto: true,
      });
    }
  }

  return generated;
}

function mapSessionFields(s, now, includePrivateLinks) {
  const startsAt = new Date(s.startsAt);
  const endsAt = new Date(startsAt.getTime() + (s.durationMinutes || 120) * 60000);
  let liveState = 'upcoming';
  if (now >= startsAt && now <= endsAt) liveState = 'live';
  else if (now > endsAt) liveState = 'done';

  const zoomLink = s.zoomLink || '';
  const recordingUrl = s.recordingUrl || '';

  return {
    _id: s._id,
    title: s.title,
    trackId: s.trackId,
    startsAt: startsAt.toISOString(),
    durationMinutes: s.durationMinutes || 120,
    notes: s.notes || '',
    liveState,
    isAuto: !!s.isAuto,
    hasRecording: !!recordingUrl,
    recordingUrl: includePrivateLinks ? recordingUrl : undefined,
    zoomLink: includePrivateLinks ? zoomLink : undefined,
    // Show Join for upcoming/live when subscribed (even if zoom empty — UI prompts admin)
    canJoin: includePrivateLinks && (liveState === 'live' || liveState === 'upcoming'),
  };
}

function buildDefaultCohort() {
  const start = new Date(DEFAULT_START);
  const sessions = [
    {
      title: 'Intro to Programming — Kickoff',
      startsAt: new Date(start),
      durationMinutes: 120,
      zoomLink: '',
      recordingUrl: '',
    },
    {
      title: 'Front End — Foundations',
      startsAt: new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 120,
      zoomLink: '',
      recordingUrl: '',
    },
    {
      title: 'Freelancing — First Clients',
      startsAt: new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000),
      durationMinutes: 90,
      zoomLink: '',
      recordingUrl: '',
    },
  ];

  return {
    title: 'النادي · دفعة أكتوبر 2026',
    description:
      'Live cohort inside ELNADY — choose your track, join Zoom sessions, and enter your WhatsApp community groups.',
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
    status: 'upcoming',
    price: 0,
    maxSeats: 0,
    whatsappLink: '',
    tracks: DEFAULT_TRACKS,
    sessions,
    isPublished: true,
  };
}

async function ensureDefaultCohort() {
  let cohort = await ClubCohort.findOne({ isPublished: true }).sort({ startDate: 1 });
  if (!cohort) {
    return ClubCohort.create(buildDefaultCohort());
  }

  const titles = (cohort.tracks || []).map((t) => String(t.title || '').toLowerCase());
  const needsTrackMigration =
    titles.length !== EXPECTED_TITLES.length ||
    !EXPECTED_TITLES.every((title) => titles.includes(title));

  const needsScheduleMigration = (cohort.tracks || []).some(
    (t) => !t.weeklySlots || t.weeklySlots.length < 2
  );

  if (needsTrackMigration || needsScheduleMigration) {
    const byTitle = {};
    for (const t of cohort.tracks || []) {
      byTitle[String(t.title || '').toLowerCase()] = t;
    }
    cohort.tracks = DEFAULT_TRACKS.map((def) => {
      const prev = byTitle[def.title.toLowerCase()];
      return {
        title: def.title,
        description: def.description,
        order: def.order,
        unlockWeek: def.unlockWeek,
        zoomLink: prev?.zoomLink || '',
        whatsappGroups:
          prev?.whatsappGroups?.length > 0
            ? prev.whatsappGroups
            : [{ label: 'Group 1', link: '' }],
        weeklySlots:
          prev?.weeklySlots?.length >= 2
            ? prev.weeklySlots
            : def.weeklySlots,
      };
    });
    await cohort.save();
  }

  return cohort;
}

async function userHasClubAccess(userId) {
  const sub = await Subscription.findOne({
    user: userId,
    status: 'active',
    endDate: { $gt: new Date() },
  });
  return !!sub;
}

function serializeTracks(tracks, includePrivateLinks) {
  return (tracks || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((t) => {
      const groups = (t.whatsappGroups || []).map((g, idx) => ({
        _id: g._id,
        label: g.label || `Group ${idx + 1}`,
        hasLink: !!g.link,
        link: includePrivateLinks ? g.link || '' : undefined,
      }));
      const weeklySlots = (t.weeklySlots || []).map((s) => ({
        _id: s._id,
        dayOfWeek: s.dayOfWeek,
        time: s.time || '19:00',
        dayName: DAY_NAMES[s.dayOfWeek] || '',
        label: s.label || formatSlotLabel(s.dayOfWeek, s.time || '19:00'),
      }));
      return {
        _id: t._id,
        title: t.title,
        description: t.description || '',
        order: t.order,
        unlockWeek: t.unlockWeek,
        zoomLink: includePrivateLinks ? t.zoomLink || '' : undefined,
        hasZoom: !!t.zoomLink,
        whatsappGroups: groups,
        weeklySlots,
        groupCount: groups.length,
        openGroupCount: groups.filter((g) => g.hasLink).length,
      };
    });
}

function serializeCohort(cohort, { includePrivateLinks = false, includeAutoSchedule = false } = {}) {
  const obj = cohort.toObject ? cohort.toObject() : { ...cohort };
  const now = new Date();

  const manualRaw = (obj.sessions || []).map((s) => ({
    _id: s._id,
    title: s.title,
    trackId: s.trackId,
    startsAt: s.startsAt,
    durationMinutes: s.durationMinutes || 120,
    zoomLink: s.zoomLink || '',
    recordingUrl: s.recordingUrl || '',
    notes: s.notes || '',
    isAuto: false,
  }));

  let mergedRaw = manualRaw;

  if (includeAutoSchedule) {
    const autoRaw = generateSessionsFromWeeklySlots(obj, now);
    const usedManual = new Set();
    mergedRaw = [];

    for (const auto of autoRaw) {
      const autoStart = new Date(auto.startsAt).getTime();
      const match = manualRaw.find((m) => {
        if (usedManual.has(String(m._id))) return false;
        const mStart = new Date(m.startsAt).getTime();
        const sameTrack =
          auto.trackId && m.trackId && String(auto.trackId) === String(m.trackId);
        const closeInTime = Math.abs(mStart - autoStart) < 3 * 60 * 60 * 1000;
        const sameDayKey =
          sessionKey(auto.trackId, auto.startsAt) === sessionKey(m.trackId, m.startsAt);
        const titleMatch =
          !m.trackId &&
          String(m.title || '')
            .toLowerCase()
            .startsWith(String(auto.title).split('—')[0].trim().toLowerCase()) &&
          closeInTime;
        return (sameTrack && (closeInTime || sameDayKey)) || titleMatch;
      });

      if (match) {
        usedManual.add(String(match._id));
        mergedRaw.push({
          ...auto,
          _id: match._id,
          title: match.title || auto.title,
          zoomLink: match.zoomLink || auto.zoomLink,
          recordingUrl: match.recordingUrl || '',
          durationMinutes: match.durationMinutes || auto.durationMinutes,
          notes: match.notes || '',
          isAuto: false,
        });
      } else {
        let zoom = auto.zoomLink;
        if (!zoom && auto.trackId) {
          const any = manualRaw.find(
            (m) => m.trackId && String(m.trackId) === String(auto.trackId) && m.zoomLink
          );
          if (any) zoom = any.zoomLink;
        }
        mergedRaw.push({ ...auto, zoomLink: zoom });
      }
    }

    for (const m of manualRaw) {
      if (!usedManual.has(String(m._id))) {
        // Student schedule is driven by weekly slots; keep manuals only for Replay
        if (m.recordingUrl) mergedRaw.push(m);
      }
    }
  }

  const sessions = mergedRaw
    .map((s) => mapSessionFields(s, now, includePrivateLinks))
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));

  return {
    _id: obj._id,
    title: obj.title,
    description: obj.description,
    startDate: obj.startDate,
    endDate: obj.endDate,
    status: obj.status,
    price: obj.price,
    maxSeats: obj.maxSeats,
    coverImage: obj.coverImage,
    tracks: serializeTracks(obj.tracks, includePrivateLinks),
    sessions,
    whatsappLink: includePrivateLinks ? obj.whatsappLink || '' : undefined,
    isPublished: obj.isPublished,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

// ---- Public ----
router.get('/current', async (req, res) => {
  try {
    const cohort = await ensureDefaultCohort();
    res.json({
      status: 'success',
      data: {
        cohort: serializeCohort(cohort, { includePrivateLinks: false, includeAutoSchedule: true }),
      },
    });
  } catch (error) {
    console.error('Club current error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load النادي' });
  }
});

// ---- Student (auth) ----
router.get('/my', requireAuth, async (req, res) => {
  try {
    const cohort = await ensureDefaultCohort();
    const hasAccess = await userHasClubAccess(req.user.id);
    let enrollment = await ClubEnrollment.findOne({
      user: req.user.id,
      cohort: cohort._id,
      status: 'active',
    });

    // Auto-enroll active subscribers into current cohort
    if (hasAccess && !enrollment) {
      enrollment = await ClubEnrollment.findOneAndUpdate(
        { user: req.user.id, cohort: cohort._id },
        {
          user: req.user.id,
          cohort: cohort._id,
          status: 'active',
          source: 'subscription',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const enrolled = !!enrollment && enrollment.status === 'active';
    const includePrivateLinks = hasAccess || enrolled;

    res.json({
      status: 'success',
      data: {
        hasAccess: includePrivateLinks,
        enrolled,
        enrollment,
        cohort: serializeCohort(cohort, { includePrivateLinks, includeAutoSchedule: true }),
      },
    });
  } catch (error) {
    console.error('Club my error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load نادي access' });
  }
});

router.post('/enroll', requireAuth, async (req, res) => {
  try {
    const hasAccess = await userHasClubAccess(req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'يلزم اشتراك نشط للانضمام للنادي',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    const cohort = await ensureDefaultCohort();
    const enrollment = await ClubEnrollment.findOneAndUpdate(
      { user: req.user.id, cohort: cohort._id },
      {
        user: req.user.id,
        cohort: cohort._id,
        status: 'active',
        source: 'subscription',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      status: 'success',
      message: 'تم انضمامك للنادي',
      data: {
        enrollment,
        cohort: serializeCohort(cohort, { includePrivateLinks: true }),
      },
    });
  } catch (error) {
    console.error('Club enroll error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to enroll' });
  }
});

// ---- Admin ----
router.get('/admin/cohorts', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureDefaultCohort();
    const cohorts = await ClubCohort.find().sort({ startDate: -1 });
    res.json({
      status: 'success',
      data: {
        cohorts: cohorts.map((c) => serializeCohort(c, { includePrivateLinks: true })),
      },
    });
  } catch (error) {
    console.error('Admin club list error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to list cohorts' });
  }
});

router.get('/admin/cohorts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const cohort = await ClubCohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ status: 'error', message: 'Cohort not found' });
    }
    res.json({
      status: 'success',
      data: { cohort: serializeCohort(cohort, { includePrivateLinks: true }) },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to load cohort' });
  }
});

router.post('/admin/cohorts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = {
      ...buildDefaultCohort(),
      ...req.body,
      title: req.body.title || 'النادي · دفعة جديدة',
      startDate: req.body.startDate ? new Date(req.body.startDate) : DEFAULT_START,
      endDate: req.body.endDate ? new Date(req.body.endDate) : DEFAULT_END,
    };
    const cohort = await ClubCohort.create(payload);
    res.status(201).json({
      status: 'success',
      data: { cohort: serializeCohort(cohort, { includePrivateLinks: true }) },
    });
  } catch (error) {
    console.error('Create cohort error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to create cohort' });
  }
});

router.put('/admin/cohorts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowed = [
      'title',
      'description',
      'startDate',
      'endDate',
      'status',
      'price',
      'maxSeats',
      'whatsappLink',
      'coverImage',
      'tracks',
      'sessions',
      'isPublished',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const cohort = await ClubCohort.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!cohort) {
      return res.status(404).json({ status: 'error', message: 'Cohort not found' });
    }

    res.json({
      status: 'success',
      data: { cohort: serializeCohort(cohort, { includePrivateLinks: true }) },
    });
  } catch (error) {
    console.error('Update cohort error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to update cohort' });
  }
});

router.delete('/admin/cohorts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const cohort = await ClubCohort.findByIdAndDelete(req.params.id);
    if (!cohort) {
      return res.status(404).json({ status: 'error', message: 'Cohort not found' });
    }
    await ClubEnrollment.deleteMany({ cohort: req.params.id });
    res.json({ status: 'success', message: 'Cohort deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete cohort' });
  }
});

module.exports = router;
