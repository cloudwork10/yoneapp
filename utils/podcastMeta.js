export const PODCAST_META_TITLE = '__YONE_PODCAST_META__';
export const PODCAST_META_CATEGORY = '__meta__';

export function isPodcastMetaEpisode(episode) {
  const title = String(episode?.title || '');
  const category = String(episode?.category || '');
  return title === PODCAST_META_TITLE || category === PODCAST_META_CATEGORY;
}

export function parsePodcastMeta(episodes) {
  const ep = (Array.isArray(episodes) ? episodes : []).find(isPodcastMetaEpisode);
  if (!ep?.description) {
    return { highlights: [], formatItems: [], benefits: [], hosts: [] };
  }
  try {
    const data = JSON.parse(ep.description);
    return {
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      formatItems: Array.isArray(data.formatItems) ? data.formatItems : [],
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      hosts: Array.isArray(data.hosts) ? data.hosts : [],
    };
  } catch {
    return { highlights: [], formatItems: [], benefits: [], hosts: [] };
  }
}

export function visiblePodcastEpisodes(episodes) {
  return (Array.isArray(episodes) ? episodes : []).filter((ep) => !isPodcastMetaEpisode(ep));
}

export function withPodcastMetaEpisode(episodes, meta) {
  const visible = visiblePodcastEpisodes(episodes);
  const payload = {
    highlights: Array.isArray(meta?.highlights) ? meta.highlights.filter((h) => String(h?.text || '').trim()) : [],
    formatItems: Array.isArray(meta?.formatItems)
      ? meta.formatItems.filter((f) => String(f?.label || f?.description || '').trim())
      : [],
    benefits: Array.isArray(meta?.benefits) ? meta.benefits.filter((b) => String(b || '').trim()) : [],
    hosts: Array.isArray(meta?.hosts) ? meta.hosts.filter((h) => String(h?.name || h?.bio || h?.title || '').trim()) : [],
  };
  const hasMeta =
    payload.highlights.length ||
    payload.formatItems.length ||
    payload.benefits.length ||
    payload.hosts.length;
  if (!hasMeta) return visible;
  return [
    ...visible,
    {
      title: PODCAST_META_TITLE,
      duration: '',
      url: '',
      thumbnail: '',
      description: JSON.stringify(payload),
      isCompleted: false,
      accessType: 'free',
      category: PODCAST_META_CATEGORY,
    },
  ];
}

export function hydratePodcast(podcast) {
  if (!podcast) return podcast;
  const meta = parsePodcastMeta(podcast.episodes);
  return {
    ...podcast,
    highlights: Array.isArray(podcast.highlights) && podcast.highlights.length ? podcast.highlights : meta.highlights,
    formatItems: Array.isArray(podcast.formatItems) && podcast.formatItems.length ? podcast.formatItems : meta.formatItems,
    benefits: Array.isArray(podcast.benefits) && podcast.benefits.length ? podcast.benefits : meta.benefits,
    hosts: Array.isArray(podcast.hosts) && podcast.hosts.length ? podcast.hosts : meta.hosts,
    episodes: visiblePodcastEpisodes(podcast.episodes),
  };
}
