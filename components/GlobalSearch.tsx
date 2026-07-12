import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import API_BASE_URL from '../config/api';
import resolveMediaUrl from '../utils/mediaUrl';

type SearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  icon: string;
  image?: string;
  route: string;
};

const SECTION_LINKS: SearchHit[] = [
  { id: 'sec-reels', title: 'Reels', subtitle: 'Short videos', type: 'Section', icon: '🎬', route: '/(tabs)/reels' },
  { id: 'sec-courses', title: 'Courses', subtitle: 'Browse all courses', type: 'Section', icon: '📚', route: '/(tabs)/courses' },
  { id: 'sec-podcasts', title: 'Podcasts', subtitle: 'Listen & learn', type: 'Section', icon: '🎧', route: '/(tabs)/podcasts' },
  { id: 'sec-roadmaps', title: 'Roadmaps', subtitle: 'Learning paths', type: 'Section', icon: '🗺️', route: '/(tabs)/roadmaps' },
  { id: 'sec-articles', title: 'Articles', subtitle: 'Read articles', type: 'Section', icon: '📰', route: '/(tabs)/articles' },
  { id: 'sec-scholarship', title: 'Live Scholarship', subtitle: 'Only 250 EGP', type: 'Section', icon: '🎓', route: '/(tabs)/scholarship' },
  { id: 'sec-advices', title: 'Advices', subtitle: 'Expert tips', type: 'Section', icon: '💡', route: '/(tabs)/advices' },
  { id: 'sec-terms', title: 'Programming Terms', subtitle: 'Dictionary', type: 'Section', icon: '📖', route: '/(tabs)/programming-terms' },
  { id: 'sec-cv', title: 'Top CV', subtitle: 'CV templates', type: 'Section', icon: '📄', route: '/(tabs)/top-cv' },
  { id: 'sec-movies', title: 'Movies', subtitle: 'Programming movies', type: 'Section', icon: '🎥', route: '/movies' },
  { id: 'sec-prayer', title: 'Prayer Times', subtitle: 'Daily prayers', type: 'Section', icon: '🕌', route: '/prayer-times' },
  { id: 'sec-thoughts', title: 'Programmer Thoughts', subtitle: 'Inspiration', type: 'Section', icon: '💭', route: '/programmer-thoughts' },
  { id: 'sec-profile', title: 'Profile', subtitle: 'Your account', type: 'Section', icon: '👤', route: '/profile' },
  { id: 'sec-subscribe', title: 'Subscription', subtitle: 'Premium access', type: 'Section', icon: '💎', route: '/subscription' },
  { id: 'sec-help', title: 'Help & Support', subtitle: 'Get help', type: 'Section', icon: '❓', route: '/help-support' },
  { id: 'sec-contact', title: 'Contact', subtitle: 'Reach us', type: 'Section', icon: '📞', route: '/contact' },
  { id: 'sec-about', title: 'About', subtitle: 'About ELNADY', type: 'Section', icon: 'ℹ️', route: '/about-us' },
];

const TYPE_COLOR: Record<string, string> = {
  Course: '#E50914',
  Article: '#FF6B6B',
  Roadmap: '#4ECDC4',
  Podcast: '#A78BFA',
  Advice: '#34D399',
  Term: '#60A5FA',
  CV: '#F472B6',
  Section: '#F59E0B',
};

