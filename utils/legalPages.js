import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';
import { getLegalPageFallback } from './legalPageDefaults';

const storageKey = (slug) => `legal_page_${slug}`;

function normalizePage(page, fallback) {
  if (!page || typeof page !== 'object') return fallback;
  return {
    title: page.title || fallback.title,
    subtitle: page.subtitle || '',
    sections: Array.isArray(page.sections)
      ? page.sections.map((section) => ({
          id: section.id,
          title: section.title || '',
          body: section.body || '',
        }))
      : fallback.sections,
  };
}

export async function loadLegalPageLocal(slug) {
  try {
    const raw = await AsyncStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.title && !parsed?.sections?.length) return null;
    return normalizePage(parsed, getLegalPageFallback(slug));
  } catch {
    return null;
  }
}

export async function saveLegalPageLocal(slug, page) {
  await AsyncStorage.setItem(
    storageKey(slug),
    JSON.stringify({
      title: page.title || '',
      subtitle: page.subtitle || '',
      sections: Array.isArray(page.sections) ? page.sections : [],
    })
  );
}

export async function fetchLegalPage(slug, fallback) {
  const defaults = fallback || getLegalPageFallback(slug);
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/legal-pages/${slug}`);
    const data = await res.json();
    const page = data?.data?.page;
    if (res.ok && page?.title) {
      const next = normalizePage(page, defaults);
      await saveLegalPageLocal(slug, next);
      return next;
    }
  } catch {
    // use local or fallback
  }

  const local = await loadLegalPageLocal(slug);
  return local || defaults;
}
