import { hydrateSectionTask, packSectionTask } from './sectionTask';

export const RELEASE_MARKER = '__YONE_RELEASE__';
export const RELEASE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function asPlain(item) {
  if (!item) return item;
  if (typeof item.toObject === 'function') return item.toObject();
  return item;
}

export function parseReleasePack(description) {
  const text = String(description || '');
  const idx = text.lastIndexOf(RELEASE_MARKER);
  if (idx === -1) {
    return { description: text, meta: null };
  }
  const visible = text.slice(0, idx).trimEnd();
  const jsonPart = text.slice(idx + RELEASE_MARKER.length).trim();
  try {
    const meta = JSON.parse(jsonPart);
    return {
      description: visible,
      meta: meta && typeof meta === 'object' ? meta : null,
    };
  } catch {
    return { description: text, meta: null };
  }
}

export function toReleaseIso(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function isoFromParts(monthIndex, day, year) {
  if (monthIndex == null || monthIndex === '') return null;
  const month = Number(monthIndex);
  const d = Number(day);
  const y = Number(year);
  if (!Number.isInteger(month) || month < 0 || month > 11) return null;
  if (!Number.isInteger(d) || d < 1 || d > 31) return null;
  if (!Number.isInteger(y) || y < 2020 || y > 2100) return null;
  const iso = `${y}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const check = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(check.getTime())) return null;
  if (check.getUTCMonth() !== month || check.getUTCDate() !== d) return null;
  return iso;
}

export function partsFromIso(value) {
  const iso = toReleaseIso(value);
  if (!iso) return { monthIndex: null, day: '', year: String(new Date().getUTCFullYear()) };
  const [y, m, d] = iso.split('-').map(Number);
  return {
    monthIndex: m - 1,
    day: String(d),
    year: String(y),
  };
}

export function formatReleaseLabel(value) {
  const iso = toReleaseIso(value);
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const month = RELEASE_MONTHS[m - 1] || '';
  const currentYear = new Date().getUTCFullYear();
  if (!month) return iso;
  return y === currentYear ? `${month} ${d}` : `${month} ${d}, ${y}`;
}

export function hydrateRelease(item) {
  const plain = asPlain(item);
  if (!plain || typeof plain !== 'object') return plain;
  const packed = parseReleasePack(plain.description);
  const comingSoon = !!(plain.comingSoon || packed.meta?.comingSoon);
  const releaseDate = toReleaseIso(plain.releaseDate || packed.meta?.releaseDate);
  return {
    ...plain,
    description: packed.description,
    comingSoon,
    releaseDate,
  };
}

export function packRelease(item) {
  const plain = asPlain(item) || {};
  const comingSoon = !!plain.comingSoon;
  const releaseDate = comingSoon || plain.releaseDate ? toReleaseIso(plain.releaseDate) : null;
  const { description } = parseReleasePack(plain.description);
  let nextDescription = description;
  if (comingSoon || releaseDate) {
    const packed = `${description ? `${description}\n\n` : ''}${RELEASE_MARKER}${JSON.stringify({
      comingSoon,
      releaseDate,
    })}`;
    nextDescription = packed.trim();
  }
  return {
    ...plain,
    comingSoon,
    releaseDate: releaseDate || null,
    description: nextDescription,
  };
}

export function isUnreleased(item, now = new Date()) {
  const hydrated = hydrateRelease(item);
  const iso = toReleaseIso(hydrated?.releaseDate);
  if (iso) {
    const at = new Date(`${iso}T00:00:00.000Z`);
    if (!Number.isNaN(at.getTime()) && now >= at) return false;
    if (!Number.isNaN(at.getTime()) && now < at) return true;
  }
  return !!hydrated?.comingSoon;
}

export function lessonItemKey(lesson, sectionIndex, lessonIndex) {
  return String(lesson?._id || lesson?.id || `s${sectionIndex}-l${lessonIndex}`);
}

export function episodeItemKey(episode, index) {
  return String(episode?._id || episode?.id || `e${index}`);
}

export function hydrateCourseSections(sections) {
  return (Array.isArray(sections) ? sections : []).map((section, sectionIndex) => {
    const hydrated = hydrateSectionTask(asPlain(section));
    return {
      ...hydrated,
      lessons: (Array.isArray(hydrated?.lessons) ? hydrated.lessons : []).map((lesson, lessonIndex) => ({
        ...hydrateRelease(lesson),
        _itemKey: lessonItemKey(lesson, sectionIndex, lessonIndex),
      })),
    };
  });
}

export function packCourseSections(sections) {
  return (Array.isArray(sections) ? sections : []).map((section) => {
    const packed = packSectionTask(section);
    return {
      ...packed,
      lessons: (Array.isArray(packed?.lessons) ? packed.lessons : []).map((lesson) => packRelease(lesson)),
    };
  });
}

export function hydratePodcastEpisodes(episodes) {
  return (Array.isArray(episodes) ? episodes : []).map((episode, index) => ({
    ...hydrateRelease(episode),
    _itemKey: episodeItemKey(episode, index),
  }));
}

export function packPodcastEpisodes(episodes) {
  return (Array.isArray(episodes) ? episodes : []).map((episode) => packRelease(episode));
}

export function getUpcomingEpisodes(episodes) {
  return hydratePodcastEpisodes(episodes).filter((episode) => {
    const title = String(episode?.title || '');
    const category = String(episode?.category || '');
    if (title === '__YONE_PODCAST_META__' || category === '__meta__') return false;
    return isUnreleased(episode);
  }).sort((a, b) => {
    const left = toReleaseIso(a.releaseDate) || '9999-12-31';
    const right = toReleaseIso(b.releaseDate) || '9999-12-31';
    return left.localeCompare(right);
  });
}

export function getSoonestUpcomingEpisode(episodes) {
  return getUpcomingEpisodes(episodes)[0] || null;
}
