const MARKER = '__YONE_RELEASE__';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function asPlain(item) {
  if (!item) return item;
  if (typeof item.toObject === 'function') return item.toObject({ depopulate: true });
  if (typeof item.toJSON === 'function' && item._doc) return { ...item.toJSON() };
  return item;
}

function parseReleasePack(description) {
  const text = String(description || '');
  const idx = text.lastIndexOf(MARKER);
  if (idx === -1) {
    return { description: text, meta: null };
  }
  const visible = text.slice(0, idx).trimEnd();
  const jsonPart = text.slice(idx + MARKER.length).trim();
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

function toReleaseIso(value) {
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

function formatReleaseLabel(value) {
  const iso = toReleaseIso(value);
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const month = MONTHS[m - 1] || '';
  const currentYear = new Date().getUTCFullYear();
  if (!month) return iso;
  return y === currentYear ? `${month} ${d}` : `${month} ${d}, ${y}`;
}

function hydrateRelease(item) {
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

function packRelease(item) {
  const plain = asPlain(item) || {};
  const comingSoon = !!plain.comingSoon;
  const releaseDate = comingSoon || plain.releaseDate ? toReleaseIso(plain.releaseDate) : null;
  const { description } = parseReleasePack(plain.description);
  let nextDescription = description;
  if (comingSoon || releaseDate) {
    const packed = `${description ? `${description}\n\n` : ''}${MARKER}${JSON.stringify({
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

function isUnreleased(item, now = new Date()) {
  const hydrated = hydrateRelease(item);
  const iso = toReleaseIso(hydrated?.releaseDate);
  if (iso) {
    const at = new Date(`${iso}T00:00:00.000Z`);
    if (!Number.isNaN(at.getTime()) && now >= at) return false;
    if (!Number.isNaN(at.getTime()) && now < at) return true;
  }
  return !!hydrated?.comingSoon;
}

function lessonItemKey(lesson, sectionIndex, lessonIndex) {
  return String(lesson?._id || lesson?.id || `s${sectionIndex}-l${lessonIndex}`);
}

function episodeItemKey(episode, index) {
  return String(episode?._id || episode?.id || `e${index}`);
}

function collectCourseLessons(course) {
  const sections = asPlain(course)?.sections || [];
  const items = [];
  sections.forEach((section, sectionIndex) => {
    (section?.lessons || []).forEach((lesson, lessonIndex) => {
      const hydrated = hydrateRelease(lesson);
      items.push({
        kind: 'course_lesson',
        itemKey: lessonItemKey(lesson, sectionIndex, lessonIndex),
        title: hydrated.title || `Lesson ${lessonIndex + 1}`,
        comingSoon: !!hydrated.comingSoon,
        releaseDate: hydrated.releaseDate || null,
        unreleased: isUnreleased(hydrated),
        sectionIndex,
        lessonIndex,
      });
    });
  });
  return items;
}

function collectPodcastEpisodes(podcast) {
  const episodes = asPlain(podcast)?.episodes || [];
  return episodes
    .filter((episode) => {
      const title = String(episode?.title || '');
      const category = String(episode?.category || '');
      return title !== '__YONE_PODCAST_META__' && category !== '__meta__';
    })
    .map((episode, index) => {
      const hydrated = hydrateRelease(episode);
      return {
        kind: 'podcast_episode',
        itemKey: episodeItemKey(episode, index),
        title: hydrated.title || `Episode ${index + 1}`,
        comingSoon: !!hydrated.comingSoon,
        releaseDate: hydrated.releaseDate || null,
        unreleased: isUnreleased(hydrated),
        index,
      };
    });
}

function sanitizeCourseForPublic(course) {
  const plain = asPlain(course);
  if (!plain) return plain;
  return {
    ...plain,
    sections: (plain.sections || []).map((section, sectionIndex) => ({
      ...asPlain(section),
      lessons: (section?.lessons || []).map((lesson, lessonIndex) => {
        const hydrated = hydrateRelease(lesson);
        if (!isUnreleased(hydrated)) return hydrated;
        return { ...hydrated, videoUrl: '', url: '' };
      }),
    })),
  };
}

function sanitizePodcastForPublic(podcast) {
  const plain = asPlain(podcast);
  if (!plain) return plain;
  return {
    ...plain,
    episodes: (plain.episodes || []).map((episode) => {
      const hydrated = hydrateRelease(episode);
      if (!isUnreleased(hydrated)) return hydrated;
      return { ...hydrated, url: '', videoUrl: '' };
    }),
  };
}

function applyDueCourseReleases(course, now = new Date()) {
  const plain = asPlain(course);
  let changed = false;
  const sections = (plain.sections || []).map((section) => ({
    ...asPlain(section),
    lessons: (section?.lessons || []).map((lesson) => {
      const hydrated = hydrateRelease(lesson);
      if (!hydrated.comingSoon && !hydrated.releaseDate) return lesson;
      if (isUnreleased(hydrated, now)) return packRelease(hydrated);
      if (!hydrated.comingSoon && !isUnreleased(hydrated, now)) {
        return packRelease({ ...hydrated, comingSoon: false });
      }
      changed = true;
      return packRelease({ ...hydrated, comingSoon: false });
    }),
  }));
  return { course: { ...plain, sections }, changed };
}

function applyDuePodcastReleases(podcast, now = new Date()) {
  const plain = asPlain(podcast);
  let changed = false;
  const episodes = (plain.episodes || []).map((episode) => {
    const hydrated = hydrateRelease(episode);
    if (!hydrated.comingSoon && !hydrated.releaseDate) return episode;
    if (isUnreleased(hydrated, now)) return packRelease(hydrated);
    if (!hydrated.comingSoon) return packRelease({ ...hydrated, comingSoon: false });
    changed = true;
    return packRelease({ ...hydrated, comingSoon: false });
  });
  return { podcast: { ...plain, episodes }, changed };
}

module.exports = {
  MARKER,
  hydrateRelease,
  packRelease,
  isUnreleased,
  toReleaseIso,
  formatReleaseLabel,
  lessonItemKey,
  episodeItemKey,
  collectCourseLessons,
  collectPodcastEpisodes,
  sanitizeCourseForPublic,
  sanitizePodcastForPublic,
  applyDueCourseReleases,
  applyDuePodcastReleases,
};
