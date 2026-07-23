const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const { getUploadRoot } = require('../utils/uploadDirs');
const SubscriptionRequest = require('../models/SubscriptionRequest');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendPushToUser } = require('../services/pushNotifications');

const router = express.Router();

const PLANS = {
  monthly: { name: 'Monthly Plan', price: 99, duration: 30 },
  quarterly: { name: 'Quarterly Plan', price: 199, duration: 90 },
  'semi-annual': { name: 'Semi-Annual Plan', price: 299, duration: 180 },
  annual: { name: 'Annual Plan', price: 499, duration: 365 },
};

const MANUAL_PAYMENT_INFO = {
  whatsapp: process.env.WHATSAPP_NUMBER || '01064663594',
  vodafoneCash: process.env.VODAFONE_CASH_NUMBER || '01064663594',
  instapay: process.env.INSTAPAY_NUMBER || '01032311716',
  methods: ['Vodafone Cash', 'InstaPay'],
  note:
    process.env.MANUAL_PAYMENT_NOTE ||
    'حوّل المبلغ على فودافون كاش أو InstaPay، ارفع السكرين، وهيتفعل بعد المراجعة.',
};

function buildUploadUrl(req, folder, filename) {
  const host = req.get('host');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const baseUrl = host
    ? `${proto}://${host}`
    : process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/$/, '')}/uploads/${folder}/${filename}`;
}

function makeReferenceCode() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ELN-${Date.now().toString().slice(-6)}-${rand}`;
}

function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(getUploadRoot(), 'images');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `receipt-${unique}${ext}`);
  },
});

const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image receipts are allowed'), false);
  },
});

router.get('/manual-info', requireAuth, (req, res) => {
  res.json({
    status: 'success',
    data: {
      ...MANUAL_PAYMENT_INFO,
      plans: Object.entries(PLANS).map(([id, plan]) => ({
        id,
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
      })),
    },
  });
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const pending = await SubscriptionRequest.findOne({
      user: req.user.id,
      status: 'pending',
    }).sort({ createdAt: -1 });

    const latest = await SubscriptionRequest.findOne({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { pending, latest },
    });
  } catch (error) {
    console.error('Get my subscription requests error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load requests' });
  }
});

router.get('/admin/pending-count', requireAuth, requireAdmin, async (req, res) => {
  try {
    const count = await SubscriptionRequest.countDocuments({ status: 'pending' });
    res.json({ status: 'success', data: { count } });
  } catch (error) {
    console.error('Pending count error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to count requests' });
  }
});

router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = String(req.query.status || 'pending').trim();
    const filter = status === 'all' ? {} : { status };
    const requests = await SubscriptionRequest.find(filter)
      .populate('user', 'name email avatar')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    const pendingCount = await SubscriptionRequest.countDocuments({ status: 'pending' });

    res.json({ status: 'success', data: { requests, pendingCount } });
  } catch (error) {
    console.error('Admin list subscription requests error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load requests' });
  }
});

router.post(
  '/',
  requireAuth,
  uploadLimiter,
  uploadReceipt.single('receipt'),
  async (req, res) => {
    try {
      const plan = String(req.body.plan || '').trim();
      const userNote = String(req.body.userNote || '').trim().slice(0, 500);
      const planDetails = PLANS[plan];

      if (!planDetails) {
        return res.status(400).json({ status: 'error', message: 'Invalid plan' });
      }
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Receipt screenshot is required',
        });
      }

      const activeSub = await Subscription.findOne({
        user: req.user.id,
        status: 'active',
        endDate: { $gt: new Date() },
      });
      if (activeSub) {
        return res.status(400).json({
          status: 'error',
          message: 'You already have an active subscription',
        });
      }

      const existingPending = await SubscriptionRequest.findOne({
        user: req.user.id,
        status: 'pending',
      });
      if (existingPending) {
        return res.status(400).json({
          status: 'error',
          message: 'You already have a pending request. Wait for review or cancel it first.',
          data: { request: existingPending },
        });
      }

      const receiptHash = hashFile(req.file.path);
      const duplicate = await SubscriptionRequest.findOne({
        receiptHash,
        status: { $in: ['pending', 'approved'] },
      });
      if (duplicate) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
        return res.status(400).json({
          status: 'error',
          message: 'This receipt was already used. Upload a new transfer screenshot.',
          code: 'DUPLICATE_RECEIPT',
        });
      }

      const receiptUrl = buildUploadUrl(req, 'images', req.file.filename);
      const requestDoc = await SubscriptionRequest.create({
        user: req.user.id,
        plan,
        price: planDetails.price,
        receiptUrl,
        receiptHash,
        referenceCode: makeReferenceCode(),
        userNote,
        status: 'pending',
      });

      res.status(201).json({
        status: 'success',
        message: 'Subscription request submitted. We will activate after review.',
        data: { request: requestDoc },
      });
    } catch (error) {
      console.error('Create subscription request error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to submit request',
      });
    }
  }
);

