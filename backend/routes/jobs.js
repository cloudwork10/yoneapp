const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();

const cvStorage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/cvs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `cv-${unique}${path.extname(file.originalname) || '.pdf'}`);
  },
});

const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

function serializeJob(doc, { includePrivate = false } = {}) {
  const o = doc.toObject ? doc.toObject() : doc;
  const base = {
    _id: o._id,
    title: o.title,
    companyName: o.companyName,
    companyLogo: o.companyLogo || '',
    companyWebsite: o.companyWebsite || '',
    location: o.location || '',
    type: o.type,
    workMode: o.workMode,
    description: o.description,
    requirements: o.requirements || '',
    salaryRange: o.salaryRange || '',
    applyType: o.applyType,
    applyUrl: o.applyType === 'external' ? o.applyUrl || '' : '',
    accessType: o.accessType || 'free',
    source: o.source,
    sourceName: o.sourceName || '',
    approvalStatus: o.approvalStatus,
    isActive: o.isActive !== false,
    isFeatured: !!o.isFeatured,
    expiresAt: o.expiresAt,
    applicationsCount: o.applicationsCount || 0,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };

  if (includePrivate) {
    base.companyEmail = o.companyEmail || '';
    base.rejectionReason = o.rejectionReason || '';
    base.postedBy = o.postedBy;
    base.reviewedBy = o.reviewedBy;
    base.reviewedAt = o.reviewedAt;
  }

  return base;
}

function isExpired(job) {
  return job.expiresAt && new Date(job.expiresAt).getTime() < Date.now();
}

function normalizeType(value) {
  return ['full-time', 'part-time', 'internship', 'freelance'].includes(value)
    ? value
    : 'full-time';
}

function normalizeWorkMode(value) {
  return ['remote', 'hybrid', 'onsite'].includes(value) ? value : 'remote';
}

// ——— Public list ———
router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const type = String(req.query.type || '').toLowerCase();
    const workMode = String(req.query.workMode || '').toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const filter = {
      approvalStatus: 'approved',
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };

    if (type && type !== 'all') filter.type = type;
    if (workMode && workMode !== 'all') filter.workMode = workMode;

    let query = Job.find(filter);
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { companyName: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
      ];
      // Replace previous $or for expiry with $and
      delete filter.$or;
      query = Job.find({
        approvalStatus: 'approved',
        isActive: true,
        ...(type && type !== 'all' ? { type } : {}),
        ...(workMode && workMode !== 'all' ? { workMode } : {}),
        $and: [
          { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
          {
            $or: [
              { title: new RegExp(q, 'i') },
              { companyName: new RegExp(q, 'i') },
              { description: new RegExp(q, 'i') },
            ],
          },
        ],
      });
    }

    const jobs = await query.sort({ isFeatured: -1, createdAt: -1 }).limit(limit);

    res.json({
      status: 'success',
      data: { jobs: jobs.map((j) => serializeJob(j)) },
    });
  } catch (error) {
    console.error('Jobs list error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load jobs' });
  }
});

// ——— Upload CV PDF (authenticated students) ———
router.post(
  '/upload-cv',
  requireAuth,
  uploadLimiter,
  (req, res, next) => {
    uploadCv.single('cv')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message || 'Failed to upload CV',
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No PDF file provided',
        });
      }

      const host = req.get('host');
      const protocol = req.protocol || 'http';
      const baseUrl =
        process.env.BASE_URL ||
        (host ? `${protocol}://${host}` : `http://localhost:${process.env.PORT || 3000}`);
      const cvUrl = `${baseUrl.replace(/\/$/, '')}/uploads/cvs/${req.file.filename}`;

      res.status(201).json({
        status: 'success',
        message: 'CV uploaded',
        data: {
          cvUrl,
          filename: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error('CV upload error:', error);
      res.status(500).json({ status: 'error', message: 'Failed to upload CV' });
    }
  }
);

// ——— Student applications (before /:id) ———
router.get('/me/applications', requireAuth, async (req, res) => {
  try {
    const apps = await JobApplication.find({ user: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        applications: apps.map((a) => ({
          _id: a._id,
          status: a.status,
          coverNote: a.coverNote,
          createdAt: a.createdAt,
          job: a.job ? serializeJob(a.job) : null,
        })),
      },
    });
  } catch (error) {
    console.error('My applications error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load applications' });
  }
});

