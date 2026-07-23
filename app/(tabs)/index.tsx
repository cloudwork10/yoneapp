import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTransition from '../../components/ScreenTransition';
import GlobalSearch from '../../components/GlobalSearch';
import API_BASE_URL from '../../config/api';
import resolveMediaUrl from '../../utils/mediaUrl';

type ContentStats = {
  courses: number;
  articles: number;
  roadmaps: number;
  podcasts: number;
  reels: number;
  advices: number;
  terms: number;
  cvs: number;
};

type LatestItem = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  icon?: string;
};

const QUICK_LINKS = [
  { title: 'Reels', icon: '🎬', route: '/(tabs)/reels' },
  { title: 'Courses', icon: '📚', route: '/(tabs)/courses' },
  { title: 'Podcasts', icon: '🎧', route: '/(tabs)/podcasts' },
  { title: 'Roadmaps', icon: '🗺️', route: '/(tabs)/roadmaps' },
  { title: 'Articles', icon: '📰', route: '/(tabs)/articles' },
  { title: 'Elnady', icon: '🎓', route: '/(tabs)/scholarship' },
  { title: 'Tech News', icon: '🗞️', route: '/tech-news' },
  { title: 'Advices', icon: '💡', route: '/(tabs)/advices' },
  { title: 'Terms', icon: '📖', route: '/(tabs)/programming-terms' },
  { title: 'Top CV', icon: '📄', route: '/(tabs)/top-cv' },
  { title: 'Prayer', icon: '🕌', route: '/prayer-times' },
  { title: 'Thoughts', icon: '💭', route: '/programmer-thoughts' },
  { title: 'Profile', icon: '👤', route: '/profile' },
  { title: 'Subscribe', icon: '💎', route: '/subscription-2' },
  { title: 'Alerts', icon: '🔔', route: '/notification-settings' },
  { title: 'Contact', icon: '📞', route: '/contact' },
  { title: 'About', icon: 'ℹ️', route: '/about-us' },
  { title: 'More', icon: '⋯', route: '/(tabs)/more' },
];

