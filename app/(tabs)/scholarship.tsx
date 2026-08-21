import { useUser } from '@/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import API_BASE_URL from '../../config/api';
import NotificationService from '../../services/NotificationService';
import CommunityLiveCard from '../../components/CommunityLiveCard';
import { PAID_FLOW_ENABLED, SUBSCRIBE_ROUTE } from '../../utils/subscriptionAccess';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WhatsappGroup = {
  _id?: string;
  label: string;
  hasLink?: boolean;
  link?: string;
};

type WeeklySlot = {
  _id?: string;
  dayOfWeek?: number;
  time?: string;
  dayName?: string;
  label?: string;
};

type Track = {
  _id?: string;
  title: string;
  description?: string;
  order?: number;
  unlockWeek?: number;
  zoomLink?: string;
  whatsappGroups?: WhatsappGroup[];
  weeklySlots?: WeeklySlot[];
  groupCount?: number;
  openGroupCount?: number;
};

type Session = {
  _id: string;
  title: string;
  trackId?: string;
  startsAt: string;
  durationMinutes?: number;
  liveState: 'upcoming' | 'live' | 'done';
  hasRecording?: boolean;
  recordingUrl?: string;
  zoomLink?: string;
  canJoin?: boolean;
  isAuto?: boolean;
};

type Cohort = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  tracks?: Track[];
  sessions?: Session[];
  whatsappLink?: string;
  communityLive?: {
    enabled?: boolean;
    dayOfWeek?: number;
    dayName?: string;
    time?: string;
    title?: string;
    topic?: string;
    liveType?: 'talk' | 'guest';
    guestName?: string;
    platform?: 'youtube' | 'tiktok' | 'instagram';
    platformLabel?: string;
    startsAt?: string;
    liveState?: 'upcoming' | 'live' | 'done';
    hasLink?: boolean;
    link?: string;
    hasRecording?: boolean;
    recordingUrl?: string;
    canJoin?: boolean;
  };
};

type RecordedLesson = {
  _id?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  taskPdfUrl?: string;
  readingPdfUrl?: string;
  duration?: string;
};

type RecordedSection = {
  _id?: string;
  title?: string;
  lessons?: RecordedLesson[];
};

type RecordedCourse = {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  thumbnail?: string;
  level?: string;
  duration?: string;
  sections?: RecordedSection[];
};

const TRACK_ACCENTS = [
  '#E50914',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#A29BFE',
  '#FD79A8',
  '#00B894',
  '#FDCB6E',
];

const FALLBACK_TRACKS: Track[] = [
  {
    title: 'Intro to Programming',
    description: 'Logic, fundamentals, and first projects',
    order: 1,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Sunday 7:00 PM' },
      { label: 'Wednesday 8:00 PM' },
    ],
  },
  {
    title: 'Cyber Security',
    description: 'Networks, security basics, and ethical hacking intro',
    order: 2,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Monday 7:30 PM' },
      { label: 'Thursday 9:00 PM' },
    ],
  },
  {
    title: 'Front End',
    description: 'HTML, CSS, JavaScript, and modern UI',
    order: 3,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Tuesday 7:00 PM' },
      { label: 'Saturday 8:30 PM' },
    ],
  },
  {
    title: 'Back End',
    description: 'APIs, databases, and server-side development',
    order: 4,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Sunday 8:00 PM' },
      { label: 'Thursday 7:00 PM' },
    ],
  },
  {
    title: 'Mobile Apps',
    description: 'Build iOS & Android apps with React Native',
    order: 5,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Monday 8:00 PM' },
      { label: 'Friday 7:30 PM' },
    ],
  },
  {
    title: 'Data Analysis',
    description: 'Excel, SQL, dashboards, and insights',
    order: 6,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Tuesday 8:30 PM' },
      { label: 'Friday 9:00 PM' },
    ],
  },
  {
    title: 'UI UX Design',
    description: 'Research, wireframes, prototypes, and testing',
    order: 7,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Wednesday 7:00 PM' },
      { label: 'Saturday 7:00 PM' },
    ],
  },
  {
    title: 'AI Automation',
    description: 'AI tools, workflows, and practical automation',
    order: 8,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Sunday 9:00 PM' },
      { label: 'Tuesday 9:00 PM' },
    ],
  },
  {
    title: 'Media Buying',
    description: 'Paid ads, campaigns, and performance marketing',
    order: 9,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Monday 9:30 PM' },
      { label: 'Wednesday 8:30 PM' },
    ],
  },
  {
    title: 'Freelancing',
    description: 'Pricing, proposals, clients, and delivery',
    order: 10,
    groupCount: 1,
    whatsappGroups: [{ label: 'Group 1' }],
    weeklySlots: [
      { label: 'Thursday 8:00 PM' },
      { label: 'Saturday 9:00 PM' },
    ],
  },
];

const FALLBACK_COHORT: Cohort = {
  _id: 'local-fallback',
  title: 'النادي · دفعة أكتوبر 2026',
  description: 'Live tracks · Zoom sessions · WhatsApp communities per specialization',
  startDate: '2026-10-10T17:00:00.000Z',
  endDate: '2026-12-05T21:00:00.000Z',
  status: 'upcoming',
  tracks: FALLBACK_TRACKS,
  sessions: [],
};