// ——— Company routes (before /:id) ———
router.post('/company', requireAuth, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const companyName = String(req.body.companyName || '').trim();
    const description = String(req.body.description || '').trim();

    if (!title || !companyName || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, company name, and description are required',
      });
    }

    const companyEmail = String(req.body.companyEmail || req.user.email || '').trim();
    if (companyEmail && !companyEmail.includes('@')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid company email',
      });
    }

    const job = await Job.create({
      title,
      companyName,
      companyLogo: String(req.body.companyLogo || '').trim(),
      companyEmail,
      companyWebsite: String(req.body.companyWebsite || '').trim(),
      location: String(req.body.location || 'Egypt').trim(),
      type: normalizeType(req.body.type),
      workMode: normalizeWorkMode(req.body.workMode),
      description,
      requirements: String(req.body.requirements || '').trim(),
      salaryRange: String(req.body.salaryRange || '').trim(),
      applyType: req.body.applyType === 'external' ? 'external' : 'internal',
      applyUrl: String(req.body.applyUrl || '').trim(),
      accessType: 'free',
      source: 'company',
      approvalStatus: 'pending',
      isActive: true,
      postedBy: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Job submitted for admin approval',
      data: { job: serializeJob(job, { includePrivate: true }) },
    });
  } catch (error) {
    console.error('Company job submit error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit job' });
  }
});

router.get('/company/mine', requireAuth, async (req, res) => {
  try {
    // Any jobs this user posted (company form or otherwise)
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({
      status: 'success',
      data: { jobs: jobs.map((j) => serializeJob(j, { includePrivate: true })) },
    });
  } catch (error) {
    console.error('Company my jobs error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load your jobs' });
  }
});

function serializeApplication(a) {
  return {
    _id: a._id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    coverNote: a.coverNote,
    cvUrl: a.cvUrl,
    status: a.status,
    createdAt: a.createdAt,
    user: a.user,
  };
}

async function userCanViewJobApplications(req, job) {
  if (!job) return false;
  if (req.user?.isAdmin) return true;
  if (job.postedBy && String(job.postedBy) === String(req.user.id)) return true;
  return false;
}

/** Applicants for a job — job owner OR admin */
router.get('/:id/applications', requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }
    if (!(await userCanViewJobApplications(req, job))) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the job owner can view applications',
      });
    }

    const apps = await JobApplication.find({ job: job._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        job: serializeJob(job, { includePrivate: true }),
        applications: apps.map(serializeApplication),
      },
    });
  } catch (error) {
    console.error('Job applications error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load applications' });
  }
});

// ——— Admin routes (before /:id) ———
router.post('/admin/sync-feed', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { refreshJobFeed } = require('../services/jobFeed');
    const result = await refreshJobFeed();
    res.json({
      status: 'success',
      message: 'Job feed refreshed',
      data: result,
    });
  } catch (error) {
    console.error('Job feed sync error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to refresh job feed' });
  }
});

router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = String(req.query.status || 'all').toLowerCase();
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(status)) {
      filter.approvalStatus = status;
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(400);
    res.json({
      status: 'success',
      data: { jobs: jobs.map((j) => serializeJob(j, { includePrivate: true })) },
    });
  } catch (error) {
    console.error('Admin jobs list error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load jobs' });
  }
});

router.post('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const companyName = String(req.body.companyName || '').trim();
    const description = String(req.body.description || '').trim();

    if (!title || !companyName || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, company name, and description are required',
      });
    }

    const companyEmail = String(req.body.companyEmail || '').trim();
    if (companyEmail && !companyEmail.includes('@')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid company email',
      });
    }

    const job = await Job.create({
      title,
      companyName,
      companyLogo: String(req.body.companyLogo || '').trim(),
      companyEmail,
      companyWebsite: String(req.body.companyWebsite || '').trim(),
      location: String(req.body.location || 'Egypt').trim(),
      type: normalizeType(req.body.type),
      workMode: normalizeWorkMode(req.body.workMode),
      description,
      requirements: String(req.body.requirements || '').trim(),
      salaryRange: String(req.body.salaryRange || '').trim(),
      applyType: req.body.applyType === 'external' ? 'external' : 'internal',
      applyUrl: String(req.body.applyUrl || '').trim(),
      accessType: req.body.accessType === 'premium' ? 'premium' : 'free',
      source: 'admin',
      approvalStatus: 'approved',
      isActive: req.body.isActive !== false,
      isFeatured: !!req.body.isFeatured,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      postedBy: req.user.id,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    res.status(201).json({
      status: 'success',
      data: { job: serializeJob(job, { includePrivate: true }) },
    });
  } catch (error) {
    console.error('Admin create job error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create job' });
  }
});

