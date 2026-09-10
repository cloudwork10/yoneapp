const express = require('express');
const mongoose = require('mongoose');
const { requireAuth } = require('../middleware/auth');
const ContentWatch = require('../models/ContentWatch');

const router = express.Router();

const KINDS = new Set(['course_lesson', 'podcast_episode']);

function currentUserId(req) {
  return req.user?.id || req.user?._id || null;
}

function cleanKind(value) {
  const kind = String(value || '').trim();
  return KINDS.has(kind) ? kind : '';
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = currentUserId(req);
    const kind = cleanKind(req.query.kind);
    const parentId = String(req.query.parentId || '').trim();
    const filter = { user: userId, notified: { $ne: true } };
    if (kind) filter.kind = kind;
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      filter.parentId = parentId;
    }
    const watches = await ContentWatch.find(filter).select('kind parentId itemKey title notified');
    res.json({
      status: 'success',
      data: {
        watches,
        itemKeys: watches.map((watch) => watch.itemKey),
      },
    });
  } catch (error) {
    console.error('List content watches error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load reminders' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = currentUserId(req);
    const kind = cleanKind(req.body.kind);
    const parentId = String(req.body.parentId || '').trim();
    const itemKey = String(req.body.itemKey || '').trim();
    const title = String(req.body.title || '').trim().slice(0, 200);
    const parentTitle = String(req.body.parentTitle || '').trim().slice(0, 200);

    if (!kind || !parentId || !itemKey || !mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ status: 'error', message: 'kind, parentId, and itemKey are required' });
    }

    const watch = await ContentWatch.findOneAndUpdate(
      { user: userId, kind, parentId, itemKey },
      {
        $set: {
          title,
          parentTitle,
          notified: false,
          notifiedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      status: 'success',
      data: { watch },
    });
  } catch (error) {
    console.error('Save content watch error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save reminder' });
  }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    const userId = currentUserId(req);
    const kind = cleanKind(req.body.kind || req.query.kind);
    const parentId = String(req.body.parentId || req.query.parentId || '').trim();
    const itemKey = String(req.body.itemKey || req.query.itemKey || '').trim();

    if (!kind || !parentId || !itemKey) {
      return res.status(400).json({ status: 'error', message: 'kind, parentId, and itemKey are required' });
    }

    await ContentWatch.deleteOne({ user: userId, kind, parentId, itemKey });
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Delete content watch error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to remove reminder' });
  }
});

module.exports = router;
