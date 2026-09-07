import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

export const ADVICE_CATEGORIES_STORAGE_KEY = 'advice_categories_v1';

export const DEFAULT_ADVICE_CATEGORIES = [
  { id: 'career-shift', name: 'Career Change' },
  { id: 'kids', name: 'Kids & Family' },
  { id: 'motivation', name: 'Motivation' },
  { id: 'success', name: 'Success Tips' },
  { id: 'programming', name: 'Programming' },
  { id: 'business', name: 'Business' },
];

const ICONS = ['💡', '🚀', '👶', '💪', '🏆', '💻', '💼', '🎯', '📚', '🔥'];
const COLORS = ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#9B59B6', '#F39C12'];

export function normalizeAdviceCategoryId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, '')
    .slice(0, 40);
}

export function normalizeAdviceCategoryName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

export function mergeAdviceCategories(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list || []) {
      const id = normalizeAdviceCategoryId(item.id || item);
      const name = normalizeAdviceCategoryName(item.name || item.id || item);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, name: name || id });
    }
  }
  return out;
}

export function adviceCategoryMeta(id, index = 0, name) {
  const known = DEFAULT_ADVICE_CATEGORIES.find((item) => item.id === id);
  const fallbackName = String(id || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id,
    name: name || known?.name || fallbackName || id,
    icon: ICONS[index % ICONS.length],
    color: COLORS[index % COLORS.length],
  };
}

export async function readLocalAdviceCategories() {
  try {
    const raw = await AsyncStorage.getItem(ADVICE_CATEGORIES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? mergeAdviceCategories(parsed) : null;
  } catch {
    return null;
  }
}

export async function writeLocalAdviceCategories(list) {
  const next = mergeAdviceCategories(list);
  await AsyncStorage.setItem(ADVICE_CATEGORIES_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function fetchPublicAdviceCategories() {
  const response = await fetch(`${API_BASE_URL}/api/public/content/advice-categories`);
  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data?.data?.categories)
    ? mergeAdviceCategories(data.data.categories)
    : null;
}
