import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

const REEL_LINK_CACHE_KEY = 'yone_reel_link_overrides_v3';
const LEGACY_REEL_LINK_KEYS = [
  'yone_reel_link_overrides',
  'yone_reel_link_overrides_v2',
];
const REEL_LINK_MARKER = /\[\[YONE_LINK\|([a-z]+)\|([^|\]]+)\|([^\]]*)\]\]/;

export const REEL_LINK_TYPES = [
  { value: 'none', label: 'None', hint: '', cta: '' },
  { value: 'course', label: 'Course', hint: 'Choose the course', cta: 'Watch this course' },
  { value: 'thought', label: 'Thoughts episode', hint: 'Choose the episode', cta: 'Watch the full episode' },
  { value: 'podcast', label: 'Podcast', hint: 'Choose the podcast', cta: 'Listen to this podcast' },
  { value: 'roadmap', label: 'Roadmap', hint: 'Choose the roadmap', cta: 'View this roadmap' },
  { value: 'article', label: 'Article', hint: 'Choose the article', cta: 'Read this article' },
  { value: 'news', label: 'Tech news', hint: 'Choose the story', cta: 'Read this story' },
];

export const REEL_LINK_VALUES = REEL_LINK_TYPES.map((item) => item.value);

export const getReelLinkMeta = (linkType) =>
  REEL_LINK_TYPES.find((item) => item.value === linkType) || REEL_LINK_TYPES[0];

export const getReelLinkRoute = (linkType, linkId) => {
  if (!linkType || linkType === 'none' || !linkId) return null;

  if (linkType === 'course') {
    return { pathname: '/course-details', params: { courseId: linkId } };
  }
  if (linkType === 'thought') {
    return { pathname: '/programmer-thoughts', params: { thoughtId: linkId } };
  }
  if (linkType === 'podcast') {
    return { pathname: '/podcast-details', params: { podcastId: linkId } };
  }
  if (linkType === 'roadmap') {
    return { pathname: '/roadmap-details', params: { roadmapId: linkId } };
  }
  if (linkType === 'article') {
    return { pathname: '/article-details', params: { articleId: linkId } };
  }
  if (linkType === 'news') {
    return { pathname: '/tech-news', params: { newsId: linkId } };
  }
  return null;
};

export const stripReelLinkMarker = (text = '') =>
  String(text || '').replace(/\n?\[\[YONE_LINK\|[^\]]+\]\]/g, '').trim();

export const encodeReelLinkInDescription = (description, link) => {
  const clean = stripReelLinkMarker(description);
  if (!link?.linkType || link.linkType === 'none' || !link.linkId) return clean;

  const label = String(link.linkLabel || '').replace(/[|[\]\n]/g, '').slice(0, 40);
  const marker = `[[YONE_LINK|${link.linkType}|${link.linkId}|${label}]]`;
  const budget = 500 - marker.length - 1;
  const body = clean.slice(0, Math.max(0, budget));
  return body ? `${body}\n${marker}` : marker;
};

export const extractReelLinkFromText = (text = '') => {
  const match = String(text || '').match(REEL_LINK_MARKER);
  if (!match) return null;
  return {
    linkType: match[1],
    linkId: match[2],
    linkLabel: match[3] || '',
  };
};

export const hydrateReelLink = (reel, override) => {
  if (!reel) return reel;
  const fromUpload =
    override?.explicit && override.linkType && override.linkType !== 'none' && override.linkId
      ? override
      : reel.linkType && reel.linkType !== 'none' && reel.linkId
        ? {
            linkType: reel.linkType,
            linkId: String(reel.linkId),
            linkLabel: reel.linkLabel || '',
          }
        : null;

  return {
    ...reel,
    title: stripReelLinkMarker(reel.title),
    description: stripReelLinkMarker(reel.description),
    linkType: fromUpload?.linkType || 'none',
    linkId: fromUpload?.linkId || '',
    linkLabel: fromUpload?.linkLabel || '',
  };
};

export const getReelLinkOverrides = async () => {
  try {
    await AsyncStorage.multiRemove(LEGACY_REEL_LINK_KEYS);
    const raw = await AsyncStorage.getItem(REEL_LINK_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveReelLinkOverride = async (reelId, link) => {
  if (!reelId || !link?.linkId) return;
  const all = await getReelLinkOverrides();
  all[reelId] = {
    explicit: true,
    linkType: link.linkType,
    linkId: String(link.linkId),
    linkLabel: link.linkLabel || '',
  };
  await AsyncStorage.setItem(REEL_LINK_CACHE_KEY, JSON.stringify(all));
};

export const hydrateReels = async (reels = []) => {
  const overrides = await getReelLinkOverrides();
  return (reels || []).map((reel) => hydrateReelLink(reel, overrides[reel._id]));
};

const toOptions = (items, titleFn) =>
  (items || [])
    .map((item) => ({
      id: String(item._id || item.id || ''),
      title: titleFn(item),
    }))
    .filter((item) => item.id);

export const fetchReelLinkOptions = async () => {
  const empty = {
    course: [],
    thought: [],
    podcast: [],
    roadmap: [],
    article: [],
    news: [],
  };

  try {
    const [coursesRes, thoughtsRes, podcastsRes, roadmapsRes, articlesRes, newsRes] =
      await Promise.all([
        fetch(`${API_BASE_URL}/api/public/courses`),
        fetch(`${API_BASE_URL}/api/public/programmer-thoughts`),
        fetch(`${API_BASE_URL}/api/public/podcasts`),
        fetch(`${API_BASE_URL}/api/public/roadmaps`),
        fetch(`${API_BASE_URL}/api/public/articles`),
        fetch(`${API_BASE_URL}/api/tech-news?region=world&limit=60`),
      ]);

    const read = async (response, key) => {
      if (!response.ok) return [];
      const data = await response.json();
      return data.data?.[key] || [];
    };

    const [courses, thoughts, podcasts, roadmaps, articles, news] = await Promise.all([
      read(coursesRes, 'courses'),
      read(thoughtsRes, 'thoughts'),
      read(podcastsRes, 'podcasts'),
      read(roadmapsRes, 'roadmaps'),
      read(articlesRes, 'articles'),
      newsRes.ok ? newsRes.json().then((data) => data.data?.news || []) : [],
    ]);

    return {
      course: toOptions(courses, (item) => item.title || 'Course'),
      thought: toOptions(
        [...thoughts].sort((a, b) => Number(a.episodeNumber || 999) - Number(b.episodeNumber || 999)),
        (item) =>
          item.episodeNumber ? `Episode ${item.episodeNumber}: ${item.title}` : (item.title || 'Episode')
      ),
      podcast: toOptions(podcasts, (item) => item.title || 'Podcast'),
      roadmap: toOptions(roadmaps, (item) => item.title || 'Roadmap'),
      article: toOptions(articles, (item) => item.title || 'Article'),
      news: toOptions(news, (item) => item.title || 'News'),
    };
  } catch (error) {
    console.log('Failed to load reel link options:', error);
    return empty;
  }
};
