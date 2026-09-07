import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

export const PROGRAMMING_LANGUAGES_STORAGE_KEY = 'programming_languages_v2';

export const DEFAULT_PROGRAMMING_LANGUAGES = [
  { id: 'JavaScript', name: 'JavaScript' },
  { id: 'Python', name: 'Python' },
  { id: 'Java', name: 'Java' },
  { id: 'C++', name: 'C++' },
  { id: 'C#', name: 'C#' },
  { id: 'PHP', name: 'PHP' },
  { id: 'Ruby', name: 'Ruby' },
  { id: 'Go', name: 'Go' },
];

const LANGUAGE_META = {
  JavaScript: { icon: '🟨', color: '#F7DF1E' },
  Python: { icon: '🐍', color: '#3776AB' },
  Java: { icon: '☕', color: '#ED8B00' },
  'C++': { icon: '⚡', color: '#00599C' },
  'C#': { icon: '🔷', color: '#239120' },
  PHP: { icon: '🐘', color: '#777BB4' },
  Ruby: { icon: '💎', color: '#CC342D' },
  Go: { icon: '🐹', color: '#00ADD8' },
};

const ICONS = ['📝', '💻', '🚀', '🔧', '🎯', '📚', '🔥', '⚙️'];
const COLORS = ['#4ECDC4', '#FF6B35', '#9B59B6', '#45B7D1', '#F39C12', '#E74C3C'];

export function normalizeProgrammingLanguageName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

export function mergeProgrammingLanguages(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list || []) {
      const name = normalizeProgrammingLanguageName(item?.name || item?.id || item);
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: name, name });
    }
  }
  return out;
}

export function programmingLanguageMeta(name, index = 0) {
  const known = LANGUAGE_META[name] || LANGUAGE_META[Object.keys(LANGUAGE_META).find((key) => key.toLowerCase() === String(name || '').toLowerCase())];
  return {
    id: name,
    name,
    icon: known?.icon || ICONS[index % ICONS.length],
    color: known?.color || COLORS[index % COLORS.length],
  };
}

export async function readLocalProgrammingLanguages() {
  try {
    const raw = await AsyncStorage.getItem(PROGRAMMING_LANGUAGES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? mergeProgrammingLanguages(parsed) : null;
  } catch {
    return null;
  }
}

export async function writeLocalProgrammingLanguages(list) {
  const next = mergeProgrammingLanguages(list);
  await AsyncStorage.setItem(PROGRAMMING_LANGUAGES_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function fetchPublicProgrammingLanguages() {
  const response = await fetch(`${API_BASE_URL}/api/public/content/programming-languages`);
  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data?.data?.languages)
    ? mergeProgrammingLanguages(data.data.languages)
    : null;
}