router.post('/admin/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await SubscriptionRequest.findById(req.params.id).populate('user', 'name email');
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }
    if (doc.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Request is already ${doc.status}`,
      });
    }

    const planDetails = PLANS[doc.plan];
    if (!planDetails) {
      return res.status(400).json({ status: 'error', message: 'Invalid plan on request' });
    }

    const userId = doc.user._id || doc.user;
    const existingActive = await Subscription.findOne({
      user: userId,
      status: 'active',
      endDate: { $gt: new Date() },
    });
    if (existingActive) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has an active subscription',
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDetails.duration);

    const subscription = await Subscription.create({
      user: userId,
      plan: doc.plan,
      status: 'active',
      startDate,
      endDate,
      autoRenew: false,
      price: doc.price,
      currency: doc.currency || 'EGP',
      paymentMethod: 'manual',
      paymobOrderId: `MANUAL_${doc.referenceCode}`,
      paymobTransactionId: doc.referenceCode,
      isSubscriptionActive: true,
    });

    doc.status = 'approved';
    doc.adminNote = String(req.body.adminNote || '').trim().slice(0, 500);
    doc.reviewedBy = req.user.id;
    doc.reviewedAt = new Date();
    doc.subscription = subscription._id;
    await doc.save();

    const pushUser = await User.findById(userId).select('pushToken name email');
    const pushResult = await sendPushToUser(pushUser, {
      title: 'تم تفعيل الاشتراك ✅',
      body: `اشتراك ${planDetails.name} أصبح نشطًا. افتح التطبيق واستمتع بالمحتوى.\nYour ${planDetails.name} is now active.`,
      data: {
        type: 'subscription_approved',
        requestId: String(doc._id),
        referenceCode: doc.referenceCode,
        plan: doc.plan,
      },
    });
    if (!pushResult?.ok) {
      console.warn('Subscription approve push not delivered:', pushResult?.reason || pushResult);
    }

    res.json({
      status: 'success',
      message: 'Subscription activated',
      data: {
        request: doc,
        subscription,
        pushSent: !!pushResult?.ok,
      },
    });
  } catch (error) {
    console.error('Approve subscription request error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to approve request',
    });
  }
});

router.post('/admin/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await SubscriptionRequest.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }
    if (doc.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Request is already ${doc.status}`,
      });
    }

    const note = String(req.body.adminNote || 'Rejected').trim().slice(0, 500);
    doc.status = 'rejected';
    doc.adminNote = note;
    doc.reviewedBy = req.user.id;
    doc.reviewedAt = new Date();
    await doc.save();

    const pushUser = await User.findById(doc.user).select('pushToken name email');
    await sendPushToUser(pushUser, {
      title: 'طلب الاشتراك مرفوض',
      body: note
        ? `سبب الرفض: ${note}`
        : 'تم رفض طلب الاشتراك. راجع السكرين أو تواصل مع الدعم.',
      data: {
        type: 'subscription_rejected',
        requestId: String(doc._id),
        referenceCode: doc.referenceCode,
      },
    });

    res.json({
      status: 'success',
      message: 'Request rejected',
      data: { request: doc },
    });
  } catch (error) {
    console.error('Reject subscription request error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to reject request' });
  }
});

router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const doc = await SubscriptionRequest.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'pending',
    });
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Pending request not found' });
    }
    doc.status = 'cancelled';
    await doc.save();
    res.json({ status: 'success', message: 'Request cancelled', data: { request: doc } });
  } catch (error) {
    console.error('Cancel subscription request error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to cancel request' });
  }
});

module.exports = router;
