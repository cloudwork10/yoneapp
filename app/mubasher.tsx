import { useUser } from '@/contexts/UserContext';
import CommunityLiveCard from '@/components/CommunityLiveCard';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_HEIGHT = Math.round(SCREEN_WIDTH * 0.58);

type CommunityLive = {
  enabled?: boolean;
  dayName?: string;
  time?: string;
  title?: string;
  topic?: string;
  liveType?: 'talk' | 'guest';
  guestName?: string;
  platform?: 'youtube' | 'tiktok' | 'instagram';
  platformLabel?: string;
  liveState?: 'upcoming' | 'live' | 'done';
  link?: string;
  hasRecording?: boolean;
  recordingUrl?: string;
};

type Cohort = {
  _id: string;
  title?: string;
  communityLive?: CommunityLive;
};

async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function MubasherScreen() {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);

      const publicRes = await fetchWithTimeout(`${API_BASE_URL}/api/club/current`);
      const publicData = await publicRes.json();
      if (publicRes.ok && publicData?.data?.cohort) {
        setCohort(publicData.data.cohort);
      }

      if (user) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const myRes = await fetchWithTimeout(`${API_BASE_URL}/api/club/my`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const myData = await myRes.json();
          if (myRes.ok && myData?.data?.cohort) {
            setCohort(myData.data.cohort);
            setHasAccess(!!myData.data.hasAccess);
          } else {
            setHasAccess(false);
          }
        }
      } else {
        setHasAccess(false);
      }
    } catch {
      setError('تعذر تحميل بيانات البث — حاول مرة أخرى');
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const requireAccess = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please login to join the live.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return false;
    }
    if (!hasAccess) {
      Alert.alert('Subscription required', 'البث المباشر متاح للمشتركين.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: () => router.push('/subscription-2') },
      ]);
      return false;
    }
    return true;
  };

  const live = cohort?.communityLive;
  const isLiveNow = live?.liveState === 'live';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#050505', '#0a0a0a', '#050505']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#E50914"
            />
          }
        >
          <View style={styles.paddedTop}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coverWrap}>
            <ImageBackground
              source={require('../assets/images/mubasher-cover.png')}
              style={styles.cover}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)', 'rgba(5,5,5,0.95)']}
                style={styles.coverOverlay}
              >
                <View style={styles.coverTopRow}>
                  {isLiveNow ? (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>LIVE NOW</Text>
                    </View>
                  ) : (
                    <View style={styles.scheduleBadge}>
                      <Ionicons name="radio-outline" size={12} color="#fff" />
                      <Text style={styles.scheduleBadgeText}>WEEKLY LIVE</Text>
                    </View>
                  )}
                  <View style={styles.platformBadge}>
                    <Text style={styles.platformBadgeText}>
                      {live?.platformLabel || 'YouTube'}
                    </Text>
                  </View>
                </View>

                <View style={styles.coverBottom}>
                  <Text style={styles.coverBrand}>ELNADY</Text>
                  <Text style={styles.coverTitle}>مباشر</Text>
                  <Text style={styles.coverSubtitle}>
                    {live?.title || 'Community Thursday'} · كل{' '}
                    {live?.dayName || 'خميس'} · {live?.time || '21:00'}
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          <View style={styles.paddedBody}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <CommunityLiveCard
              communityLive={cohort?.communityLive}
              hasAccess={hasAccess}
              onRequireAccess={requireAccess}
            />

            {cohort?.communityLive?.enabled === false ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>لا يوجد بث مفعّل حالياً</Text>
                <Text style={styles.emptyHint}>
                  سيتم إعلان موعد اللايف القادم قريباً
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  paddedTop: { paddingHorizontal: 20, paddingTop: 8 },
  paddedBody: { paddingHorizontal: 20, paddingTop: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10 },
  backText: { color: '#ccc', fontSize: 15 },
  coverWrap: {
    width: SCREEN_WIDTH,
    marginBottom: 0,
    overflow: 'hidden',
  },
  cover: {
    width: SCREEN_WIDTH,
    height: COVER_HEIGHT,
    minHeight: 200,
  },
  coverOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  coverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E50914',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scheduleBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  platformBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  platformBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  coverBottom: {
    gap: 2,
  },
  coverBrand: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 2,
  },
  coverTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  coverSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  error: { color: '#E50914', fontSize: 13, marginBottom: 12 },
  emptyBox: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 16,
  },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyHint: { color: '#888', fontSize: 13, lineHeight: 19 },
});