export default function HomeScreen() {
  const [stats, setStats] = useState<ContentStats>({
    courses: 0,
    articles: 0,
    roadmaps: 0,
    podcasts: 0,
    reels: 0,
    advices: 0,
    terms: 0,
    cvs: 0,
  });
  const [latestArticles, setLatestArticles] = useState<LatestItem[]>([]);
  const [latestRoadmaps, setLatestRoadmaps] = useState<LatestItem[]>([]);

  const fetchHomeData = useCallback(async () => {
    try {
      const [statsRes, articlesRes, roadmapsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/public/stats`),
        fetch(`${API_BASE_URL}/api/public/articles`),
        fetch(`${API_BASE_URL}/api/public/roadmaps`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data?.data) {
          setStats({
            courses: data.data.courses || 0,
            articles: data.data.articles || 0,
            roadmaps: data.data.roadmaps || 0,
            podcasts: data.data.podcasts || 0,
            reels: data.data.reels || 0,
            advices: data.data.advices || 0,
            terms: data.data.terms || 0,
            cvs: data.data.cvs || 0,
          });
        }
      }

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        const items = (data?.data?.articles || [])
          .slice(0, 8)
          .map((article: any) => ({
            id: String(article._id || article.id),
            title: article.title || 'Untitled',
            subtitle: article.author || article.category || article.readTime || '',
            image: resolveMediaUrl(article.image || article.thumbnail),
            icon: article.icon || '📰',
          }));
        setLatestArticles(items);
      }

      if (roadmapsRes.ok) {
        const data = await roadmapsRes.json();
        const items = (data?.data?.roadmaps || [])
          .slice(0, 8)
          .map((roadmap: any) => ({
            id: String(roadmap._id || roadmap.id),
            title: roadmap.title || 'Untitled',
            subtitle: roadmap.category || roadmap.duration || roadmap.difficulty || '',
            image: resolveMediaUrl(roadmap.image || roadmap.thumbnail),
            icon: roadmap.icon || '🗺️',
          }));
        setLatestRoadmaps(items);
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  const quickStats = [
    { label: 'Courses', value: stats.courses, route: '/(tabs)/courses', accent: '#E50914' },
    { label: 'Articles', value: stats.articles, route: '/(tabs)/articles', accent: '#FF6B6B' },
    { label: 'Roadmaps', value: stats.roadmaps, route: '/(tabs)/roadmaps', accent: '#4ECDC4' },
    { label: 'Podcasts', value: stats.podcasts, route: '/(tabs)/podcasts', accent: '#A78BFA' },
    { label: 'Reels', value: stats.reels, route: '/(tabs)/reels', accent: '#F59E0B' },
    { label: 'Advices', value: stats.advices, route: '/(tabs)/advices', accent: '#34D399' },
    { label: 'Terms', value: stats.terms, route: '/(tabs)/programming-terms', accent: '#60A5FA' },
    { label: 'CVs', value: stats.cvs, route: '/(tabs)/top-cv', accent: '#F472B6' },
  ];

  return (
    <ScreenTransition>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.backgroundContainer}>
          <LinearGradient
            colors={['#000000', '#1a0a0a', '#2d1b1b', '#000000']}
            style={styles.backgroundGradient}
          />
          <View style={styles.floatingShapes}>
            <View style={[styles.shape, styles.shape1]} />
            <View style={[styles.shape, styles.shape2]} />
            <View style={[styles.shape, styles.shape3]} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.subtitle}>Continue your learning journey</Text>
          </View>

          <GlobalSearch />

          <ScholarshipPromo />

          {/* All content counters — 4 per row */}
          <View style={styles.statsGrid}>
            {quickStats.map((stat) => (
              <TouchableOpacity
                key={stat.label}
                activeOpacity={0.8}
                onPress={() => router.push(stat.route as any)}
                style={styles.statTouchable}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.statCard, { borderColor: `${stat.accent}33` }]}
                >
                  <Text style={[styles.statValue, { color: stat.accent }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={[styles.statAccentBar, { backgroundColor: stat.accent }]} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <View style={styles.linksGrid}>
              {QUICK_LINKS.map((link) => (
                <TouchableOpacity
                  key={link.route}
                  style={styles.linkCard}
                  activeOpacity={0.75}
                  onPress={() => router.push(link.route as any)}
                >
                  <Text style={styles.linkIcon}>{link.icon}</Text>
                  <Text style={styles.linkTitle} numberOfLines={1}>
                    {link.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Latest Articles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Articles</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/articles')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {latestArticles.length === 0 ? (
              <Text style={styles.emptyText}>No articles yet</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.latestRow}
              >
                {latestArticles.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.latestCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push(`/article-details?articleId=${article.id}` as any)
                    }
                  >
                    {article.image ? (
                      <Image source={{ uri: article.image }} style={styles.latestThumb} />
                    ) : (
                      <View style={[styles.latestThumb, styles.latestThumbFallback]}>
                        <Text style={styles.latestEmoji}>{article.icon || '📰'}</Text>
                      </View>
                    )}
                    <View style={styles.latestTextWrap}>
                      <Text style={styles.latestTitle} numberOfLines={2}>
                        {article.title}
                      </Text>
                      {!!article.subtitle && (
                        <Text style={styles.latestSubtitle} numberOfLines={1}>
                          {article.subtitle}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Latest Roadmaps */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Roadmaps</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/roadmaps')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {latestRoadmaps.length === 0 ? (
              <Text style={styles.emptyText}>No roadmaps yet</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.latestRow}
              >
                {latestRoadmaps.map((roadmap) => (
                  <TouchableOpacity
                    key={roadmap.id}
                    style={styles.latestCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push(`/roadmap-details?roadmapId=${roadmap.id}` as any)
                    }
                  >
                    {roadmap.image ? (
                      <Image source={{ uri: roadmap.image }} style={styles.latestThumb} />
                    ) : (
                      <View style={[styles.latestThumb, styles.latestThumbFallback, styles.roadmapThumb]}>
                        <Text style={styles.latestEmoji}>{roadmap.icon || '🗺️'}</Text>
                      </View>
                    )}
                    <View style={styles.latestTextWrap}>
                      <Text style={styles.latestTitle} numberOfLines={2}>
                        {roadmap.title}
                      </Text>
                      {!!roadmap.subtitle && (
                        <Text style={styles.latestSubtitle} numberOfLines={1}>
                          {roadmap.subtitle}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
    </ScreenTransition>
  );
}

function ScholarshipPromo() {
  const [hidden, setHidden] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hidden) return;
    const animate = () => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.03, duration: 450, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.98, duration: 450, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 350, useNativeDriver: true }),
      ]).start(() => animate());
    };
    animate();
    return () => scale.stopAnimation();
  }, [scale, hidden]);

  if (hidden) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/(tabs)/scholarship')}
      style={styles.promoTouchable}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={['#E50914', '#B20710']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoCard}
        >
          <View style={styles.promoLeft}>
            <Text style={styles.promoIcon}>🎓</Text>
          </View>
          <View style={styles.promoCenter}>
            <Text style={styles.promoTitle}>Elnady</Text>
            <Text style={styles.promoSubtitle}>Cohort 10-10-2026 · Learn · Live · Community</Text>
          </View>
          <TouchableOpacity
            onPress={() => setHidden(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.promoClose}
          >
            <Text style={styles.promoCloseText}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  floatingShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    opacity: 0.06,
  },
  shape1: {
    width: 120,
    height: 120,
    backgroundColor: '#E50914',
    borderRadius: 60,
    top: '15%',
    right: '10%',
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    width: 80,
    height: 80,
    backgroundColor: '#FF6B6B',
    top: '60%',
    left: '15%',
    transform: [{ rotate: '30deg' }],
  },
  shape3: {
    width: 100,
    height: 100,
    backgroundColor: '#FF8E53',
    borderRadius: 20,
    top: '40%',
    right: '20%',
    transform: [{ rotate: '-30deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#AAAAAA',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginBottom: 28,
  },
  statTouchable: {
    width: '23.5%',
    borderRadius: 12,
  },
  statCard: {
    width: '100%',
    minHeight: 68,
    borderRadius: 12,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 9,
    color: '#B0B0B0',
    textAlign: 'center',
    fontWeight: '500',
  },
  statAccentBar: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 2,
    opacity: 0.85,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 0,
  },
  seeAll: {
    fontSize: 13,
    color: '#E50914',
    fontWeight: '600',
  },
  emptyText: {
    color: '#777777',
    fontSize: 13,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginTop: 16,
  },
  linkCard: {
    width: '31.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  linkIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  linkTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EEEEEE',
    textAlign: 'center',
  },
  latestRow: {
    gap: 10,
    paddingRight: 4,
  },
  latestCard: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 8,
    gap: 10,
  },
  latestThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  latestThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
  },
  roadmapThumb: {
    backgroundColor: 'rgba(78, 205, 196, 0.18)',
  },
  latestEmoji: {
    fontSize: 20,
  },
  latestTextWrap: {
    flex: 1,
    paddingRight: 2,
  },
  latestTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 17,
  },
  latestSubtitle: {
    fontSize: 11,
    color: '#888888',
    marginTop: 3,
  },
  promoTouchable: {
    width: '100%',
    marginBottom: 16,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  promoLeft: {
    width: 44,
    alignItems: 'center',
    marginRight: 12,
  },
  promoIcon: {
    fontSize: 28,
  },
  promoCenter: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  promoClose: {
    padding: 4,
  },
  promoCloseText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
