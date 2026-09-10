import { useUser } from '@/contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import { CLUB_COURSE_CATEGORY, isClubRecordedCourse, withClubCourseTag } from '../utils/clubCourse';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type WaGroupForm = {
  _id?: string;
  label: string;
  link: string;
};

type SessionForm = {
  _id?: string;
  title: string;
  startsAt: string;
  durationMinutes: string;
  zoomLink: string;
  recordingUrl: string;
};

type TrackForm = {
  _id?: string;
  title: string;
  description: string;
  order: string;
  unlockWeek: string;
  zoomLink: string;
  whatsappGroups: WaGroupForm[];
  weeklySlots?: Array<{
    _id?: string;
    dayOfWeek?: number;
    time?: string;
    label?: string;
  }>;
};

type LessonForm = {
  _id?: string;
  title: string;
  videoUrl: string;
  taskPdfUrl: string;
  readingPdfUrl: string;
  duration: string;
};

type RecordedCourseForm = {
  _id?: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: string;
  category: string;
  expanded?: boolean;
  lessons: LessonForm[];
  raw?: any;
};

export default function ClubManagementScreen() {
  const { isAdmin } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [title, setTitle] = useState('النادي · دفعة أكتوبر 2026');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-10-10');
  const [endDate, setEndDate] = useState('2026-12-05');
  const [status, setStatus] = useState('upcoming');
  const [tracks, setTracks] = useState<TrackForm[]>([]);
  const [sessions, setSessions] = useState<SessionForm[]>([]);
  const [recordedCourses, setRecordedCourses] = useState<RecordedCourseForm[]>([]);
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);
  const [communityEnabled, setCommunityEnabled] = useState(true);
  const [communityTime, setCommunityTime] = useState('21:00');
  const [communityTopic, setCommunityTopic] = useState('');
  const [communityLiveType, setCommunityLiveType] = useState<'talk' | 'guest'>('talk');
  const [communityGuest, setCommunityGuest] = useState('');
  const [communityPlatform, setCommunityPlatform] = useState<'youtube' | 'tiktok' | 'instagram'>(
    'youtube'
  );
  const [communityLink, setCommunityLink] = useState('');
  const [communityRecording, setCommunityRecording] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin only', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [isAdmin]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/club/admin/cohorts`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load');
      const cohort = data?.data?.cohorts?.[0];
      if (!cohort) {
        Alert.alert('Notice', 'No cohort found. Reload after backend seed.');
        return;
      }
      setCohortId(cohort._id);
      setTitle(cohort.title || '');
      setDescription(cohort.description || '');
      setStartDate(String(cohort.startDate || '').slice(0, 10));
      setEndDate(String(cohort.endDate || '').slice(0, 10));
      setStatus(cohort.status || 'upcoming');
      const cl = cohort.communityLive || {};
      setCommunityEnabled(cl.enabled !== false);
      setCommunityTime(cl.time || '21:00');
      setCommunityTopic(cl.topic || '');
      setCommunityLiveType(cl.liveType === 'guest' ? 'guest' : 'talk');
      setCommunityGuest(cl.guestName || '');
      setCommunityPlatform(
        ['youtube', 'tiktok', 'instagram'].includes(cl.platform) ? cl.platform : 'youtube'
      );
      setCommunityLink(cl.link || '');
      setCommunityRecording(cl.recordingUrl || '');
      setTracks(
        (cohort.tracks || []).map((t: any) => ({
          _id: t._id,
          title: t.title || '',
          description: t.description || '',
          order: String(t.order ?? 1),
          unlockWeek: String(t.unlockWeek ?? 1),
          zoomLink: t.zoomLink || '',
          whatsappGroups:
            (t.whatsappGroups || []).length > 0
              ? t.whatsappGroups.map((g: any, i: number) => ({
                  _id: g._id,
                  label: g.label || `Group ${i + 1}`,
                  link: g.link || '',
                }))
              : [{ label: 'Group 1', link: '' }],
          weeklySlots: t.weeklySlots || [],
        }))
      );
      setSessions(
        (cohort.sessions || []).map((s: any) => ({
          _id: s._id,
          title: s.title || '',
          startsAt: s.startsAt ? new Date(s.startsAt).toISOString().slice(0, 16) : '',
          durationMinutes: String(s.durationMinutes || 120),
          zoomLink: s.zoomLink || '',
          recordingUrl: s.recordingUrl || '',
        }))
      );

      const fromCohort = (cohort.recordedCourses || []).map((c: any) => ({
        _id: c._id,
        title: c.title || '',
        description: c.description || '',
        instructor: c.instructor || 'ELNADY',
        level: c.level || 'Beginner',
        duration: c.duration || '1 hour',
        category: CLUB_COURSE_CATEGORY,
        expanded: false,
        lessons: (c.lessons || []).map((l: any) => ({
          _id: l._id,
          title: l.title || '',
          videoUrl: l.videoUrl || '',
          taskPdfUrl: l.taskPdfUrl || '',
          readingPdfUrl: l.readingPdfUrl || '',
          duration: l.duration || '',
        })),
        raw: c,
      }));

      if (fromCohort.length > 0) {
        setRecordedCourses(fromCohort);
      } else {
        try {
          const coursesRes = await fetch(`${API_BASE_URL}/api/public/courses?scope=all`);
          const coursesData = await coursesRes.json();
          const list = coursesData?.data?.courses || [];
          setRecordedCourses(
            list
              .filter((c: any) => isClubRecordedCourse(c))
              .map((c: any) => {
                const lessons: LessonForm[] = [];
                for (const section of c.sections || []) {
                  for (const lesson of section.lessons || []) {
                    lessons.push({
                      _id: lesson._id,
                      title: lesson.title || '',
                      videoUrl: lesson.videoUrl || '',
                      taskPdfUrl: lesson.taskPdfUrl || '',
                      readingPdfUrl: lesson.readingPdfUrl || '',
                      duration: lesson.duration || '',
                    });
                  }
                }
                return {
                  _id: c._id,
                  title: c.title || '',
                  description: c.description || '',
                  instructor: c.instructor || 'ELNADY',
                  level: c.level || 'Beginner',
                  duration: c.duration || '1 hour',
                  category: CLUB_COURSE_CATEGORY,
                  expanded: false,
                  lessons,
                  raw: c,
                };
              })
          );
        } catch (e) {
          console.warn('Failed to load recorded courses', e);
          setRecordedCourses([]);
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load النادي');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const updateTrack = (index: number, patch: Partial<TrackForm>) => {
    setTracks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addWaGroup = (trackIndex: number) => {
    setTracks((prev) => {
      const next = [...prev];
      const groups = [...(next[trackIndex].whatsappGroups || [])];
      groups.push({ label: `Group ${groups.length + 1}`, link: '' });
      next[trackIndex] = { ...next[trackIndex], whatsappGroups: groups };
      return next;
    });
  };

  const updateWaGroup = (
    trackIndex: number,
    groupIndex: number,
    patch: Partial<WaGroupForm>
  ) => {
    setTracks((prev) => {
      const next = [...prev];
      const groups = [...(next[trackIndex].whatsappGroups || [])];
      groups[groupIndex] = { ...groups[groupIndex], ...patch };
      next[trackIndex] = { ...next[trackIndex], whatsappGroups: groups };
      return next;
    });
  };

  const removeWaGroup = (trackIndex: number, groupIndex: number) => {
    setTracks((prev) => {
      const next = [...prev];
      const groups = (next[trackIndex].whatsappGroups || []).filter((_, i) => i !== groupIndex);
      next[trackIndex] = {
        ...next[trackIndex],
        whatsappGroups: groups.length ? groups : [{ label: 'Group 1', link: '' }],
      };
      return next;
    });
  };

  const save = async () => {
    if (!cohortId) return;
    try {
      setSaving(true);
      const payload = {
        title,
        description,
        startDate,
        endDate,
        status,
        tracks: tracks.map((t, i) => ({
          ...(t._id ? { _id: t._id } : {}),
          title: t.title,
          description: t.description,
          order: Number(t.order) || i + 1,
          unlockWeek: Number(t.unlockWeek) || 1,
          zoomLink: t.zoomLink || '',
          whatsappGroups: (t.whatsappGroups || []).map((g, gi) => ({
            ...(g._id ? { _id: g._id } : {}),
            label: g.label || `Group ${gi + 1}`,
            link: g.link || '',
          })),
          weeklySlots: (t as any).weeklySlots || [],
        })),
        sessions: sessions.map((s) => ({
          ...(s._id ? { _id: s._id } : {}),
          title: s.title,
          startsAt: s.startsAt ? new Date(s.startsAt).toISOString() : new Date().toISOString(),
          durationMinutes: Number(s.durationMinutes) || 120,
          zoomLink: s.zoomLink,
          recordingUrl: s.recordingUrl,
        })),
        communityLive: {
          enabled: communityEnabled,
          dayOfWeek: 4,
          time: communityTime || '21:00',
          title: 'Community Thursday',
          topic: communityTopic,
          liveType: communityLiveType,
          guestName: communityGuest,
          platform: communityPlatform,
          link: communityLink,
          recordingUrl: communityRecording,
        },
        recordedCourses: recordedCourses.map((c) => ({
          ...(c._id && !String(c._id).startsWith('club-course-') ? { _id: c._id } : {}),
          title: c.title,
          description: c.description || c.title,
          instructor: c.instructor || 'ELNADY',
          level: c.level || 'Beginner',
          duration: c.duration || '1 hour',
          thumbnail: c.raw?.thumbnail || '',
          lessons: (c.lessons || []).map((l) => ({
            ...(l._id ? { _id: l._id } : {}),
            title: l.title || '',
            videoUrl: l.videoUrl || '',
            taskPdfUrl: l.taskPdfUrl || '',
            readingPdfUrl: l.readingPdfUrl || '',
            duration: l.duration || '',
          })),
        })),
        isPublished: true,
      };

      const res = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/club/admin/cohorts/${cohortId}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Save failed');
      Alert.alert('Saved', 'النادي updated');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        title: 'New live session',
        startsAt: '2026-10-10T19:00',
        durationMinutes: '120',
        zoomLink: '',
        recordingUrl: '',
      },
    ]);
  };

  const toggleCourse = (index: number) => {
    setRecordedCourses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], expanded: !next[index].expanded };
      return next;
    });
  };

  const updateRecordedCourse = (index: number, patch: Partial<RecordedCourseForm>) => {
    setRecordedCourses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const updateLesson = (courseIndex: number, lessonIndex: number, patch: Partial<LessonForm>) => {
    setRecordedCourses((prev) => {
      const next = [...prev];
      const lessons = [...next[courseIndex].lessons];
      lessons[lessonIndex] = { ...lessons[lessonIndex], ...patch };
      next[courseIndex] = { ...next[courseIndex], lessons };
      return next;
    });
  };

  const addLesson = (courseIndex: number) => {
    setRecordedCourses((prev) => {
      const next = [...prev];
      const lessons = [
        ...next[courseIndex].lessons,
        {
          title: `Lecture ${next[courseIndex].lessons.length + 1}`,
          videoUrl: '',
          taskPdfUrl: '',
          readingPdfUrl: '',
          duration: '',
        },
      ];
      next[courseIndex] = { ...next[courseIndex], lessons, expanded: true };
      return next;
    });
  };

  const removeLesson = (courseIndex: number, lessonIndex: number) => {
    setRecordedCourses((prev) => {
      const next = [...prev];
      next[courseIndex] = {
        ...next[courseIndex],
        lessons: next[courseIndex].lessons.filter((_, i) => i !== lessonIndex),
      };
      return next;
    });
  };

  const addRecordedCourse = () => {
    setRecordedCourses((prev) => [
      {
        title: 'New Course',
        description: '',
        instructor: 'ELNADY',
        level: 'Beginner',
        duration: '1 hour',
        category: CLUB_COURSE_CATEGORY,
        expanded: true,
        lessons: [
          {
            title: 'Lecture 1',
            videoUrl: '',
            taskPdfUrl: '',
            readingPdfUrl: '',
            duration: '',
          },
        ],
      },
      ...prev,
    ]);
  };

  const persistRecordedCourses = async (courses: RecordedCourseForm[]) => {
    if (!cohortId) throw new Error('No cohort');
    const res = await makeAuthenticatedRequest(
      `${API_BASE_URL}/api/club/admin/cohorts/${cohortId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          recordedCourses: courses.map((c) => ({
            ...(c._id && String(c._id).length === 24 ? { _id: c._id } : {}),
            title: c.title,
            description: c.description || c.title,
            instructor: c.instructor || 'ELNADY',
            level: c.level || 'Beginner',
            duration: c.duration || '1 hour',
            thumbnail: c.raw?.thumbnail || '',
            lessons: (c.lessons || []).map((l) => ({
              ...(l._id && String(l._id).length === 24 ? { _id: l._id } : {}),
              title: l.title || '',
              videoUrl: l.videoUrl || '',
              taskPdfUrl: l.taskPdfUrl || '',
              readingPdfUrl: l.readingPdfUrl || '',
              duration: l.duration || '',
            })),
          })),
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to save club course');
    return data?.data?.cohort?.recordedCourses || [];
  };

  const saveRecordedCourse = async (index: number) => {
    const course = recordedCourses[index];
    if (!course.title.trim()) {
      Alert.alert('Error', 'Course title is required');
      return;
    }
    try {
      setSavingCourseId(course._id || `new-${index}`);
      const nextCourses = recordedCourses.map((c, i) =>
        i === index ? { ...c, category: CLUB_COURSE_CATEGORY } : c
      );
      const savedList = await persistRecordedCourses(nextCourses);
      if (Array.isArray(savedList) && savedList.length > 0) {
        setRecordedCourses(
          savedList.map((c: any, i: number) => ({
            _id: c._id,
            title: c.title || '',
            description: c.description || '',
            instructor: c.instructor || 'ELNADY',
            level: c.level || 'Beginner',
            duration: c.duration || '1 hour',
            category: CLUB_COURSE_CATEGORY,
            expanded: i === index,
            lessons: (c.lessons || []).map((l: any) => ({
              _id: l._id,
              title: l.title || '',
              videoUrl: l.videoUrl || '',
              taskPdfUrl: l.taskPdfUrl || '',
              readingPdfUrl: l.readingPdfUrl || '',
              duration: l.duration || '',
            })),
            raw: c,
          }))
        );
      } else {
        // Production API may ignore recordedCourses until backend deploy.
        // Mark as club-only via category so it never appears on the Courses page.
        const sections = [
          {
            title: 'Intro',
            description: '',
            order: 0,
            lessons: course.lessons.map((l, i) => ({
              ...(l._id ? { _id: l._id } : {}),
              title: l.title || `Lecture ${i + 1}`,
              description: '',
              videoUrl: l.videoUrl || '',
              taskPdfUrl: l.taskPdfUrl || '',
              readingPdfUrl: l.readingPdfUrl || '',
              duration: l.duration || '',
              accessType: 'premium',
              order: i,
            })),
          },
        ];
        const payload = {
          title: course.title,
          description: course.description || course.title,
          instructor: course.instructor || 'ELNADY',
          duration: course.duration || '1 hour',
          level: course.level || 'Beginner',
          category: CLUB_COURSE_CATEGORY,
          price: 0,
          originalPrice: 0,
          language: 'Arabic',
          thumbnail: course.raw?.thumbnail || '',
          isActive: true,
          isFeatured: false,
          isClub: true,
          tags: withClubCourseTag(course.raw?.tags),
          sections,
        };
        const url = course._id && String(course._id).length === 24
          ? `${API_BASE_URL}/api/public/courses/${course._id}`
          : `${API_BASE_URL}/api/public/courses`;
        const method = course._id && String(course._id).length === 24 ? 'PUT' : 'POST';
        const res = await makeAuthenticatedRequest(url, {
          method,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to save course');
        const saved = data?.data?._id ? data.data : data?.data?.course || data?.data;
        if (saved?._id) {
          setRecordedCourses((prev) =>
            prev.map((c, i) => (i === index ? { ...c, _id: saved._id, category: CLUB_COURSE_CATEGORY, raw: saved } : c))
          );
        }
      }
      Alert.alert('Saved', 'اتحفظ في النادي فقط — مش هيظهر في صفحة الكورسات');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save course');
    } finally {
      setSavingCourseId(null);
    }
  };

  const deleteRecordedCourse = (index: number) => {
    const course = recordedCourses[index];
    const isClubCourse = !course._id || isClubRecordedCourse(course);
    Alert.alert(
      'حذف الكورس',
      isClubCourse
        ? `حذف "${course.title || 'this course'}" من النادي؟`
        : `"${course.title}" موجود في صفحة الكورسات. هيختفي من النادي فقط ولن يتم مسحه من هناك.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const remaining = recordedCourses.filter((_, i) => i !== index);
              try {
                await persistRecordedCourses(remaining);
              } catch {
                // ignore if backend does not store recordedCourses yet
              }
              if (course._id && String(course._id).length === 24 && isClubRecordedCourse(course)) {
                await makeAuthenticatedRequest(
                  `${API_BASE_URL}/api/public/courses/${course._id}`,
                  { method: 'DELETE' }
                ).catch(() => {});
              }
              setRecordedCourses(remaining);
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to delete course');
            }
          },
        },
      ]
    );
  };

  if (!isAdmin) return <SafeAreaView style={styles.safe} />;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color="#E50914" />
          <Text style={styles.muted}>Loading Club Management…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#000', '#141414']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Club Management</Text>
          <Text style={styles.subtitle}>
            {title || 'Scholarship'}{startDate ? ` · ${startDate}` : ''} · English tracks · WhatsApp groups
          </Text>

          <Text style={styles.label}>Scholarship title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Start (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>End</Text>
              <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />
            </View>
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.chips}>
            {['upcoming', 'active', 'completed', 'draft'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, status === s && styles.chipActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Community Thursday</Text>
          <Text style={styles.hint}>
            لايف خميس عام لكل المشتركين — مش Zoom. اختار المنصة: YouTube / TikTok / Instagram
            وحدّث موضوع الأسبوع.
          </Text>

          <TouchableOpacity
            style={[styles.chip, communityEnabled && styles.chipActive, { alignSelf: 'flex-start' }]}
            onPress={() => setCommunityEnabled((v) => !v)}
          >
            <Text style={[styles.chipText, communityEnabled && styles.chipTextActive]}>
              {communityEnabled ? 'Enabled ✓' : 'Disabled'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Time (Egypt, HH:mm)</Text>
          <TextInput
            style={styles.input}
            value={communityTime}
            onChangeText={setCommunityTime}
            placeholder="21:00"
            placeholderTextColor="#666"
            autoCapitalize="none"
          />

          <Text style={styles.label}>This week topic</Text>
          <TextInput
            style={styles.input}
            value={communityTopic}
            onChangeText={setCommunityTopic}
            placeholder="مثال: إزاي تسعر مشروعك كفريلانسر"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.chips}>
            {(
              [
                { id: 'talk', label: 'Talk / Topic' },
                { id: 'guest', label: 'Guest' },
              ] as const
            ).map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.chip, communityLiveType === t.id && styles.chipActive]}
                onPress={() => setCommunityLiveType(t.id)}
              >
                <Text style={[styles.chipText, communityLiveType === t.id && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {communityLiveType === 'guest' ? (
            <>
              <Text style={styles.label}>Guest name</Text>
              <TextInput
                style={styles.input}
                value={communityGuest}
                onChangeText={setCommunityGuest}
                placeholder="اسم الضيف"
                placeholderTextColor="#666"
              />
            </>
          ) : null}

          <Text style={styles.label}>Platform</Text>
          <View style={styles.chips}>
            {(
              [
                { id: 'youtube', label: 'YouTube' },
                { id: 'tiktok', label: 'TikTok' },
                { id: 'instagram', label: 'Instagram' },
              ] as const
            ).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, communityPlatform === p.id && styles.chipActive]}
                onPress={() => setCommunityPlatform(p.id)}
              >
                <Text
                  style={[styles.chipText, communityPlatform === p.id && styles.chipTextActive]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Live link ({communityPlatform})</Text>
          <TextInput
            style={styles.input}
            value={communityLink}
            onChangeText={setCommunityLink}
            autoCapitalize="none"
            placeholder={
              communityPlatform === 'youtube'
                ? 'https://youtube.com/...'
                : communityPlatform === 'tiktok'
                  ? 'https://tiktok.com/...'
                  : 'https://instagram.com/...'
            }
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Recording / Replay link (optional)</Text>
          <TextInput
            style={styles.input}
            value={communityRecording}
            onChangeText={setCommunityRecording}
            autoCapitalize="none"
            placeholder="After the live ends"
            placeholderTextColor="#666"
          />

          <Text style={styles.sectionTitle}>Specializations</Text>
          <Text style={styles.hint}>
            Add Group 2 / Group 3 when a WhatsApp group reaches the member limit.
          </Text>

          {tracks.map((track, index) => (
            <View key={track._id || `t-${index}`} style={styles.block}>
              <Text style={styles.blockTitle}>{track.title || `Track ${index + 1}`}</Text>
              <TextInput
                style={styles.input}
                value={track.title}
                onChangeText={(v) => updateTrack(index, { title: v })}
                placeholder="English title"
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                value={track.description}
                onChangeText={(v) => updateTrack(index, { description: v })}
                placeholder="Short description"
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                value={track.zoomLink}
                onChangeText={(v) => updateTrack(index, { zoomLink: v })}
                autoCapitalize="none"
                placeholder="Zoom link for weekly lives (https://zoom.us/j/...)"
                placeholderTextColor="#666"
              />

              <Text style={styles.subLabel}>WhatsApp groups</Text>
              {(track.whatsappGroups || []).map((group, gIndex) => (
                <View key={group._id || `g-${index}-${gIndex}`} style={styles.waBlock}>
                  <TextInput
                    style={styles.input}
                    value={group.label}
                    onChangeText={(v) => updateWaGroup(index, gIndex, { label: v })}
                    placeholder="Group 1"
                    placeholderTextColor="#666"
                  />
                  <TextInput
                    style={styles.input}
                    value={group.link}
                    onChangeText={(v) => updateWaGroup(index, gIndex, { link: v })}
                    autoCapitalize="none"
                    placeholder="https://chat.whatsapp.com/..."
                    placeholderTextColor="#666"
                  />
                  <TouchableOpacity onPress={() => removeWaGroup(index, gIndex)}>
                    <Text style={styles.deleteLink}>Remove group</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => addWaGroup(index)}>
                <Text style={styles.addLink}>+ Add WhatsApp group</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recordings / one-off sessions</Text>
            <TouchableOpacity onPress={addSession}>
              <Text style={styles.addLink}>+ Session</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Student schedule auto-builds from weekly live times. Use this section for recordings
            (Replay) or special one-off sessions.
          </Text>

          {sessions.map((session, index) => (
            <View key={session._id || `s-${index}`} style={styles.block}>
              <TextInput
                style={styles.input}
                value={session.title}
                onChangeText={(v) => {
                  const next = [...sessions];
                  next[index] = { ...next[index], title: v };
                  setSessions(next);
                }}
                placeholder="Session title"
                placeholderTextColor="#666"
              />
              <Text style={styles.hint}>Datetime: 2026-10-10T19:00</Text>
              <TextInput
                style={styles.input}
                value={session.startsAt}
                onChangeText={(v) => {
                  const next = [...sessions];
                  next[index] = { ...next[index], startsAt: v };
                  setSessions(next);
                }}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={session.durationMinutes}
                onChangeText={(v) => {
                  const next = [...sessions];
                  next[index] = { ...next[index], durationMinutes: v };
                  setSessions(next);
                }}
                keyboardType="number-pad"
                placeholder="Duration (min)"
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                value={session.zoomLink}
                onChangeText={(v) => {
                  const next = [...sessions];
                  next[index] = { ...next[index], zoomLink: v };
                  setSessions(next);
                }}
                autoCapitalize="none"
                placeholder="https://zoom.us/j/..."
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                value={session.recordingUrl}
                onChangeText={(v) => {
                  const next = [...sessions];
                  next[index] = { ...next[index], recordingUrl: v };
                  setSessions(next);
                }}
                autoCapitalize="none"
                placeholder="Recording URL"
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                onPress={() => setSessions(sessions.filter((_, i) => i !== index))}
              >
                <Text style={styles.deleteLink}>Delete session</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>المحتويات المسجلة</Text>
            <TouchableOpacity onPress={addRecordedCourse}>
              <Text style={styles.addLink}>+ كورس</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            من هنا تضيف كورس / محاضرة / لينك الفيديو (YouTube أو Drive أو MP4) + Task PDF + قراءة PDF.
            يظهر للطالب تحت المحتويات المسجلة في Elnady.
          </Text>

          {recordedCourses.length === 0 ? (
            <Text style={styles.muted}>No recorded courses yet. Tap + كورس</Text>
          ) : (
            recordedCourses.map((course, cIndex) => (
              <View key={course._id || `rc-${cIndex}`} style={styles.block}>
                <View style={styles.courseRow}>
                  <TouchableOpacity style={styles.courseRowMain} onPress={() => toggleCourse(cIndex)}>
                    <Text style={styles.blockTitle}>
                      {course.expanded ? '▼' : '▶'} {course.title || `Course ${cIndex + 1}`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteCourseBtn}
                    onPress={() => deleteRecordedCourse(cIndex)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteCourseBtnText}>حذف</Text>
                  </TouchableOpacity>
                </View>

                {course.expanded ? (
                  <>
                    <Text style={styles.subLabel}>Course title</Text>
                    <TextInput
                      style={styles.input}
                      value={course.title}
                      onChangeText={(v) => updateRecordedCourse(cIndex, { title: v })}
                      placeholder="Course title"
                      placeholderTextColor="#666"
                    />
                    <TextInput
                      style={styles.input}
                      value={course.description}
                      onChangeText={(v) => updateRecordedCourse(cIndex, { description: v })}
                      placeholder="Description"
                      placeholderTextColor="#666"
                    />
                    <TextInput
                      style={styles.input}
                      value={course.instructor}
                      onChangeText={(v) => updateRecordedCourse(cIndex, { instructor: v })}
                      placeholder="Instructor"
                      placeholderTextColor="#666"
                    />

                    <Text style={styles.subLabel}>Lectures</Text>
                    {course.lessons.map((lesson, lIndex) => (
                      <View key={lesson._id || `l-${cIndex}-${lIndex}`} style={styles.lessonBlock}>
                        <Text style={styles.lessonLabel}>محاضرة {lIndex + 1}</Text>
                        <TextInput
                          style={styles.input}
                          value={lesson.title}
                          onChangeText={(v) => updateLesson(cIndex, lIndex, { title: v })}
                          placeholder="Lecture title"
                          placeholderTextColor="#666"
                        />
                        <TextInput
                          style={styles.input}
                          value={lesson.videoUrl}
                          onChangeText={(v) => updateLesson(cIndex, lIndex, { videoUrl: v })}
                          autoCapitalize="none"
                          placeholder="Video: YouTube / Google Drive / MP4 link"
                          placeholderTextColor="#666"
                        />
                        <TextInput
                          style={styles.input}
                          value={lesson.taskPdfUrl}
                          onChangeText={(v) => updateLesson(cIndex, lIndex, { taskPdfUrl: v })}
                          autoCapitalize="none"
                          placeholder="Task PDF URL"
                          placeholderTextColor="#666"
                        />
                        <TextInput
                          style={styles.input}
                          value={lesson.readingPdfUrl}
                          onChangeText={(v) => updateLesson(cIndex, lIndex, { readingPdfUrl: v })}
                          autoCapitalize="none"
                          placeholder="Reading / شرح PDF URL"
                          placeholderTextColor="#666"
                        />
                        <TextInput
                          style={styles.input}
                          value={lesson.duration}
                          onChangeText={(v) => updateLesson(cIndex, lIndex, { duration: v })}
                          placeholder="Duration e.g. 15:00"
                          placeholderTextColor="#666"
                        />
                        <TouchableOpacity onPress={() => removeLesson(cIndex, lIndex)}>
                          <Text style={styles.deleteLink}>Delete lecture</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    <TouchableOpacity onPress={() => addLesson(cIndex)}>
                      <Text style={styles.addLink}>+ محاضرة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveCourseBtn}
                      onPress={() => saveRecordedCourse(cIndex)}
                      disabled={savingCourseId !== null}
                    >
                      <Text style={styles.saveCourseBtnText}>
                        {savingCourseId === (course._id || `new-${cIndex}`)
                          ? 'Saving…'
                          : 'Save course'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteRecordedCourse(cIndex)}>
                      <Text style={styles.deleteLink}>Delete course</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            ))
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save النادي'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => router.push('/(tabs)/scholarship')}
          >
            <Text style={styles.previewBtnText}>Preview student screen</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  content: { padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  back: { color: '#fff', fontSize: 16, marginBottom: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#888', marginBottom: 18, marginTop: 6, lineHeight: 20 },
  label: { color: '#bbb', marginBottom: 6, marginTop: 10, fontSize: 13 },
  subLabel: { color: '#aaa', marginTop: 8, marginBottom: 8, fontWeight: '700' },
  hint: { color: '#666', fontSize: 12, marginBottom: 10, lineHeight: 18 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#E50914', borderColor: '#E50914' },
  chipText: { color: '#aaa', fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  sectionHead: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  addLink: { color: '#E50914', fontWeight: '700', marginTop: 4 },
  block: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  blockTitle: { color: '#E50914', fontWeight: '800', marginBottom: 0, flex: 1 },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  courseRowMain: { flex: 1, paddingRight: 8 },
  deleteCourseBtn: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteCourseBtnText: { color: '#ff6b6b', fontWeight: '800', fontSize: 13 },
  waBlock: {
    backgroundColor: '#0c0c0c',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  deleteLink: { color: '#ff6b6b', marginTop: 4, marginBottom: 4 },
  lessonBlock: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  lessonLabel: { color: '#E50914', fontWeight: '800', marginBottom: 8, fontSize: 12 },
  saveCourseBtn: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveCourseBtnText: { color: '#fff', fontWeight: '800' },
  saveBtn: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  previewBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  previewBtnText: { color: '#ddd', fontWeight: '600' },
  muted: { color: '#888' },
});