function normalizeExternalUrl(raw?: string) {
  if (!raw) return '';
  let url = String(raw).trim();
  if (!url) return '';
  if (url.startsWith('www.')) url = `https://${url}`;

  if (url.startsWith('zoommtg://') || url.startsWith('zoomus://')) {
    const confno = url.match(/[?&]confno=(\d+)/)?.[1];
    const pwd = url.match(/[?&]pwd=([^&]+)/)?.[1];
    if (confno) {
      return pwd ? `https://zoom.us/j/${confno}?pwd=${pwd}` : `https://zoom.us/j/${confno}`;
    }
    return '';
  }

  if (!/^https?:\/\//i.test(url)) {
    if (/^\d{9,13}$/.test(url)) return `https://zoom.us/j/${url}`;
    return '';
  }
  return url;
}

/** Convert Zoom /j/ links to Web Client so join works in browser without installing the Zoom app. */
function toZoomWebJoinUrl(raw?: string) {
  const normalized = normalizeExternalUrl(raw);
  if (!normalized) return '';

  try {
    const u = new URL(normalized);
    if (/\/wc\/(join|start)\//i.test(u.pathname)) {
      return u.toString();
    }

    const joinMatch = u.pathname.match(/\/j\/(\d+)/i);
    const meetingId = joinMatch?.[1] || u.searchParams.get('confno') || '';
    if (!meetingId) return normalized;

    const pwd = u.searchParams.get('pwd');
    const host = u.host.includes('zoom') ? u.host : 'zoom.us';
    const web = new URL(`https://${host}/wc/join/${meetingId}`);
    if (pwd) web.searchParams.set('pwd', pwd);
    // Prefer browser join UI over "open/download app" prompts
    web.searchParams.set('fromPWA', '1');
    return web.toString();
  } catch {
    return normalized;
  }
}

