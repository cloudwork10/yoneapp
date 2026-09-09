const Setting = require('../models/Setting');

const ROADMAP_CATEGORIES_KEY = 'roadmapCategories';
const DEFAULT_ROADMAP_CATEGORIES = [
  { id: 'Frontend', name: 'Frontend', icon: '💻' },
  { id: 'Backend', name: 'Backend', icon: '⚙️' },
  { id: 'Full Stack', name: 'Full Stack', icon: '🔄' },
  { id: 'Mobile', name: 'Mobile', icon: '📱' },
  { id: 'DevOps', name: 'DevOps', icon: '🔧' },
  { id: 'Data Science', name: 'Data Science', icon: '📊' },
  { id: 'AI/ML', name: 'AI/ML', icon: '🤖' },
];

const FALLBACK_ICONS = ['📁', '🎯', '📈', '🧠', '🛠️', '💼', '📣', '🌟'];

function normalizeRoadmapCategoryName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

function defaultIconFor(name, index = 0) {
  const known = DEFAULT_ROADMAP_CATEGORIES.find(
    (item) => item.name.toLowerCase() === String(name || '').toLowerCase()
  );
  return known?.icon || FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

function normalizeRoadmapCategoryList(list) {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(list) ? list : []) {
    const name = normalizeRoadmapCategoryName(item?.name || item?.id || item);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: name,
      name,
      icon: String(item?.icon || '').trim() || defaultIconFor(name, out.length),
    });
  }
  return out;
}

async function getStoredRoadmapCategories() {
  const setting = await Setting.findOne({ key: ROADMAP_CATEGORIES_KEY });
  if (setting && Array.isArray(setting.value) && setting.value.length) {
    const stored = normalizeRoadmapCategoryList(setting.value);
    if (stored.length) return stored;
  }
  return DEFAULT_ROADMAP_CATEGORIES;
}

async function saveRoadmapCategories(list) {
  const categories = normalizeRoadmapCategoryList(list);
  await Setting.findOneAndUpdate(
    { key: ROADMAP_CATEGORIES_KEY },
    { value: categories },
    { upsert: true, new: true }
  );
  return categories;
}

module.exports = {
  ROADMAP_CATEGORIES_KEY,
  DEFAULT_ROADMAP_CATEGORIES,
  normalizeRoadmapCategoryName,
  normalizeRoadmapCategoryList,
  getStoredRoadmapCategories,
  saveRoadmapCategories,
};
