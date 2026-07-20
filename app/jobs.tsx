import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';

type Job = {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  type?: string;
  workMode?: string;
  salaryRange?: string;
  isFeatured?: boolean;
  accessType?: string;
};

const TYPE_FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'internship', label: 'Internship' },
  { id: 'freelance', label: 'Freelance' },
];

const MODE_FILTERS = [
  { id: 'all', label: 'أي مكان' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'On-site' },
];

function typeLabel(type?: string) {
  const map: Record<string, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    internship: 'Internship',
    freelance: 'Freelance',
  };
  return map[type || ''] || type || 'Job';
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [workMode, setWorkMode] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (type !== 'all') params.set('type', type);
      if (workMode !== 'all') params.set('workMode', workMode);

      const res = await fetch(`${API_BASE_URL}/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setJobs(data?.data?.jobs || []);
      } else {
        setError(data?.message || 'تعذر تحميل الوظائف');
      }
    } catch {
      setError('تعذر الاتصال بالسيرفر');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, type, workMode]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const countLabel = useMemo(() => `${jobs.length} وظيفة`, [jobs.length]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#050505', '#0a0a0a']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
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

          <View style={styles.coverWrap}>
            <Image
              source={require('../assets/images/jobs-cover.png')}
              style={styles.cover}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(5,5,5,0.55)', '#050505']}
              style={styles.coverFade}
            />
            <View style={styles.coverBadge}>
              <Ionicons name="briefcase-outline" size={12} color="#E50914" />
              <Text style={styles.coverBadgeText}>JOBS BOARD</Text>
            </View>
          </View>

          <View style={styles.headerRow}>
            <View style={styles.flex}>
              <Text style={styles.brand}>ELNADY</Text>
              <Text style={styles.title}>Jobs</Text>
              <Text style={styles.subtitle}>وظائف أونلاين · قدّم من جوه التطبيق</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.myJobsBtn}
                onPress={() => router.push('/my-jobs')}
              >
                <Ionicons name="people-outline" size={16} color="#fff" />
                <Text style={styles.myJobsBtnText}>وظائفي</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postBtn}
                onPress={() => router.push('/post-job')}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.postBtnText}>نشر</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن وظيفة أو شركة..."
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={load}
              returnKeyType="search"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {TYPE_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.chip, type === f.id && styles.chipOn]}
                onPress={() => setType(f.id)}
              >
                <Text style={[styles.chipText, type === f.id && styles.chipTextOn]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {MODE_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.chip, workMode === f.id && styles.chipOn]}
                onPress={() => setWorkMode(f.id)}
              >
                <Text style={[styles.chipText, workMode === f.id && styles.chipTextOn]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.count}>{countLabel}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} />
          ) : jobs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>لا توجد وظائف حالياً</Text>
              <Text style={styles.emptyHint}>تابعنا — هتظهر وظائف جديدة قريباً</Text>
            </View>
          ) : (
            jobs.map((job) => (
              <TouchableOpacity
                key={job._id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({ pathname: '/job-details', params: { id: job._id } })
                }
              >
                <View style={styles.cardTop}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>
                      {(job.companyName || 'C').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.jobTitle} numberOfLines={2}>
                      {job.title}
                    </Text>
                    <Text style={styles.company}>{job.companyName}</Text>
                  </View>
                  {job.isFeatured ? (
                    <View style={styles.featured}>
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{typeLabel(job.type)}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>{job.workMode || 'remote'}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>{job.location || 'Egypt'}</Text>
                </View>
                {job.salaryRange ? (
                  <Text style={styles.salary}>{job.salaryRange}</Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
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
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  headerActions: { alignItems: 'flex-end', gap: 8, marginTop: 8 },
  brand: { color: '#E50914', fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  title: { color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#888', fontSize: 13, marginTop: 4 },
  myJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  myJobsBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242424',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 12 },
  chipsRow: { marginBottom: 10 },
  chip: {
    backgroundColor: '#141414',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chipOn: { backgroundColor: 'rgba(229,9,20,0.15)', borderColor: '#E50914' },
  chipText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  count: { color: '#666', fontSize: 12, marginBottom: 12, marginTop: 4 },
  error: { color: '#E50914', marginBottom: 12 },
  empty: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#242424',
    marginTop: 12,
  },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyHint: { color: '#888', fontSize: 13 },
  card: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  logoText: { color: '#E50914', fontSize: 18, fontWeight: '800' },
  jobTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  company: { color: '#999', fontSize: 13 },
  featured: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    height: 24,
  },
  featuredText: { color: '#E50914', fontSize: 10, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  meta: { color: '#888', fontSize: 12, textTransform: 'capitalize' },
  metaDot: { color: '#555', marginHorizontal: 6 },
  salary: { color: '#4ADE80', fontSize: 12, fontWeight: '600', marginTop: 8 },
});