function formatDate(value?: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatTime(value?: string) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getCountdownParts(dateStr?: string) {
  if (!dateStr) return null;
  const target = new Date(dateStr).getTime();
  const diff = target - Date.now();
  if (diff <= 0) {
    return { totalMs: diff, days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { totalMs: diff, days, hours, minutes, seconds, done: false };
}

function formatStartStrong(value?: string) {
  if (!value) return { day: '—', month: '', year: '' };
  try {
    const d = new Date(value);
    return {
      day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
      month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      year: d.toLocaleDateString('en-GB', { year: 'numeric' }),
    };
  } catch {
    return { day: value, month: '', year: '' };
  }
}

function egyptTodayParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(get('year')),
    month: Number(get('month')) - 1,
    day: Number(get('day')),
    weekday: weekdayMap[get('weekday') || ''] ?? date.getDay(),
  };
}

function egyptLocalIso(year: number, monthIndex: number, day: number, hours: number, minutes: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return new Date(
    `${year}-${pad(monthIndex + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00+03:00`
  ).toISOString();
}

type PlayableVideo = {
  kind: 'direct' | 'youtube' | 'drive' | 'web';
  uri: string;
  title: string;
};

function extractYouTubeId(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
  return m?.[1] || null;
}

function extractGoogleDriveId(url: string): string | null {
  const m =
    url.match(/drive\.google\.com\/file\/d\/([^/]+)/i) ||
    url.match(/[?&]id=([^&]+)/i);
  return m?.[1] || null;
}

/** Normalize lecture URLs for in-app playback (Netflix-style modal). */
function resolvePlayableVideo(raw?: string, title = 'Lecture'): PlayableVideo | null {
  const url = String(raw || '').trim();
  if (!url) return null;

  const yt = extractYouTubeId(url);
  if (yt) {
    return {
      kind: 'youtube',
      // nocookie + origin helps avoid YouTube Error 153 inside WebView
      uri: `https://www.youtube-nocookie.com/embed/${yt}?playsinline=1&rel=0&modestbranding=1&enablejsapi=1`,
      title,
    };
  }

  const driveId = extractGoogleDriveId(url);
  if (driveId || /drive\.google\.com/i.test(url)) {
    const id = driveId || '';
    return {
      kind: 'drive',
      // Preview embed works in WebView when file sharing is "Anyone with the link"
      uri: id
        ? `https://drive.google.com/file/d/${id}/preview`
        : url,
      title,
    };
  }

  // Direct streamable files (mp4, m3u8, webm, uploaded to your server, etc.)
  if (/\.(mp4|m3u8|webm|mov)(\?|$)/i.test(url) || /gtv-videos-bucket|cloudinary|uploads\/videos/i.test(url)) {
    return { kind: 'direct', uri: url, title };
  }

  // Fallback: open in in-app webview (Vimeo pages, etc.)
  return { kind: 'web', uri: url, title };
}

/** Build today's lives from fixed weeklySlots (auto-refreshes each day). */
function buildTodayLivesFromTracks(tracks?: Track[]): Session[] {
  const { year, month, day, weekday } = egyptTodayParts();
  const now = Date.now();
  const out: Session[] = [];

  for (const track of tracks || []) {
    for (const slot of track.weeklySlots || []) {
      let dayOfWeek = Number(slot.dayOfWeek);
      if (Number.isNaN(dayOfWeek) && slot.label) {
        const label = slot.label.toLowerCase();
        const map: Record<string, number> = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };
        for (const [name, value] of Object.entries(map)) {
          if (label.includes(name)) dayOfWeek = value;
        }
      }
      if (dayOfWeek !== weekday) continue;

      let hours = 19;
      let minutes = 0;
      if (slot.time && /^\d{1,2}:\d{2}/.test(slot.time)) {
        const [h, m] = slot.time.split(':').map(Number);
        hours = h;
        minutes = m || 0;
      } else if (slot.label) {
        const m12 = slot.label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (m12) {
          hours = Number(m12[1]) % 12;
          if (/pm/i.test(m12[3])) hours += 12;
          minutes = Number(m12[2]);
        }
      }

      const startsAt = egyptLocalIso(year, month, day, hours, minutes);
      const endsAt = new Date(startsAt).getTime() + 120 * 60 * 1000;
      let liveState: Session['liveState'] = 'upcoming';
      if (now >= new Date(startsAt).getTime() && now <= endsAt) liveState = 'live';
      else if (now > endsAt) liveState = 'done';

      out.push({
        _id: `today-${track._id || track.title}-${hours}${minutes}`,
        title: `${track.title} — Live`,
        trackId: track._id,
        startsAt,
        durationMinutes: 120,
        liveState,
        zoomLink: track.zoomLink,
        isAuto: true,
      });
    }
  }

  return out.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

function buildDemoTodayLives(): Session[] {
  const { year, month, day } = egyptTodayParts();
  return [
    {
      _id: 'demo-live-1',
      title: 'Front End — Live',
      startsAt: egyptLocalIso(year, month, day, 19, 0),
      durationMinutes: 120,
      liveState: 'upcoming',
      zoomLink: '',
      isAuto: true,
    },
    {
      _id: 'demo-live-2',
      title: 'Back End — Live',
      startsAt: egyptLocalIso(year, month, day, 20, 30),
      durationMinutes: 120,
      liveState: 'upcoming',
      zoomLink: '',
      isAuto: true,
    },
  ];
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function ClubScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const userRef = useRef(user);
  userRef.current = user;

  // Always start with visible content — never a blocking spinner
  const [refreshing, setRefreshing] = useState(false);
  const [cohort, setCohort] = useState<Cohort>(FALLBACK_COHORT);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [recordedCourses, setRecordedCourses] = useState<RecordedCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<RecordedCourse | null>(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [courseDetailLoading, setCourseDetailLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<PlayableVideo | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      console.log('🏟️ Club load', API_BASE_URL);

      const publicRes = await fetchWithTimeout(`${API_BASE_URL}/api/club/current`);
      const publicData = await publicRes.json();
      if (publicRes.ok && publicData?.data?.cohort) {
        setCohort(publicData.data.cohort);
        // Refresh lecture reminders from latest weekly slots
        NotificationService.scheduleClubLectureNotifications(
          publicData.data.cohort.tracks || []
        ).catch(() => {});
      }

      try {
        const coursesRes = await fetchWithTimeout(`${API_BASE_URL}/api/public/courses`);
        const coursesData = await coursesRes.json();
        const list =
          coursesData?.data?.courses ||
          coursesData?.courses ||
          (Array.isArray(coursesData?.data) ? coursesData.data : []) ||
          [];
        setRecordedCourses(
          (list as any[]).map((c) => ({
            _id: c._id || c.id,
            title: c.title || 'Untitled course',
            description: c.description || '',
            instructor: c.instructor || '',
            thumbnail: c.thumbnail || c.image || '',
            level: c.level || '',
            duration: c.duration || '',
            sections: c.sections || [],
          }))
        );
      } catch {
        // keep previous courses list
      }

      if (userRef.current) {
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
    } catch (e: any) {
      console.warn('🏟️ Club load failed:', e?.message || e);
      setError('تعذر الاتصال بالسيرفر — معروض البيانات الأساسية');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const countdown = daysUntil(cohort?.startDate);
  const startStrong = useMemo(() => formatStartStrong(cohort?.startDate), [cohort?.startDate]);
  const [liveCountdown, setLiveCountdown] = useState(() => getCountdownParts(cohort?.startDate));
  const tickScale = useRef(new Animated.Value(1)).current;
  const pulseGlow = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    setLiveCountdown(getCountdownParts(cohort?.startDate));
    const id = setInterval(() => {
      setLiveCountdown(getCountdownParts(cohort?.startDate));
      tickScale.setValue(1.12);
      Animated.spring(tickScale, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }).start();
    }, 1000);
    return () => clearInterval(id);
  }, [cohort?.startDate, tickScale]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseGlow, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseGlow, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseGlow]);

  const todaySessions = useMemo(() => {
    const list = cohort?.sessions || [];
    const todayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const fromApi = list
      .filter((s) => {
        const key = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Africa/Cairo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(s.startsAt));
        return key === todayKey;
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    if (fromApi.length > 0) return fromApi;

    const fromTracks = buildTodayLivesFromTracks(cohort?.tracks);
    if (fromTracks.length > 0) return fromTracks;

    // Preview placeholder until real weekly lives exist for today
    return buildDemoTodayLives();
  }, [cohort]);

  const nextSession = useMemo(() => {
    return (
      todaySessions.find((s) => s.liveState === 'live') ||
      todaySessions.find((s) => s.liveState === 'upcoming') ||
      null
    );
  }, [todaySessions]);

  const openZoomInBrowser = async (url?: string, fallbackMsg?: string) => {
    // Zoom Web Client — join from browser, no Zoom app required
    const webUrl = toZoomWebJoinUrl(url);
    if (!webUrl) {
      Alert.alert('No valid link', fallbackMsg || 'Ask admin to add the Zoom link in Club Management.');
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(webUrl, {
        controlsColor: '#E50914',
        dismissButtonStyle: 'close',
        enableBarCollapsing: true,
        showInRecents: true,
        createTask: false,
        ...(Platform.OS === 'ios'
          ? { presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN }
          : { toolbarColor: '#111111' }),
      });
    } catch (e) {
      console.warn('Zoom web join failed:', e);
      Alert.alert('Error', 'Could not open Zoom in the app browser. Try again.');
    }
  };

  const openZoomAppOrDownload = async (url?: string, fallbackMsg?: string) => {
    // Original Zoom join page — opens Zoom app if installed, otherwise App Store / download
    const normalized = normalizeExternalUrl(url);
    if (!normalized) {
      Alert.alert('No valid link', fallbackMsg || 'Ask admin to add the Zoom link in Club Management.');
      return;
    }
    try {
      await Linking.openURL(normalized);
    } catch {
      Alert.alert('Error', 'Could not open the Zoom link.');
    }
  };

  const chooseZoomJoin = (url?: string, fallbackMsg?: string) => {
    const normalized = normalizeExternalUrl(url);
    if (!normalized) {
      Alert.alert('No valid link', fallbackMsg || 'Ask admin to add the Zoom link in Club Management.');
      return;
    }

    Alert.alert(
      'Join Zoom',
      'اختار طريقة الدخول للمحاضرة',
      [
        {
          text: 'مشاهدة من المتصفح',
          onPress: () => openZoomInBrowser(url, fallbackMsg),
        },
        {
          text: 'فتح / تحميل تطبيق Zoom',
          onPress: () => openZoomAppOrDownload(url, fallbackMsg),
        },
        { text: 'إلغاء', style: 'cancel' },
      ]
    );
  };

  const resolveSessionZoom = (session: Session) => {
    if (session.zoomLink) return session.zoomLink;
    const track = (cohort?.tracks || []).find((t) => t._id && session.trackId && t._id === session.trackId);
    return track?.zoomLink || '';
  };

  const joinSession = (session: Session) => {
    chooseZoomJoin(
      resolveSessionZoom(session),
      'Add the Zoom link for this specialization in Club Management.'
    );
  };

  const openLink = async (url?: string, fallbackMsg?: string) => {
    const normalized = normalizeExternalUrl(url) || (url && /^https?:\/\//i.test(String(url).trim()) ? String(url).trim() : '');
    if (!normalized) {
      Alert.alert('No valid link', fallbackMsg || 'Ask admin to add the link in Club Management.');
      return;
    }
    try {
      await Linking.openURL(normalized);
    } catch {
      Alert.alert('Error', 'Could not open the link.');
    }
  };

  const requireAccess = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please login to access النادي.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return false;
    }
    if (!hasAccess) {
      Alert.alert(
        'Subscription required',
        'النادي is available for active subscribers.',
        PAID_FLOW_ENABLED
          ? [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Subscribe', onPress: () => router.push(SUBSCRIBE_ROUTE) },
            ]
          : [{ text: 'OK', style: 'cancel' }]
      );
      return false;
    }
    return true;
  };

  const openPdfOrLink = async (url?: string, emptyMsg?: string) => {
    const normalized =
      normalizeExternalUrl(url) || (url && /^https?:\/\//i.test(String(url).trim()) ? String(url).trim() : '');
    if (!normalized) {
      Alert.alert('Not available', emptyMsg || 'This file has not been uploaded yet.');
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(normalized, {
        controlsColor: '#E50914',
        dismissButtonStyle: 'close',
      });
    } catch {
      try {
        await Linking.openURL(normalized);
      } catch {
        Alert.alert('Error', 'Could not open the file.');
      }
    }
  };

  const playLectureVideo = (url?: string, title?: string) => {
    const playable = resolvePlayableVideo(url, title || 'المحاضرة');
    if (!playable) {
      Alert.alert('Not available', 'Lecture video has not been uploaded yet.');
      return;
    }
    setPlayingVideo(playable);
  };

  const closeVideoPlayer = () => setPlayingVideo(null);

  const openVideoExternally = async () => {
    if (!playingVideo) return;
    const ytId = extractYouTubeId(playingVideo.uri);
    const external = ytId
      ? `https://www.youtube.com/watch?v=${ytId}`
      : playingVideo.uri;
    try {
      await WebBrowser.openBrowserAsync(external, {
        controlsColor: '#E50914',
        dismissButtonStyle: 'close',
      });
    } catch {
      await Linking.openURL(external).catch(() => {});
    }
  };

  const openRecordedCourse = async (course: RecordedCourse) => {
    if (!requireAccess()) return;
    setPlayingVideo(null);
    setCourseModalVisible(true);
    setSelectedCourse(course);
    setCourseDetailLoading(true);
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/public/courses/${course._id}`);
      const data = await res.json();
      const full = data?.data?.course || data?.course || data?.data;
      if (res.ok && full) {
        setSelectedCourse({
          _id: full._id || course._id,
          title: full.title || course.title,
          description: full.description || course.description,
          instructor: full.instructor || course.instructor,
          thumbnail: full.thumbnail || course.thumbnail,
          level: full.level || course.level,
          duration: full.duration || course.duration,
          sections: full.sections || [],
        });
      }
    } catch (e) {
      console.warn('Course detail load failed:', e);
    } finally {
      setCourseDetailLoading(false);
    }
  };

  const closeCourseModal = () => {
    setPlayingVideo(null);
    setCourseModalVisible(false);
    setSelectedCourse(null);
    setCourseDetailLoading(false);
  };

  const flatLessons = useMemo(() => {
    const sections = selectedCourse?.sections || [];
    const lessons: Array<RecordedLesson & { sectionTitle?: string; key: string }> = [];
    sections.forEach((section, sIdx) => {
      (section.lessons || []).forEach((lesson, lIdx) => {
        lessons.push({
          ...lesson,
          sectionTitle: section.title,
          key: String(lesson._id || `${sIdx}-${lIdx}`),
        });
      });
    });
    return lessons;
  }, [selectedCourse]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#050505', '#121212']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
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
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.brand}>ELNADY</Text>
          <Text style={styles.title}>Elnady</Text>
          <Text style={styles.cohortName}>{cohort?.title || 'October 2026 Cohort'}</Text>
          <Text style={styles.subtitle}>
            {cohort?.description ||
              'Live tracks · Zoom sessions · WhatsApp communities per specialization'}
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardStart]}>
              <Text style={styles.statLabelOn}>STARTS</Text>
              <Text style={styles.startDay}>{startStrong.day}</Text>
              <Text style={styles.startMonth}>
                {startStrong.month}
                {startStrong.year ? ` ${startStrong.year}` : ''}
              </Text>
            </View>

            <View style={[styles.statCard, styles.statCardCountdown]}>
              <Text style={styles.statLabelOn}>COUNTDOWN</Text>
              {liveCountdown == null ? (
                <Text style={styles.statValue}>—</Text>
              ) : liveCountdown.done || (countdown !== null && countdown <= 0) ? (
                <Animated.Text style={[styles.countdownLive, { opacity: pulseGlow }]}>
                  {countdown === 0 ? 'TODAY' : 'LIVE'}
                </Animated.Text>
              ) : (
                <Animated.View style={{ transform: [{ scale: tickScale }] }}>
                  <Text style={styles.countdownDays}>{liveCountdown.days}</Text>
                  <Text style={styles.countdownUnit}>DAYS</Text>
                  <View style={styles.countdownHmsRow}>
                    <Text style={styles.countdownHms}>
                      {String(liveCountdown.hours).padStart(2, '0')}
                    </Text>
                    <Text style={styles.countdownColon}>:</Text>
                    <Text style={styles.countdownHms}>
                      {String(liveCountdown.minutes).padStart(2, '0')}
                    </Text>
                    <Text style={styles.countdownColon}>:</Text>
                    <Text style={[styles.countdownHms, styles.countdownSec]}>
                      {String(liveCountdown.seconds).padStart(2, '0')}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>

            <View style={[styles.statCard, hasAccess && styles.statCardOn]}>
              <Text style={styles.statLabel}>Access</Text>
              <Text style={styles.statValue}>{hasAccess ? 'Open' : 'Locked'}</Text>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <CommunityLiveCard
            communityLive={cohort?.communityLive}
            hasAccess={hasAccess}
            onRequireAccess={requireAccess}
          />

          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <Text style={styles.panelEyebrow}>TODAY · SPECIALIZATION LIVE</Text>
              {nextSession?.liveState === 'live' ? (
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.livePillText}>NOW</Text>
                </View>
              ) : null}
            </View>

            {nextSession ? (
              <>
                <Text style={styles.panelTitle}>{nextSession.title}</Text>
                <Text style={styles.panelMeta}>
                  {formatDate(nextSession.startsAt)} · {formatTime(nextSession.startsAt)} ·{' '}
                  {nextSession.durationMinutes || 120} min · Zoom
                </Text>

                {hasAccess ? (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => joinSession(nextSession)}
                  >
                    <Ionicons name="videocam" size={18} color="#fff" />
                    <Text style={styles.primaryBtnText}>Join Zoom</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                      if (!requireAccess()) return;
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Unlock with subscription</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.muted}>No specialization Zoom live for today.</Text>
            )}
          </View>

          <Text style={styles.sectionLabel}>SPECIALIZATIONS</Text>
          <Text style={styles.sectionHint}>
            Each track can have multiple WhatsApp groups when one group gets full.
          </Text>

          {(cohort?.tracks || []).map((track, idx) => {
            const key = track._id || track.title;
            const open = expandedTrack === key;
            const accent = TRACK_ACCENTS[idx % TRACK_ACCENTS.length];
            const groups = track.whatsappGroups || [];

            return (
              <View key={key} style={styles.trackCard}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setExpandedTrack(open ? null : key)}
                  style={styles.trackHeader}
                >
                  <View style={[styles.trackBar, { backgroundColor: accent }]} />
                  <View style={styles.flex}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    {!!track.description && (
                      <Text style={styles.trackDesc} numberOfLines={open ? 4 : 1}>
                        {track.description}
                      </Text>
                    )}
                    <Text style={styles.trackMeta}>
                      {(track.groupCount || groups.length || 1)} WhatsApp group
                      {(track.groupCount || groups.length || 1) === 1 ? '' : 's'}
                      {hasAccess && track.openGroupCount
                        ? ` · ${track.openGroupCount} ready`
                        : ''}
                    </Text>
                    <View style={styles.slotRow}>
                      {(track.weeklySlots || []).slice(0, 2).map((slot, sIdx) => (
                        <View key={slot._id || `${key}-slot-${sIdx}`} style={styles.slotChip}>
                          <Ionicons name="time-outline" size={12} color="#E50914" />
                          <Text style={styles.slotChipText}>
                            {slot.label || `${slot.dayName || ''} ${slot.time || ''}`.trim()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#888"
                  />
                </TouchableOpacity>

                {open ? (
                  <View style={styles.trackBody}>
                    <Text style={styles.scheduleMiniTitle}>Weekly live times</Text>
                    {(track.weeklySlots || []).length === 0 ? (
                      <Text style={styles.muted}>Schedule coming soon.</Text>
                    ) : (
                      (track.weeklySlots || []).map((slot, sIdx) => (
                        <View key={slot._id || `${key}-full-slot-${sIdx}`} style={styles.scheduleMiniRow}>
                          <Ionicons name="calendar-outline" size={14} color="#aaa" />
                          <Text style={styles.scheduleMiniText}>
                            {slot.label || `${slot.dayName || ''} ${slot.time || ''}`.trim()}
                          </Text>
                        </View>
                      ))
                    )}

                    {!hasAccess ? (
                      <TouchableOpacity style={styles.lockBtn} onPress={() => requireAccess()}>
                        <Ionicons name="lock-closed" size={16} color="#fff" />
                        <Text style={styles.lockBtnText}>Subscribe to join WhatsApp groups</Text>
                      </TouchableOpacity>
                    ) : groups.length === 0 ? (
                      <Text style={styles.muted}>No WhatsApp groups added yet.</Text>
                    ) : (
                      groups.map((group, gIdx) => (
                        <TouchableOpacity
                          key={group._id || `${key}-g-${gIdx}`}
                          style={styles.waRow}
                          onPress={() =>
                            openLink(
                              group.link,
                              `${track.title} · ${group.label} link is empty. Add it in Club Management.`
                            )
                          }
                        >
                          <View style={styles.waIconWrap}>
                            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                          </View>
                          <View style={styles.flex}>
                            <Text style={styles.waLabel}>{group.label || `Group ${gIdx + 1}`}</Text>
                            <Text style={styles.waHint}>
                              {group.hasLink || group.link ? 'Tap to join' : 'Link not set yet'}
                            </Text>
                          </View>
                          <Ionicons name="open-outline" size={16} color="#666" />
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}

          <Text style={styles.sectionLabel}>TODAY'S LIVES</Text>
          <Text style={styles.sectionHint}>
            يتجدد تلقائي حسب مواعيد النهاردة — اعمل Pull to refresh.
          </Text>
          <View style={styles.scheduleCard}>
            {todaySessions.length === 0 ? (
              <Text style={[styles.muted, { paddingVertical: 14 }]}>
                No lives scheduled for today.
              </Text>
            ) : (
              todaySessions.map((session, i) => (
                <View
                  key={session._id}
                  style={[
                    styles.scheduleRow,
                    i === todaySessions.length - 1 && styles.scheduleRowLast,
                  ]}
                >
                  <View style={styles.flex}>
                    <Text style={styles.scheduleTitle}>{session.title}</Text>
                    <Text style={styles.scheduleMeta}>
                      {formatTime(session.startsAt)}
                      {session.liveState === 'live' ? ' · LIVE' : ''}
                    </Text>
                  </View>
                  {hasAccess && (session.liveState === 'live' || session.liveState === 'upcoming') ? (
                    <TouchableOpacity
                      style={styles.miniJoin}
                      onPress={() => joinSession(session)}
                    >
                      <Text style={styles.miniJoinText}>Join</Text>
                    </TouchableOpacity>
                  ) : session.hasRecording && hasAccess ? (
                    <TouchableOpacity
                      style={styles.miniGhost}
                      onPress={() => openLink(session.recordingUrl)}
                    >
                      <Text style={styles.miniGhostText}>Replay</Text>
                    </TouchableOpacity>
                  ) : hasAccess && session.liveState === 'done' ? (
                    <Text style={styles.locked}>Done</Text>
                  ) : (
                    <Text style={styles.locked}>Locked</Text>
                  )}
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionLabel}>المحتويات المسجلة</Text>
          <Text style={styles.sectionHint}>
            للكورسات للمشتركين فقط — زي مواعيد اللايفات.
          </Text>

          {recordedCourses.length === 0 ? (
            <View style={styles.scheduleCard}>
              <Text style={[styles.muted, { paddingVertical: 14 }]}>
                No recorded courses yet. Add them from Club Management.
              </Text>
            </View>
          ) : (
            recordedCourses.map((course) => (
              <TouchableOpacity
                key={course._id}
                style={styles.recordedCourseCard}
                activeOpacity={0.85}
                onPress={() => openRecordedCourse(course)}
              >
                <View style={styles.recordedCourseIcon}>
                  <Ionicons
                    name={hasAccess ? 'play-circle' : 'lock-closed'}
                    size={22}
                    color={hasAccess ? '#E50914' : '#666'}
                  />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.recordedCourseTitle}>{course.title}</Text>
                  <Text style={styles.recordedCourseMeta} numberOfLines={1}>
                    {[course.instructor, course.level, course.duration].filter(Boolean).join(' · ') ||
                      (hasAccess ? 'Tap to open lectures' : 'Subscription required')}
                  </Text>
                </View>
                {hasAccess ? (
                  <Ionicons name="chevron-forward" size={18} color="#666" />
                ) : (
                  <Text style={styles.locked}>Locked</Text>
                )}
              </TouchableOpacity>
            ))
          )}

          {!hasAccess && PAID_FLOW_ENABLED ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 8 }]}
              onPress={() => router.push(SUBSCRIBE_ROUTE)}
            >
              <Text style={styles.primaryBtnText}>Subscribe & enter النادي</Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ height: 48 }} />
        </ScrollView>

        <Modal
          visible={courseModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={closeCourseModal}
        >
          <SafeAreaView style={[styles.modalSafe, { paddingTop: Math.max(insets.top, 12) }]} edges={['left', 'right', 'bottom']}>
            {playingVideo ? (
              <View style={styles.playerSafe}>
                <View style={styles.playerHeader}>
                  <TouchableOpacity style={styles.playerClose} onPress={closeVideoPlayer}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.playerTitle} numberOfLines={1}>
                    {playingVideo.title || 'المحاضرة'}
                  </Text>
                  <TouchableOpacity style={styles.playerClose} onPress={openVideoExternally}>
                    <Ionicons name="open-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View
                  style={
                    playingVideo.kind === 'direct' ? styles.playerStage : styles.playerStageFlex
                  }
                >
                  {playingVideo.kind === 'direct' ? (
                    <Video
                      source={{ uri: playingVideo.uri }}
                      style={styles.playerVideo}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      useNativeControls
                      isLooping={false}
                    />
                  ) : playingVideo.kind === 'youtube' ? (
                    <WebView
                      originWhitelist={['*']}
                      source={{
                        baseUrl: 'https://www.youtube-nocookie.com',
                        html: `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<meta name="referrer" content="strict-origin-when-cross-origin"/>
<style>*{margin:0;padding:0;background:#000}html,body{height:100%;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style>
</head><body>
<iframe
  src="${playingVideo.uri}"
  title="YouTube"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
  allowfullscreen
></iframe>
</body></html>`,
                      }}
                      style={styles.playerWeb}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                      domStorageEnabled
                      setSupportMultipleWindows={false}
                      startInLoadingState
                      renderLoading={() => (
                        <View style={styles.playerLoading}>
                          <ActivityIndicator color="#E50914" size="large" />
                        </View>
                      )}
                    />
                  ) : (
                    <WebView
                      source={{ uri: playingVideo.uri }}
                      style={styles.playerWeb}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                      domStorageEnabled
                      startInLoadingState
                      renderLoading={() => (
                        <View style={styles.playerLoading}>
                          <ActivityIndicator color="#E50914" size="large" />
                        </View>
                      )}
                    />
                  )}
                </View>

                <TouchableOpacity style={styles.externalBtn} onPress={openVideoExternally}>
                  <Text style={styles.externalBtnText}>فتح خارجي لو مش شغال</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.flex}>
                    <Text style={styles.modalEyebrow}>المحتويات المسجلة</Text>
                    <Text style={styles.modalTitle} numberOfLines={2}>
                      {selectedCourse?.title || 'Course'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.modalClose} onPress={closeCourseModal}>
                    <Ionicons name="close" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                {courseDetailLoading ? (
                  <View style={styles.modalLoading}>
                    <ActivityIndicator color="#E50914" />
                    <Text style={styles.muted}>Loading lectures…</Text>
                  </View>
                ) : (
                  <ScrollView
                    contentContainerStyle={styles.modalContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {!!selectedCourse?.description && (
                      <Text style={styles.modalDesc}>{selectedCourse.description}</Text>
                    )}

                    {flatLessons.length === 0 ? (
                      <Text style={styles.muted}>No lectures uploaded in this course yet.</Text>
                    ) : (
                      flatLessons.map((lesson, index) => (
                        <View key={lesson.key} style={styles.lectureCard}>
                          <Text style={styles.lectureIndex}>محاضرة {index + 1}</Text>
                          <Text style={styles.lectureTitle}>
                            {lesson.title || `Lecture ${index + 1}`}
                          </Text>
                          {!!lesson.sectionTitle && (
                            <Text style={styles.lectureSection}>{lesson.sectionTitle}</Text>
                          )}
                          {!!lesson.duration && (
                            <Text style={styles.lectureMeta}>{lesson.duration}</Text>
                          )}

                          <TouchableOpacity
                            style={styles.lecturePrimaryBtn}
                            onPress={() => playLectureVideo(lesson.videoUrl, lesson.title)}
                          >
                            <Ionicons name="play" size={16} color="#fff" />
                            <Text style={styles.lecturePrimaryBtnText}>المحاضرة</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.lecturePdfRow}
                            onPress={() =>
                              openPdfOrLink(lesson.taskPdfUrl, 'Task PDF has not been uploaded yet.')
                            }
                          >
                            <Ionicons name="document-text-outline" size={18} color="#E50914" />
                            <View style={styles.flex}>
                              <Text style={styles.lecturePdfTitle}>التاسك (PDF)</Text>
                              <Text style={styles.lecturePdfHint}>
                                {lesson.taskPdfUrl ? 'Tap to open' : 'Not uploaded yet'}
                              </Text>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#666" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.lecturePdfRow, styles.lecturePdfRowLast]}
                            onPress={() =>
                              openPdfOrLink(
                                lesson.readingPdfUrl,
                                'Reading PDF has not been uploaded yet.'
                              )
                            }
                          >
                            <Ionicons name="book-outline" size={18} color="#4ECDC4" />
                            <View style={styles.flex}>
                              <Text style={styles.lecturePdfTitle}>قراءة / شرح (PDF)</Text>
                              <Text style={styles.lecturePdfHint}>
                                {lesson.readingPdfUrl ? 'Tap to open' : 'Optional — not uploaded'}
                              </Text>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#666" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                    <View style={{ height: 32 }} />
                  </ScrollView>
                )}
              </>
            )}
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 18 },
  backText: { color: '#ccc', fontSize: 15 },
  brand: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: { color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  cohortName: { color: '#ddd', fontSize: 16, fontWeight: '600', marginTop: 4 },
  subtitle: { color: '#888', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#222',
    minHeight: 96,
    justifyContent: 'center',
  },
  statCardOn: { borderColor: '#E50914' },
  statCardStart: {
    borderColor: '#E50914',
    backgroundColor: '#1a0a0c',
  },
  statCardCountdown: {
    borderColor: '#3a1518',
    backgroundColor: '#120809',
  },
  statLabel: { color: '#777', fontSize: 11, marginBottom: 4, fontWeight: '600' },
  statLabelOn: {
    color: '#E50914',
    fontSize: 10,
    marginBottom: 6,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  startDay: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 30,
  },
  startMonth: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.6,
  },
  countdownDays: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 30,
  },
  countdownUnit: {
    color: '#E50914',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 1,
  },
  countdownHmsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  countdownHms: {
    color: '#ddd',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countdownSec: { color: '#E50914' },
  countdownColon: { color: '#666', marginHorizontal: 1, fontWeight: '700' },
  countdownLive: {
    color: '#E50914',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  panel: {
    backgroundColor: '#141414',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 22,
  },
  communityPanel: {
    backgroundColor: '#14080a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E50914',
    marginBottom: 16,
  },
  communityEyebrow: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  communityTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  communityMeta: { color: '#999', fontSize: 13, marginBottom: 12 },
  communityTopicLabel: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  communityTopic: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  communityGuest: { color: '#aaa', fontSize: 13, marginBottom: 14 },
  platformPill: {
    backgroundColor: '#2a1215',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  platformPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  panelEyebrow: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229,9,20,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E50914' },
  livePillText: { color: '#E50914', fontSize: 10, fontWeight: '800' },
  panelTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  panelMeta: { color: '#999', fontSize: 13, marginBottom: 14 },
  primaryBtn: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  sectionHint: { color: '#777', fontSize: 12, marginBottom: 12, lineHeight: 18 },
  trackCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    overflow: 'hidden',
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 14,
    gap: 12,
  },
  trackBar: { width: 4, alignSelf: 'stretch', borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  trackTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  trackDesc: { color: '#8a8a8a', fontSize: 12, marginTop: 3, lineHeight: 17 },
  trackMeta: { color: '#666', fontSize: 11, marginTop: 6, fontWeight: '600' },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(229,9,20,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  slotChipText: { color: '#ddd', fontSize: 10, fontWeight: '600' },
  scheduleMiniTitle: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  scheduleMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  scheduleMiniText: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  trackBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#1c1c1c',
    gap: 8,
  },
  waRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0c0c0c',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  waIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(37,211,102,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  waHint: { color: '#777', fontSize: 11, marginTop: 2 },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 12,
  },
  lockBtnText: { color: '#ddd', fontWeight: '600', fontSize: 13 },
  scheduleCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    marginBottom: 18,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1c',
  },
  scheduleRowLast: { borderBottomWidth: 0 },
  scheduleTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
  scheduleMeta: { color: '#777', fontSize: 12, marginTop: 3 },
  miniJoin: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  miniJoinText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  miniGhost: {
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  miniGhostText: { color: '#ccc', fontSize: 12, fontWeight: '600' },
  locked: { color: '#555', fontSize: 12 },
  muted: { color: '#777', fontSize: 13, lineHeight: 19 },
  error: { color: '#ff6b6b', marginBottom: 12 },
  recordedCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 10,
  },
  recordedCourseIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordedCourseTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  recordedCourseMeta: { color: '#777', fontSize: 12, marginTop: 3 },
  modalSafe: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  modalEyebrow: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modalContent: { padding: 20 },
  modalDesc: { color: '#999', fontSize: 14, lineHeight: 21, marginBottom: 18 },
  lectureCard: {
    backgroundColor: '#141414',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 16,
  },
  lectureIndex: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  lectureTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  lectureSection: { color: '#888', fontSize: 12, marginBottom: 2 },
  lectureMeta: { color: '#666', fontSize: 12, marginBottom: 12 },
  lecturePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  lecturePrimaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  lecturePdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  lecturePdfRowLast: { marginBottom: 0 },
  lecturePdfTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  lecturePdfHint: { color: '#777', fontSize: 11, marginTop: 2 },
  playerSafe: { flex: 1, backgroundColor: '#000' },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  playerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  playerStage: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  playerStageFlex: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  playerVideo: { width: '100%', height: '100%' },
  playerWeb: { flex: 1, backgroundColor: '#000' },
  playerLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  playerHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  externalBtn: {
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  externalBtnText: { color: '#ccc', fontWeight: '600', fontSize: 13 },
});
