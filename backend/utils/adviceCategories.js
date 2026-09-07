const Setting = require('../models/Setting');

const ADVICE_CATEGORIES_KEY = 'adviceCategories';
const DEFAULT_ADVICE_CATEGORIES = [
  { id: 'career-shift', name: 'Career Change' },
  { id: 'kids', name: 'Kids & Family' },
  { id: 'motivation', name: 'Motivation' },
  { id: 'success', name: 'Success Tips' },
  { id: 'programming', name: 'Programming' },
  { id: 'business', name: 'Business' },
];

function normalizeAdviceCategoryId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, '')
    .slice(0, 40);
}

function normalizeAdviceCategoryName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

function normalizeAdviceCategoryList(list) {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(list) ? list : []) {
    const id = normalizeAdviceCategoryId(item?.id || item?.name || item);
    const name = normalizeAdviceCategoryName(item?.name || item?.id || item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name: name || id });
  }
  return out;
}

async function getStoredAdviceCategories() {
  const setting = await Setting.findOne({ key: ADVICE_CATEGORIES_KEY });
  if (setting && Array.isArray(setting.value)) {
    return normalizeAdviceCategoryList(setting.value);
  }
  return DEFAULT_ADVICE_CATEGORIES;
}

async function saveAdviceCategories(list) {
  const categories = normalizeAdviceCategoryList(list);
  await Setting.findOneAndUpdate(
    { key: ADVICE_CATEGORIES_KEY },
    { value: categories },
    { upsert: true, new: true }
  );
  return categories;
}

module.exports = {
  ADVICE_CATEGORIES_KEY,
  DEFAULT_ADVICE_CATEGORIES,
  normalizeAdviceCategoryId,
  normalizeAdviceCategoryName,
  normalizeAdviceCategoryList,
  getStoredAdviceCategories,
  saveAdviceCategories,
};
