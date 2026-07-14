const express = require('express');
const TechNews = require('../models/TechNews');
const { refreshTechNews, enrichMissingImages } = require('../services/techNewsFetcher');
const { getOrCreateExplain } = require('../services/techNewsExplainer');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
let imageEnrichRunning = false;

function serialize(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    _id: o._id,
    title: o.title,
    summary: o.summary || '',
    summaryAr: o.summaryAr || '',
    url: o.url,
    image: o.image || '',
    source: o.source || 'Tech',
    category: o.category || 'general',
    publishedAt: o.publishedAt,
    isAuto: !!o.isAuto,
    isPinned: !!o.isPinned,
    isHidden: !!o.isHidden,
    isActive: o.isActive !== false,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function kickImageEnrich(limit = 30) {
  if (imageEnrichRunning) return;
  imageEnrichRunning = true;
  enrichMissingImages(limit)
    .then((r) => {
      if (r.filled) console.log(`🖼️ Background images filled: ${r.filled}/${r.checked}`);
    })
    .catch((e) => console.warn('Background image enrich failed:', e.message))
    .finally(() => {
      imageEnrichRunning = false;
    });
}

// Public list
router.get('/', async (req, res) => {
  try {
    const category = String(req.query.category || '').toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 40, 100);
    const filter = { isActive: true, isHidden: false };
    if (category && category !== 'all') filter.category = category;

    let items = await TechNews.find(filter)
      .sort({ isPinned: -1, publishedAt: -1 })
      .limit(limit);

    // Soft refresh if empty / stale (> 6h)
    const newest = items[0]?.publishedAt ? new Date(items[0].publishedAt).getTime() : 0;
    const stale = Date.now() - newest > 6 * 60 * 60 * 1000;
    if (items.length === 0) {
      // First load: wait so the app gets stories immediately
      try {
        await refreshTechNews();
        items = await TechNews.find(filter)
          .sort({ isPinned: -1, publishedAt: -1 })
          .limit(limit);
      } catch (e) {
        console.warn('Tech news first refresh failed:', e.message);
      }
    } else if (items.length < 5 || stale) {
      refreshTechNews().catch((e) => console.warn('Background tech news refresh failed:', e.message));
    }

    const missingImages = items.filter((i) => !i.image).length;
    if (missingImages > 0) {
      kickImageEnrich(Math.min(40, missingImages + 10));
    }

    res.json({
      status: 'success',
      data: { news: items.map(serialize) },
    });
  } catch (error) {
    console.error('Tech news list error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load tech news' });
  }
});

// ELNADY fun Arabic explainer (cached)
router.get('/:id/explain', async (req, res) => {
  try {
    const item = await TechNews.findById(req.params.id);
    if (!item || item.isHidden || item.isActive === false) {
      return res.status(404).json({ status: 'error', message: 'News not found' });
    }
    const summaryAr = await getOrCreateExplain(item);
    res.json({
      status: 'success',
      data: {
        _id: item._id,
        title: item.title,
        source: item.source,
        category: item.category,
        url: item.url,
        summaryAr,
      },
    });
  } catch (error) {
    console.error('Tech news explain error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Explain failed' });
  }
});

// Admin list (includes hidden)
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const items = await TechNews.find({})
      .sort({ isPinned: -1, publishedAt: -1 })
      .limit(150);
    res.json({ status: 'success', data: { news: items.map(serialize) } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Manual refresh
router.post('/admin/refresh', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await refreshTechNews();
    const filled = result?.images?.filled || 0;
    res.json({
      status: 'success',
      message: `Imported ${result.imported} new items · filled ${filled} images`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Refresh failed' });
  }
});

// Create manual news
router.post('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, summary, url, image, source, category } = req.body;
    if (!title || !url) {
      return res.status(400).json({ status: 'error', message: 'title and url are required' });
    }
    const item = await TechNews.create({
      title: String(title).trim(),
      summary: String(summary || '').trim(),
      url: String(url).trim(),
      image: String(image || '').trim(),
      source: String(source || 'ELNADY').trim(),
      category: category || 'general',
      publishedAt: new Date(),
      isAuto: false,
      isPinned: !!req.body.isPinned,
      isHidden: false,
      isActive: true,
      createdBy: req.user.id,
    });
    res.status(201).json({ status: 'success', data: { news: serialize(item) } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update flags / fields
router.put('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowed = [
      'title',
      'summary',
      'summaryAr',
      'url',
      'image',
      'source',
      'category',
      'isPinned',
      'isHidden',
      'isActive',
      'publishedAt',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const item = await TechNews.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: { news: serialize(item) } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await TechNews.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