function matchesQuery(item: SearchHit, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  return (
    item.title.toLowerCase().includes(q) ||
    (item.subtitle || '').toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q)
  );
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<SearchHit[]>(SECTION_LINKS);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const loadedRef = useRef(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const loadCatalog = useCallback(async () => {
    if (loadedRef.current) return;
    setLoading(true);
    try {
      const [coursesRes, articlesRes, roadmapsRes, podcastsRes, advicesRes, termsRes, cvsRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/public/courses`),
          fetch(`${API_BASE_URL}/api/public/articles`),
          fetch(`${API_BASE_URL}/api/public/roadmaps`),
          fetch(`${API_BASE_URL}/api/public/podcasts`),
          fetch(`${API_BASE_URL}/api/public/content/advices`),
          fetch(`${API_BASE_URL}/api/public/programming-terms`),
          fetch(`${API_BASE_URL}/api/public/cv-templates`),
        ]);

      const hits: SearchHit[] = [...SECTION_LINKS];

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        for (const course of data?.data?.courses || []) {
          const id = String(course._id || course.id);
          hits.push({
            id: `course-${id}`,
            title: course.title || 'Untitled course',
            subtitle: [course.instructor, course.category, course.level].filter(Boolean).join(' • '),
            type: 'Course',
            icon: '📚',
            image: resolveMediaUrl(course.thumbnail || course.image),
            route: `/course-details?courseId=${id}`,
          });
        }
      }

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        for (const article of data?.data?.articles || []) {
          const id = String(article._id || article.id);
          hits.push({
            id: `article-${id}`,
            title: article.title || 'Untitled article',
            subtitle: [article.author, article.category].filter(Boolean).join(' • '),
            type: 'Article',
            icon: '📰',
            image: resolveMediaUrl(article.image || article.thumbnail),
            route: `/article-details?articleId=${id}`,
          });
        }
      }

      if (roadmapsRes.ok) {
        const data = await roadmapsRes.json();
        for (const roadmap of data?.data?.roadmaps || []) {
          const id = String(roadmap._id || roadmap.id);
          hits.push({
            id: `roadmap-${id}`,
            title: roadmap.title || 'Untitled roadmap',
            subtitle: [roadmap.category, roadmap.difficulty, roadmap.duration]
              .filter(Boolean)
              .join(' • '),
            type: 'Roadmap',
            icon: '🗺️',
            image: resolveMediaUrl(roadmap.image || roadmap.thumbnail),
            route: `/roadmap-details?roadmapId=${id}`,
          });
        }
      }

      if (podcastsRes.ok) {
        const data = await podcastsRes.json();
        for (const podcast of data?.data?.podcasts || []) {
          const id = String(podcast._id || podcast.id);
          hits.push({
            id: `podcast-${id}`,
            title: podcast.title || 'Untitled podcast',
            subtitle: [podcast.host, podcast.category].filter(Boolean).join(' • '),
            type: 'Podcast',
            icon: '🎧',
            image: resolveMediaUrl(podcast.thumbnail || podcast.image),
            route: `/podcast-details?podcastId=${id}`,
          });
        }
      }

      if (advicesRes.ok) {
        const data = await advicesRes.json();
        for (const advice of data?.data?.advices || []) {
          const id = String(advice._id || advice.id);
          hits.push({
            id: `advice-${id}`,
            title: advice.title || 'Untitled advice',
            subtitle: [advice.author, advice.category].filter(Boolean).join(' • '),
            type: 'Advice',
            icon: '💡',
            image: resolveMediaUrl(advice.thumbnail || advice.image),
            route: '/(tabs)/advices',
          });
        }
      }

      if (termsRes.ok) {
        const data = await termsRes.json();
        const terms = data?.data?.terms || data?.data?.programmingTerms || [];
        for (const term of terms) {
          const id = String(term._id || term.id);
          hits.push({
            id: `term-${id}`,
            title: term.term || term.title || 'Term',
            subtitle: term.category || term.definition?.slice(0, 60) || 'Programming term',
            type: 'Term',
            icon: '📖',
            route: '/(tabs)/programming-terms',
          });
        }
      }

      if (cvsRes.ok) {
        const data = await cvsRes.json();
        const templates = data?.data?.cvTemplates || data?.data?.templates || [];
        for (const cv of templates) {
          const id = String(cv._id || cv.id);
          hits.push({
            id: `cv-${id}`,
            title: cv.title || cv.name || 'CV Template',
            subtitle: cv.category || 'CV template',
            type: 'CV',
            icon: '📄',
            image: resolveMediaUrl(cv.thumbnail || cv.image),
            route: '/(tabs)/top-cv',
          });
        }
      }

      setCatalog(hits);
      loadedRef.current = true;
    } catch (error) {
      console.error('Global search catalog failed:', error);
      setCatalog(SECTION_LINKS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (focused || query.length > 0) {
      loadCatalog();
    }
  }, [focused, query, loadCatalog]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return catalog.filter((item) => matchesQuery(item, debouncedQuery)).slice(0, 20);
  }, [catalog, debouncedQuery]);

  const showPanel = focused || query.length > 0;

  const handleSelect = (item: SearchHit) => {
    Keyboard.dismiss();
    setFocused(false);
    setQuery('');
    router.push(item.route as any);
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.searchShell, focused && styles.searchShellFocused]}
      >
        <Text style={styles.searchGlyph}>⌕</Text>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay so result press registers
            setTimeout(() => setFocused(false), 180);
          }}
          placeholder="Search courses, articles, roadmaps..."
          placeholderTextColor="#777777"
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {loading && query.length > 0 ? (
          <ActivityIndicator size="small" color="#E50914" style={styles.spinner} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={clearSearch} hitSlop={10} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </LinearGradient>

      {showPanel && debouncedQuery.trim().length > 0 && (
        <View style={styles.resultsPanel}>
          {results.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptySubtitle}>Try another keyword</Text>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.resultsScroll}
              showsVerticalScrollIndicator={false}
            >
              {results.map((item) => {
                const accent = TYPE_COLOR[item.type] || '#E50914';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.resultRow}
                    activeOpacity={0.75}
                    onPress={() => handleSelect(item)}
                  >
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.resultThumb} />
                    ) : (
                      <View style={[styles.resultThumb, styles.resultThumbFallback]}>
                        <Text style={styles.resultEmoji}>{item.icon}</Text>
                      </View>
                    )}
                    <View style={styles.resultText}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {!!item.subtitle && (
                        <Text style={styles.resultSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
                      <Text style={[styles.typeBadgeText, { color: accent }]}>{item.type}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    zIndex: 20,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    minHeight: 52,
    overflow: 'hidden',
  },
  searchShellFocused: {
    borderColor: 'rgba(229, 9, 20, 0.55)',
    shadowColor: '#E50914',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  searchGlyph: {
    fontSize: 22,
    color: '#E50914',
    marginRight: 10,
    marginTop: -2,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 12,
  },
  spinner: {
    marginLeft: 8,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  clearText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsPanel: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 18, 18, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    maxHeight: 320,
    overflow: 'hidden',
  },
  resultsScroll: {
    maxHeight: 320,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 10,
  },
  resultThumb: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  resultThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.16)',
  },
  resultEmoji: {
    fontSize: 18,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultSubtitle: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#777777',
    fontSize: 12,
  },
});
