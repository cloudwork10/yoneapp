import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import API_BASE_URL from '../config/api';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type NewsItem = {
  _id: string;
  title: string;
  summary?: string;
  summaryAr?: string;
  url: string;
  image?: string;
  source?: string;
  region?: string;
  category?: string;
  publishedAt?: string;
  isPinned?: boolean;
  isHidden?: boolean;
  isAuto?: boolean;
};

const REGIONS = [
  { id: 'world', label: 'World' },
  { id: 'egypt', label: 'Egypt' },
  { id: 'arab', label: 'Arab' },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'uiux', label: 'UI/UX' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'data', label: 'Data' },
  { id: 'automation', label: 'Automation' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'freelancing', label: 'Freelance' },
  { id: 'releases', label: 'Releases' },
];

function formatWhen(value?: string) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function NewsThumb({ uri }: { uri?: string }) {
  const [failed, setFailed] = useState(!uri);

  useEffect(() => {
    setFailed(!uri);
  }, [uri]);

  if (!uri || failed) {
    return (
      <View style={[styles.thumb, styles.thumbFallback]}>
        <Ionicons name="newspaper-outline" size={28} color="#E50914" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.thumb}
      onError={() => setFailed(true)}
    />
  );
}

function ArticleLoadingOverlay({
  title,
  source,
}: {
  title?: string;
  source?: string;
}) {
  const pulse = useRef(new Animated.Value(0.35)).current;
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const barLoop = Animated.loop(
      Animated.timing(bar, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    pulseLoop.start();
    barLoop.start();
    return () => {
      pulseLoop.stop();
      barLoop.stop();
    };
  }, [pulse, bar]);

  const barX = bar.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 220],
  });

  return (
    <View style={styles.loadOverlay} pointerEvents="none">
      <LinearGradient colors={['#080808', '#121212', '#0a0a0a']} style={StyleSheet.absoluteFill} />

      <View style={styles.loadHero}>
        <Animated.View style={[styles.loadIconRing, { opacity: pulse }]}>
          <Ionicons name="newspaper-outline" size={28} color="#E50914" />
        </Animated.View>
        <Text style={styles.loadBrand}>ELNADY</Text>
        <Text style={styles.loadTitle}>جاري تحميل الخبر</Text>
        <Text style={styles.loadSource} numberOfLines={2}>
          {title || source || 'Tech News'}
        </Text>

        <View style={styles.loadTrack}>
          <Animated.View style={[styles.loadTrackFill, { transform: [{ translateX: barX }] }]}>
            <LinearGradient
              colors={['transparent', '#E50914', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.loadTrackGradient}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.skeletonBlock}>
        <Animated.View style={[styles.skeletonLine, styles.skeletonImg, { opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLine, { width: '88%', opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLine, { width: '72%', opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLine, { width: '94%', opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLine, { width: '60%', opacity: pulse }]} />
      </View>
    </View>
  );
}

export default function TechNewsScreen() {
  const { isAdmin } = useUser();
  const insets = useSafeAreaInsets();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [region, setRegion] = useState<'world' | 'egypt' | 'arab'>('world');
  const [viewMode, setViewMode] = useState<'news' | 'stackoverflow' | 'admin'>('news');
  const [soReport, setSoReport] = useState<any>(null);
  const [soLoading, setSoLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const adminMode = viewMode === 'admin';
  const [adminNews, setAdminNews] = useState<NewsItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [reader, setReader] = useState<NewsItem | null>(null);
  const [webLoading, setWebLoading] = useState(false);
  const [explainItem, setExplainItem] = useState<NewsItem | null>(null);
  const [explainText, setExplainText] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  const loadPublic = useCallback(async () => {
    try {
      setLoadError('');
      const params = new URLSearchParams({ region });
      if (category && category !== 'all') params.set('category', category);
      const res = await fetch(`${API_BASE_URL}/api/tech-news?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data?.message || `Could not load news (${res.status})`);
        setNews([]);
        return;
      }
      setNews(data?.data?.news || []);
    } catch (e) {
      console.warn('Tech news load failed', e);
      setLoadError('Network error — check backend is running');
      setNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, region]);

  const loadStackOverflow = useCallback(async () => {
    try {
      setSoLoading(true);
      setLoadError('');
      const res = await fetch(`${API_BASE_URL}/api/tech-news/stackoverflow-rankings`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data?.message || 'Could not load Stack Overflow report');
        setSoReport(null);
        return;
      }
      setSoReport(data?.data || null);
    } catch {
      setLoadError('Network error — Stack Overflow report');
      setSoReport(null);
    } finally {
      setSoLoading(false);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadAdmin = useCallback(async () => {
    try {
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/tech-news/admin`);
      const data = await res.json();
      if (res.ok) setAdminNews(data?.data?.news || []);
    } catch (e) {
      console.warn('Admin tech news load failed', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      if (viewMode === 'stackoverflow') {
        loadStackOverflow();
      } else if (viewMode === 'admin') {
        loadAdmin();
        setLoading(false);
      } else {
        loadPublic();
      }
    }, [loadPublic, loadStackOverflow, loadAdmin, viewMode])
  );

  const openStory = (item: NewsItem) => {
    if (!item?.url) {
      Alert.alert('Error', 'This story has no link');
      return;
    }
    setWebLoading(true);
    setReader(item);
  };

  const openTranslate = async (item: NewsItem) => {
    try {
      setExplainItem(item);
      setExplainText('');
      setExplainLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/tech-news/${item._id}/explain`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'تعذّر تحميل الشرح');
      setExplainText(data?.data?.summaryAr || '');
    } catch (e: any) {
      setExplainText('');
      Alert.alert('خطأ', e?.message || 'تعذّر تحميل شرح الخبر');
      setExplainItem(null);
    } finally {
      setExplainLoading(false);
    }
  };

  const refreshFeeds = async () => {
    try {
      setSaving(true);
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/tech-news/admin/refresh`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Refresh failed');
      Alert.alert('Refreshed', data.message || 'Feeds updated');
      await Promise.all([loadPublic(), loadAdmin()]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Refresh failed');
    } finally {
      setSaving(false);
    }
  };

  const patchItem = async (id: string, updates: Partial<NewsItem>) => {
    try {
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/tech-news/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Update failed');
      await Promise.all([loadPublic(), loadAdmin()]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Update failed');
    }
  };

  const addManual = async () => {
    if (!draftTitle.trim() || !draftUrl.trim()) {
      Alert.alert('Required', 'Title and URL are required');
      return;
    }
    try {
      setSaving(true);
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/tech-news/admin`, {
        method: 'POST',
        body: JSON.stringify({
          title: draftTitle.trim(),
          url: draftUrl.trim(),
          summary: draftSummary.trim(),
          source: 'ELNADY',
          category: 'general',
          isPinned: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Create failed');
      setDraftTitle('');
      setDraftUrl('');
      setDraftSummary('');
      Alert.alert('Saved', 'News item published');
      await Promise.all([loadPublic(), loadAdmin()]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const list = adminMode ? adminNews : news;
  const readerTopPad = Math.max(
    insets.top,
    Platform.OS === 'ios' ? 59 : StatusBar.currentHeight || 28
  );

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#050505', '#121212']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                if (viewMode === 'stackoverflow') loadStackOverflow();
                else if (viewMode === 'admin') {
                  loadAdmin();
                  setRefreshing(false);
                } else loadPublic();
              }}
              tintColor="#E50914"
            />
          }
        >
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.coverWrap}>
            <Image
              source={require('../assets/images/tech-news-cover.png')}
              style={styles.cover}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(5,5,5,0.55)', '#050505']}
              style={styles.coverFade}
            />
            <View style={styles.coverBadge}>
              <Ionicons name="radio-outline" size={12} color="#E50914" />
              <Text style={styles.coverBadgeText}>LIVE FEED</Text>
            </View>
          </View>

          <Text style={styles.brand}>ELNADY</Text>
          <Text style={styles.title}>Tech News</Text>
          <Text style={styles.subtitle}>
            World · Egypt · Arab news by field — plus Stack Overflow rankings
          </Text>

          <View style={styles.adminBar}>
            {REGIONS.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.adminChip,
                  viewMode === 'news' && region === r.id && styles.adminChipOn,
                ]}
                onPress={() => {
                  setViewMode('news');
                  setRegion(r.id as 'world' | 'egypt' | 'arab');
                  setCategory('all');
                  setLoading(true);
                }}
              >
                <Text style={styles.adminChipText}>{r.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.adminChip,
                viewMode === 'stackoverflow' && styles.adminChipOn,
              ]}
              onPress={() => {
                setViewMode('stackoverflow');
                setLoading(true);
              }}
            >
              <Text style={styles.adminChipText}>Stack Overflow</Text>
            </TouchableOpacity>
            {isAdmin ? (
              <>
                <TouchableOpacity
                  style={[styles.adminChip, viewMode === 'admin' && styles.adminChipOn]}
                  onPress={() => {
                    setViewMode('admin');
                    loadAdmin();
                  }}
                >
                  <Text style={styles.adminChipText}>Admin</Text>
                </TouchableOpacity>
                {viewMode === 'admin' ? (
                  <TouchableOpacity
                    style={[styles.adminChip, styles.refreshChip]}
                    onPress={refreshFeeds}
                    disabled={saving}
                  >
                    <Text style={styles.adminChipText}>{saving ? '…' : 'Refresh feeds'}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </View>

          {viewMode === 'news' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, category === c.id && styles.catChipOn]}
                  onPress={() => {
                    setCategory(c.id);
                    setLoading(true);
                  }}
                >
                  <Text style={[styles.catText, category === c.id && styles.catTextOn]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : viewMode === 'admin' ? (
            <View style={styles.manualBox}>
              <Text style={styles.manualTitle}>Add / Pin news</Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#666"
                value={draftTitle}
                onChangeText={setDraftTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#666"
                autoCapitalize="none"
                value={draftUrl}
                onChangeText={setDraftUrl}
              />
              <TextInput
                style={[styles.input, { minHeight: 70 }]}
                placeholder="Short summary (optional)"
                placeholderTextColor="#666"
                value={draftSummary}
                onChangeText={setDraftSummary}
                multiline
              />
              <TouchableOpacity style={styles.saveBtn} onPress={addManual} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Publish'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.soIntro}>
              <Text style={styles.soIntroTitle}>Stack Overflow · {soReport?.year || 2025}</Text>
              <Text style={styles.soIntroSub}>
                Best fields & leading technologies — ranked from the Developer Survey
              </Text>
            </View>
          )}

          {loading || soLoading ? (
            <ActivityIndicator color="#E50914" style={{ marginTop: 30 }} />
          ) : loadError ? (
            <View style={styles.emptyBox}>
              <Text style={styles.empty}>{loadError}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setLoading(true);
                  if (viewMode === 'stackoverflow') loadStackOverflow();
                  else loadPublic();
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : viewMode === 'stackoverflow' ? (
            <View>
              {soReport?.sourceUrl ? (
                <TouchableOpacity
                  style={styles.soLinkBtn}
                  onPress={() => Linking.openURL(soReport.sourceUrl)}
                >
                  <Text style={styles.soLinkText}>Full survey on Stack Overflow ↗</Text>
                </TouchableOpacity>
              ) : null}
              {(soReport?.sections || []).map((section: any) => (
                <View key={section.id} style={styles.soSection}>
                  <Text style={styles.soSectionTitle}>{section.title}</Text>
                  <Text style={styles.soSectionSub}>{section.subtitle}</Text>
                  {(section.items || []).map((row: any) => (
                    <View key={`${section.id}-${row.rank}`} style={styles.soRow}>
                      <View style={styles.soRankBadge}>
                        <Text style={styles.soRankText}>#{row.rank}</Text>
                      </View>
                      <Text style={styles.soName} numberOfLines={1}>
                        {row.name}
                      </Text>
                      <Text style={styles.soPercent}>{row.percent}%</Text>
                    </View>
                  ))}
                </View>
              ))}
              {!soReport?.sections?.length ? (
                <Text style={styles.empty}>No Stack Overflow data yet</Text>
              ) : null}
            </View>
          ) : list.length === 0 ? (
            <Text style={styles.empty}>
              No news yet — pull to refresh
              {isAdmin ? ', or open Admin → Refresh feeds.' : '.'}
            </Text>
          ) : (
            list.map((item) => (
              <View
                key={item._id}
                style={[styles.card, item.isPinned && styles.cardPinned]}
              >
                <TouchableOpacity
                  style={styles.cardMain}
                  activeOpacity={0.85}
                  onPress={() => openStory(item)}
                >
                  <NewsThumb uri={item.image} />
                  <View style={styles.cardBody}>
                    <View style={styles.metaRow}>
                      {item.isPinned ? <Text style={styles.pin}>PINNED</Text> : null}
                      {item.isHidden ? <Text style={styles.hidden}>HIDDEN</Text> : null}
                      <Text style={styles.meta}>
                        {(item.category || 'general').toUpperCase()} · {item.source || 'Tech'}
                      </Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={3}>
                      {item.title}
                    </Text>
                    {!!item.summary && (
                      <Text style={styles.cardSummary} numberOfLines={2}>
                        {item.summary}
                      </Text>
                    )}
                    <Text style={styles.date}>{formatWhen(item.publishedAt)}</Text>

                    {adminMode ? (
                      <View style={styles.actions}>
                        <TouchableOpacity
                          onPress={() => patchItem(item._id, { isPinned: !item.isPinned })}
                        >
                          <Text style={styles.action}>{item.isPinned ? 'Unpin' : 'Pin'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => patchItem(item._id, { isHidden: !item.isHidden })}
                        >
                          <Text style={styles.action}>{item.isHidden ? 'Show' : 'Hide'}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.translateBtn}
                  onPress={() => openTranslate(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sparkles-outline" size={14} color="#E50914" />
                  <Text style={styles.translateText}>See translate</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={!!explainItem}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => setExplainItem(null)}
      >
        <SafeAreaProvider>
          <View style={styles.readerSafe}>
            <View style={[styles.readerHeader, { paddingTop: readerTopPad }]}>
              <View style={styles.readerBar}>
                <Pressable
                  style={({ pressed }) => [styles.readerClose, pressed && styles.readerBtnPressed]}
                  onPress={() => setExplainItem(null)}
                  hitSlop={16}
                >
                  <Ionicons name="chevron-back" size={26} color="#fff" />
                  <Text style={styles.readerCloseText}>رجوع</Text>
                </Pressable>
                <Text style={styles.readerTitle} numberOfLines={1}>
                  شرح ELNADY
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.readerDone, pressed && styles.readerBtnPressed]}
                  onPress={() => setExplainItem(null)}
                  hitSlop={16}
                >
                  <Text style={styles.readerDoneText}>إغلاق</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.explainContent}>
              <Text style={styles.explainBrand}>ELNADY</Text>

              {!!explainItem?.image ? (
                <Image
                  source={{ uri: explainItem.image }}
                  style={styles.explainCover}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.explainCover, styles.explainCoverFallback]}>
                  <Ionicons name="newspaper-outline" size={36} color="#E50914" />
                </View>
              )}

              <Text style={styles.explainHeadline} numberOfLines={4}>
                {explainItem?.title}
              </Text>
              <Text style={styles.explainMeta}>
                {(explainItem?.category || 'general').toUpperCase()} · {explainItem?.source || 'Tech'}
              </Text>

              <View style={styles.explainCard}>
                {explainLoading ? (
                  <View style={styles.explainLoadingBox}>
                    <ActivityIndicator color="#E50914" />
                    <Text style={styles.explainLoadingText}>جاري تحميل الشرح…</Text>
                  </View>
                ) : (
                  <Text style={styles.explainBody}>{explainText}</Text>
                )}
              </View>

              {!!explainItem?.url && !explainLoading ? (
                <TouchableOpacity
                  style={styles.explainOpenBtn}
                  onPress={() => {
                    const item = explainItem;
                    setExplainItem(null);
                    if (item) openStory(item);
                  }}
                >
                  <Text style={styles.explainOpenBtnText}>افتح المصدر الأصلي</Text>
                </TouchableOpacity>
              ) : null}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </SafeAreaProvider>
      </Modal>

      <Modal
        visible={!!reader}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => setReader(null)}
      >
        <SafeAreaProvider>
          <View style={styles.readerSafe}>
            <View style={[styles.readerHeader, { paddingTop: readerTopPad }]}>
              <View style={styles.readerBar}>
                <Pressable
                  style={({ pressed }) => [styles.readerClose, pressed && styles.readerBtnPressed]}
                  onPress={() => setReader(null)}
                  hitSlop={16}
                  accessibilityRole="button"
                  accessibilityLabel="رجوع"
                >
                  <Ionicons name="chevron-back" size={26} color="#fff" />
                  <Text style={styles.readerCloseText}>رجوع</Text>
                </Pressable>
                <Text style={styles.readerTitle} numberOfLines={1}>
                  {reader?.source || 'Article'}
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.readerDone, pressed && styles.readerBtnPressed]}
                  onPress={() => setReader(null)}
                  hitSlop={16}
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق"
                >
                  <Text style={styles.readerDoneText}>إغلاق</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.readerBody}>
              {webLoading ? (
                <ArticleLoadingOverlay title={reader?.title} source={reader?.source} />
              ) : null}
              {reader?.url ? (
                <WebView
                  source={{ uri: reader.url }}
                  style={[styles.web, webLoading && styles.webHidden]}
                  startInLoadingState={false}
                  originWhitelist={['https://*', 'http://*', 'about:*']}
                  onLoadStart={() => setWebLoading(true)}
                  onLoadEnd={() => setWebLoading(false)}
                  onError={() => {
                    setWebLoading(false);
                    Alert.alert('Error', 'Could not load this article inside the app');
                  }}
                  onShouldStartLoadWithRequest={(request) => {
                    const url = request?.url || '';
                    // Internal iframe docs — let WebView handle; don't open via Linking
                    if (!url || url.startsWith('about:')) return true;
                    if (url.startsWith('http://') || url.startsWith('https://')) return true;
                    return false;
                  }}
                  onOpenWindow={() => {
                    // Prevent "Can't open url: about:srcdoc" from popup/iframe windows
                  }}
                  allowsBackForwardNavigationGestures
                  setSupportMultipleWindows
                  javaScriptEnabled
                  domStorageEnabled
                  sharedCookiesEnabled
                />
              ) : null}
            </View>
          </View>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 14 },
  backText: { color: '#ccc', fontSize: 15 },
  coverWrap: {
    height: 112,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    backgroundColor: '#0a0a0a',
  },
  cover: { width: '100%', height: '100%' },
  coverFade: {
    ...StyleSheet.absoluteFillObject,
  },
  coverBadge: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.35)',
  },
  coverBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brand: { color: '#E50914', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 6 },
  title: { color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#888', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 16 },
  adminBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  soIntro: { marginBottom: 14 },
  soIntroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  soIntroSub: { color: '#999', fontSize: 12, marginTop: 4, lineHeight: 17 },
  soLinkBtn: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 128, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 128, 36, 0.4)',
  },
  soLinkText: { color: '#F48024', fontWeight: '700', fontSize: 12 },
  soSection: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  soSectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  soSectionSub: { color: '#888', fontSize: 11, marginTop: 2, marginBottom: 10 },
  soRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  soRankBadge: {
    width: 36,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(229,9,20,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  soRankText: { color: '#FF8A8A', fontWeight: '800', fontSize: 11 },
  soName: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
  soPercent: { color: '#4ECDC4', fontWeight: '800', fontSize: 13 },
  adminChip: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  adminChipOn: { borderColor: '#E50914', backgroundColor: '#1a0a0c' },
  refreshChip: { borderColor: '#444' },
  adminChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cats: { marginBottom: 14, maxHeight: 42 },
  catChip: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#141414',
  },
  catChipOn: { borderColor: '#E50914', backgroundColor: '#1a0a0c' },
  catText: { color: '#aaa', fontWeight: '600', fontSize: 13 },
  catTextOn: { color: '#fff' },
  manualBox: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 16,
  },
  manualTitle: { color: '#fff', fontWeight: '800', marginBottom: 10 },
  input: {
    backgroundColor: '#0d0d0d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },
  emptyBox: { marginTop: 24 },
  empty: { color: '#777', lineHeight: 20 },
  retryBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E50914',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: { color: '#E50914', fontWeight: '700' },
  card: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 12,
  },
  cardPinned: { borderColor: '#E50914' },
  cardMain: { flexDirection: 'row', gap: 12 },
  thumb: { width: 84, height: 84, borderRadius: 12, backgroundColor: '#1a1a1a' },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4, alignItems: 'center' },
  pin: { color: '#E50914', fontSize: 10, fontWeight: '800' },
  hidden: { color: '#f59e0b', fontSize: 10, fontWeight: '800' },
  meta: { color: '#777', fontSize: 11, fontWeight: '600' },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700', lineHeight: 20 },
  cardSummary: { color: '#999', fontSize: 12, lineHeight: 17, marginTop: 4 },
  date: { color: '#666', fontSize: 11, marginTop: 6 },
  translateBtn: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  translateText: {
    color: '#E50914',
    fontSize: 13,
    fontWeight: '700',
  },
  actions: { flexDirection: 'row', gap: 16, marginTop: 10 },
  action: { color: '#E50914', fontWeight: '700', fontSize: 12 },
  explainContent: { padding: 20, paddingBottom: 40 },
  explainBrand: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
  },
  explainCover: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#141414',
    marginBottom: 14,
  },
  explainCoverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  explainHeadline: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 8,
  },
  explainMeta: { color: '#777', fontSize: 12, fontWeight: '600', marginBottom: 18 },
  explainCard: {
    backgroundColor: '#141414',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 18,
    minHeight: 120,
  },
  explainBody: {
    color: '#e8e8e8',
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  explainLoadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, gap: 12 },
  explainLoadingText: { color: '#999', fontSize: 14 },
  explainOpenBtn: {
    marginTop: 16,
    backgroundColor: '#E50914',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  explainOpenBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  readerSafe: { flex: 1, backgroundColor: '#050505' },
  readerHeader: {
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    zIndex: 20,
    elevation: 8,
  },
  readerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
    minHeight: 48,
  },
  readerClose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 88,
    minHeight: 44,
    paddingHorizontal: 6,
    justifyContent: 'flex-start',
  },
  readerCloseText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  readerTitle: {
    flex: 1,
    color: '#ccc',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 6,
  },
  readerDone: {
    minWidth: 88,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  readerDoneText: { color: '#E50914', fontWeight: '800', fontSize: 17 },
  readerBtnPressed: { opacity: 0.55 },
  readerBody: { flex: 1, backgroundColor: '#0a0a0a', position: 'relative' },
  web: { flex: 1, backgroundColor: '#0a0a0a' },
  webHidden: { opacity: 0 },
  loadOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    paddingHorizontal: 22,
    paddingTop: 28,
    justifyContent: 'flex-start',
  },
  loadHero: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 28,
  },
  loadIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.45)',
    backgroundColor: 'rgba(229,9,20,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  loadBrand: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  loadTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  loadSource: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  loadTrack: {
    width: 180,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#222',
    overflow: 'hidden',
  },
  loadTrackFill: {
    width: 72,
    height: '100%',
  },
  loadTrackGradient: {
    flex: 1,
  },
  skeletonBlock: {
    gap: 12,
    marginTop: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
  },
  skeletonImg: {
    height: 140,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#171717',
  },
});
