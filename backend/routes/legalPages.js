const express = require('express');
const LegalPage = require('../models/LegalPage');
const { SLUGS, getDefaultPage } = require('../utils/legalDefaults');

const router = express.Router();
const publicRouter = express.Router();

function serialize(page) {
  return {
    slug: page.slug,
    title: page.title,
    subtitle: page.subtitle || '',
    sections: (page.sections || []).map((section) => ({
      id: String(section._id || ''),
      title: section.title || '',
      body: section.body || '',
    })),
    updatedAt: page.updatedAt,
  };
}

async function getOrCreatePage(slug) {
  if (!SLUGS.includes(slug)) return null;
  let page = await LegalPage.findOne({ slug });
  if (!page) {
    page = await LegalPage.create(getDefaultPage(slug));
  }
  return page;
}

async function sendPage(req, res) {
  try {
    const page = await getOrCreatePage(req.params.slug);
    if (!page) {
      return res.status(404).json({ status: 'error', message: 'Page not found' });
    }
    res.json({ status: 'success', data: { page: serialize(page) } });
  } catch (error) {
    console.error('Legal page get error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load page' });
  }
}

router.get('/', async (req, res) => {
  try {
    const pages = [];
    for (const slug of SLUGS) {
      pages.push(serialize(await getOrCreatePage(slug)));
    }
    res.json({ status: 'success', data: { pages } });
  } catch (error) {
    console.error('Legal pages list error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load pages' });
  }
});

publicRouter.get('/:slug', sendPage);
router.get('/:slug', sendPage);

router.put('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!SLUGS.includes(slug)) {
      return res.status(404).json({ status: 'error', message: 'Page not found' });
    }

    const title = String(req.body.title || '').trim();
    const subtitle = String(req.body.subtitle || '').trim();
    const incoming = Array.isArray(req.body.sections) ? req.body.sections : [];
    const sections = incoming
      .map((section) => ({
        title: String(section?.title || '').trim().slice(0, 120),
        body: String(section?.body || '').slice(0, 20000),
      }))
      .filter((section) => section.title || section.body);

    if (!title) {
      return res.status(400).json({ status: 'error', message: 'Title is required' });
    }

    const page = await LegalPage.findOneAndUpdate(
      { slug },
      {
        title: title.slice(0, 80),
        subtitle: subtitle.slice(0, 160),
        sections,
        updatedBy: req.user?._id || req.user?.id || null,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      status: 'success',
      message: 'Page saved',
      data: { page: serialize(page) },
    });
  } catch (error) {
    console.error('Legal page save error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save page' });
  }
});

module.exports = router;
module.exports.publicRouter = publicRouter;