router.put('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    const fields = [
      'title',
      'companyName',
      'companyLogo',
      'companyEmail',
      'companyWebsite',
      'location',
      'description',
      'requirements',
      'salaryRange',
      'applyUrl',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) job[f] = String(req.body[f]).trim();
    });

    if (req.body.type) job.type = normalizeType(req.body.type);
    if (req.body.workMode) job.workMode = normalizeWorkMode(req.body.workMode);
    if (req.body.applyType === 'external' || req.body.applyType === 'internal') {
      job.applyType = req.body.applyType;
    }
    if (req.body.accessType === 'premium' || req.body.accessType === 'free') {
      job.accessType = req.body.accessType;
    }
    if (typeof req.body.isActive === 'boolean') job.isActive = req.body.isActive;
    if (typeof req.body.isFeatured === 'boolean') job.isFeatured = req.body.isFeatured;
    if (req.body.expiresAt !== undefined) {
      job.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    }

    await job.save();
    res.json({
      status: 'success',
      data: { job: serializeJob(job, { includePrivate: true }) },
    });
  } catch (error) {
    console.error('Admin update job error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update job' });
  }
});

router.post('/admin/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    job.approvalStatus = 'approved';
    job.rejectionReason = '';
    job.reviewedBy = req.user.id;
    job.reviewedAt = new Date();
    job.isActive = true;
    await job.save();

    res.json({
      status: 'success',
      message: 'Job approved',
      data: { job: serializeJob(job, { includePrivate: true }) },
    });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to approve job' });
  }
});

router.post('/admin/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    job.approvalStatus = 'rejected';
    job.rejectionReason = String(req.body.reason || '').trim();
    job.reviewedBy = req.user.id;
    job.reviewedAt = new Date();
    job.isActive = false;
    await job.save();

    res.json({
      status: 'success',
      message: 'Job rejected',
      data: { job: serializeJob(job, { includePrivate: true }) },
    });
  } catch (error) {
    console.error('Reject job error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to reject job' });
  }
});

router.delete('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }
    await JobApplication.deleteMany({ job: job._id });
    res.json({ status: 'success', message: 'Job deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete job' });
  }
});

router.get('/admin/:id/applications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const apps = await JobApplication.find({ job: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        applications: apps.map((a) => ({
          _id: a._id,
          name: a.name,
          email: a.email,
          phone: a.phone,
          coverNote: a.coverNote,
          cvUrl: a.cvUrl,
          status: a.status,
          createdAt: a.createdAt,
          user: a.user,
        })),
      },
    });
  } catch (error) {
    console.error('Job applications error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load applications' });
  }
});

// ——— Public detail + apply ———
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (
      !job ||
      job.approvalStatus !== 'approved' ||
      job.isActive === false ||
      isExpired(job)
    ) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }
    res.json({ status: 'success', data: { job: serializeJob(job) } });
  } catch (error) {
    console.error('Job detail error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load job' });
  }
});

router.post('/:id/apply', requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (
      !job ||
      job.approvalStatus !== 'approved' ||
      job.isActive === false ||
      isExpired(job)
    ) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    if (job.applyType === 'external') {
      return res.status(400).json({
        status: 'error',
        message: 'This job uses an external apply link',
        data: { applyUrl: job.applyUrl },
      });
    }

    const existing = await JobApplication.findOne({
      job: job._id,
      user: req.user.id,
    });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'You already applied to this job',
      });
    }

    const name = String(req.body.name || req.user.name || '').trim();
    const email = String(req.body.email || req.user.email || '')
      .trim()
      .toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const coverNote = String(req.body.coverNote || '').trim();
    const cvUrl = String(req.body.cvUrl || '').trim();

    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required',
      });
    }

    if (!cvUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'CV PDF is required',
      });
    }

    const application = await JobApplication.create({
      job: job._id,
      user: req.user.id,
      name,
      email,
      phone,
      coverNote,
      cvUrl,
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    res.status(201).json({
      status: 'success',
      message: 'Application submitted — visible to the job owner in the app',
      data: {
        application,
        jobTitle: job.title,
        companyName: job.companyName,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'You already applied to this job',
      });
    }
    console.error('Job apply error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to apply' });
  }
});

module.exports = router;
