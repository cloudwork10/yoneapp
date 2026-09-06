const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const CourseProjectSubmission = require('../models/CourseProjectSubmission');
const { resolveProjectRules } = require('../utils/projectRules');

const router = express.Router();

function isHttpUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function readUrl(value, required, label) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    if (required) {
      const error = new Error(`${label} is required`);
      error.statusCode = 400;
      throw error;
    }
    return '';
  }
  if (!isHttpUrl(trimmed)) {
    const error = new Error(`${label} must be a valid http(s) link`);
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
}

function serialize(doc, certificate) {
  if (!doc) return null;
  const course = doc.course && typeof doc.course === 'object' ? doc.course : null;
  const cert = certificate || doc.certificate;
  return {
    _id: doc._id,
    status: doc.status,
    fullName: doc.fullName || '',
    githubUrl: doc.githubUrl || '',
    liveUrl: doc.liveUrl || '',
    videoUrl: doc.videoUrl || '',
    extraUrl: doc.extraUrl || '',
    note: doc.note || '',
    adminNote: doc.adminNote || '',
    createdAt: doc.createdAt,
    reviewedAt: doc.reviewedAt,
    course: course
      ? {
          _id: course._id,
          title: course.title,
          certificateTemplate: course.certificateTemplate || '',
          projectGithubRequired: course.projectGithubRequired !== false,
          projectLiveRequired: course.projectLiveRequired !== false,
        }
      : doc.course,
    user: doc.user,
    certificate: cert && typeof cert === 'object' && cert._id
      ? {
          _id: cert._id,
          code: String(cert._id).slice(-8).toUpperCase(),
          title: cert.title,
          studentName: cert.studentName || doc.fullName || (doc.user && doc.user.name) || '',
          courseTitle: course?.title || '',
          templateUrl: cert.templateUrl || '',
          issuedAt: cert.issuedAt,
        }
      : null,
  };
}

async function issueCertificate(submission) {
  const course = await Course.findById(submission.course).select('title certificateTemplate');
  const user = await User.findById(submission.user).select('name certificates coursesCompleted');
  if (!course || !user) return null;

  const title = `Certificate of Completion · ${course.title}`;
  const studentName = String(submission.fullName || user.name || '').trim();
  const certificate = await Certificate.findOneAndUpdate(
    { user: user._id, course: course._id },
    {
      user: user._id,
      course: course._id,
      studentName,
      title,
      templateUrl: course.certificateTemplate || '',
      issuedAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await User.updateOne(
    { _id: user._id },
    {
      $addToSet: {
        certificates: certificate._id,
        coursesCompleted: course._id,
      },
    }
  );

  submission.certificate = certificate._id;
  return certificate;
}

router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = String(req.query.status || 'pending');
    const filter = ['pending', 'approved', 'rejected'].includes(status) ? { status } : {};
    const submissions = await CourseProjectSubmission.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title category projectKind certificateTemplate projectGithubRequired projectLiveRequired projectVideoRequired projectExtraRequired')
      .populate('certificate')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      status: 'success',
      data: { submissions: submissions.map((item) => serialize(item, item.certificate)) },
    });
  } catch (error) {
    console.error('List project submissions error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.get('/admin/pending-count', requireAuth, requireAdmin, async (req, res) => {
  try {
    const count = await CourseProjectSubmission.countDocuments({ status: 'pending' });
    res.json({ status: 'success', data: { count } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.put('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const action = String(req.body?.action || '').toLowerCase();
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ status: 'error', message: 'action must be approve or reject' });
    }

    const submission = await CourseProjectSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ status: 'error', message: 'Submission not found' });
    }

    submission.status = action === 'approve' ? 'approved' : 'rejected';
    submission.adminNote = String(req.body?.adminNote || '').trim().slice(0, 500);
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    let certificate = null;
    if (action === 'approve') {
      certificate = await issueCertificate(submission);
    } else {
      submission.certificate = null;
    }
    await submission.save();

    const populated = await CourseProjectSubmission.findById(submission._id)
      .populate('user', 'name email')
      .populate('course', 'title category projectKind certificateTemplate projectGithubRequired projectLiveRequired projectVideoRequired projectExtraRequired')
      .populate('certificate');

    res.json({
      status: 'success',
      message: action === 'approve' ? 'Certificate issued' : 'Submission rejected',
      data: { submission: serialize(populated, certificate || populated.certificate) },
    });
  } catch (error) {
    console.error('Review project submission error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.get('/:courseId/mine', requireAuth, async (req, res) => {
  try {
    const submission = await CourseProjectSubmission.findOne({
      user: req.user._id,
      course: req.params.courseId,
    })
      .populate('certificate')
      .populate('user', 'name email');

    const course = await Course.findById(req.params.courseId)
      .select('title category projectKind certificateTemplate projectGithubRequired projectLiveRequired projectVideoRequired projectExtraRequired challenges')
      .lean();

    res.json({
      status: 'success',
      data: {
        submission: serialize(submission, submission?.certificate),
        courseRules: course ? resolveProjectRules(course) : null,
      },
    });
  } catch (error) {
    console.error('Get my project submission error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.post('/:courseId', requireAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select(
      '_id isActive title category projectKind projectGithubRequired projectLiveRequired projectVideoRequired projectExtraRequired'
    );
    if (!course || course.isActive === false) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    const fullName = String(req.body?.fullName || '').trim().replace(/\s+/g, ' ');
    if (fullName.split(' ').filter(Boolean).length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Write your first and last name',
      });
    }

    const rules = resolveProjectRules(course);
    const githubUrl = readUrl(req.body?.githubUrl, rules.githubRequired, 'GitHub link');
    const liveUrl = readUrl(req.body?.liveUrl, rules.liveRequired, 'Live project link');
    const videoUrl = readUrl(req.body?.videoUrl, rules.videoRequired, 'Walkthrough video');
    const extraUrl = readUrl(req.body?.extraUrl, rules.extraRequired, 'Portfolio / Figma / dashboard');

    if (!githubUrl && !liveUrl && !videoUrl && !extraUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Add at least one project link',
      });
    }

    const note = String(req.body?.note || '').trim().slice(0, 500);
    const existing = await CourseProjectSubmission.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (existing?.status === 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'This project is already approved',
      });
    }

    if (existing) {
      existing.fullName = fullName;
      existing.githubUrl = githubUrl;
      existing.liveUrl = liveUrl;
      existing.videoUrl = videoUrl;
      existing.extraUrl = extraUrl;
      existing.note = note;
      existing.status = 'pending';
      existing.adminNote = '';
      existing.reviewedBy = null;
      existing.reviewedAt = null;
      existing.certificate = null;
      await existing.save();
      return res.json({
        status: 'success',
        message: 'Project submitted for review',
        data: { submission: serialize(existing) },
      });
    }

    const created = await CourseProjectSubmission.create({
      user: req.user._id,
      course: course._id,
      fullName,
      githubUrl,
      liveUrl,
      videoUrl,
      extraUrl,
      note,
    });

    res.status(201).json({
      status: 'success',
      message: 'Project submitted for review',
      data: { submission: serialize(created) },
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    console.error('Submit project error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
