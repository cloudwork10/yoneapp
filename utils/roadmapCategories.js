import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

export const ROADMAP_CATEGORIES_STORAGE_KEY = 'roadmap_categories_v1';

export const DEFAULT_ROADMAP_CATEGORIES = [
  { id: 'Frontend', name: 'Frontend', icon: '💻' },
  { id: 'Backend', name: 'Backend', icon: '⚙️' },
  { id: 'Full Stack', name: 'Full Stack', icon: '🔄' },
  { id: 'Mobile', name: 'Mobile', icon: '📱' },
  { id: 'DevOps', name: 'DevOps', icon: '🔧' },
  { id: 'Data Science', name: 'Data Science', icon: '📊' },
  { id: 'AI/ML', name: 'AI/ML', icon: '🤖' },
];

const FALLBACK_ICONS = ['📁', '🎯', '📈', '🧠', '🛠️', '💼', '📣', '🌟'];

export function normalizeRoadmapCategoryName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

export function mergeRoadmapCategories(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list || []) {
      const name = normalizeRoadmapCategoryName(item?.name || item?.id || item);
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const known = DEFAULT_ROADMAP_CATEGORIES.find((entry) => entry.name.toLowerCase() === key);
      out.push({
        id: name,
        name,
        icon: String(item?.icon || '').trim() || known?.icon || FALLBACK_ICONS[out.length % FALLBACK_ICONS.length],
      });
    }
  }
  return out;
}

export function roadmapCategoryMeta(id, index = 0, name, icon) {
  const label = normalizeRoadmapCategoryName(name || id);
  const known = DEFAULT_ROADMAP_CATEGORIES.find(
    (item) => item.id.toLowerCase() === String(id || '').toLowerCase()
  );
  return {
    id: label || id,
    name: label || known?.name || id,
    icon: icon || known?.icon || FALLBACK_ICONS[index % FALLBACK_ICONS.length],
  };
}

export async function readLocalRoadmapCategories() {
  try {
    const raw = await AsyncStorage.getItem(ROADMAP_CATEGORIES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? mergeRoadmapCategories(parsed) : null;
  } catch {
    return null;
  }
}

export async function writeLocalRoadmapCategories(list) {
  const next = mergeRoadmapCategories(list);
  await AsyncStorage.setItem(ROADMAP_CATEGORIES_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function fetchPublicRoadmapCategories() {
  const response = await fetch(`${API_BASE_URL}/api/public/content/roadmap-categories`);
  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data?.data?.categories)
    ? mergeRoadmapCategories(data.data.categories)
    : null;
}
