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
import { cacheFeedJob, fetchPublicJobFeed, getJobRegion, mergeJobs } from '../utils/jobFeedClient';

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
  source?: string;
  sourceName?: string;
  applyType?: string;
  applyUrl?: string;
  description?: string;
};

const REGION_FILTERS = [
  { id: 'all', label: 'All', icon: 'globe-outline' as const },
  { id: 'egypt', label: 'Egypt', icon: 'flag-outline' as const },
  { id: 'arab', label: 'Arab World', icon: 'map-outline' as const },
  { id: 'world', label: 'International', icon: 'earth-outline' as const },
];

const TYPE_FILTERS = [
  { id: 'all', label: 'All types' },
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'internship', label: 'Internship' },
  { id: 'freelance', label: 'Freelance' },
];

const REGION_META: Record<string, { label: string; color: string }> = {
  egypt: { label: 'Egypt', color: '#E50914' },
  arab: { label: 'Arab World', color: '#F59E0B' },
  world: { label: 'International', color: '#38BDF8' },
};

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
  const [region, setRegion] = useState('egypt');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (type !== 'all') params.set('type', type);

      const res = await fetch(`${API_BASE_URL}/api/jobs?${params.toString()}`);
      const data = await res.json();
      const localJobs = res.ok ? data?.data?.jobs || [] : [];
      if (!res.ok) {
        setError(data?.message || 'Could not load local jobs');
      }

      let feedJobs = [];
      try {
        feedJobs = await fetchPublicJobFeed();
      } catch {
        feedJobs = [];
      }

      const merged = mergeJobs(localJobs, feedJobs).filter((job) => {
        if (type !== 'all' && job.type !== type) return false;
        if (!search.trim()) return true;
        const hay = `${job.title} ${job.companyName} ${job.location || ''}`.toLowerCase();
        return hay.includes(search.trim().toLowerCase());
      });
      merged.forEach(cacheFeedJob);
      setJobs(merged);
    } catch {
      try {
        const feedJobs = await fetchPublicJobFeed();
        feedJobs.forEach(cacheFeedJob);
        setJobs(feedJobs);
        setError(null);
      } catch {
        setError('Could not load jobs');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, type]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const jobsByRegion = useMemo(() => {
    const grouped = { egypt: [] as Job[], arab: [] as Job[], world: [] as Job[] };
    jobs.forEach((job) => {
      grouped[getJobRegion(job)].push(job);
    });
    return grouped;
  }, [jobs]);

  const visibleJobs = useMemo(() => {
    if (region === 'egypt') return jobsByRegion.egypt;
    if (region === 'arab') return jobsByRegion.arab;
    if (region === 'world') return jobsByRegion.world;
    return jobs;
  }, [jobs, jobsByRegion, region]);

  const countLabel = useMemo(
    () => `${visibleJobs.length} ${visibleJobs.length === 1 ? 'job' : 'jobs'}`,
    [visibleJobs.length]
  );

  const openJob = (job: Job) => {
    cacheFeedJob(job);
    router.push({ pathname: '/job-details', params: { id: job._id } });
  };

  const renderJobCard = (job: Job) => {
    const jobRegion = getJobRegion(job);
    const regionMeta = REGION_META[jobRegion];
    return (
      <TouchableOpacity
        key={job._id}
        style={[styles.card, job.isFeatured && styles.cardFeatured]}
        activeOpacity={0.85}
        onPress={() => openJob(job)}
      >
        <View style={styles.cardTop}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>
              {(job.companyName || 'C').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.flex}>
            <View style={styles.titleRow}>
              <Text style={styles.jobTitle} numberOfLines={2}>
                {job.title}
              </Text>
            </View>
            <Text style={styles.company}>{job.companyName}</Text>
          </View>
        </View>

        <View style={styles.pillsRow}>
          <View style={[styles.regionPill, { borderColor: regionMeta.color }]}>
            <Text style={[styles.regionPillText, { color: regionMeta.color }]}>
              {regionMeta.label}
            </Text>
          </View>
          {job.isFeatured ? (
            <View style={styles.featured}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          ) : null}
          {job.source === 'feed' || job.applyType === 'external' ? (
            <View style={styles.externalBadge}>
              <Ionicons name="open-outline" size={11} color="#bbb" />
              <Text style={styles.externalBadgeText}>External apply</Text>
            </View>
          ) : (
            <View style={styles.internalBadge}>
              <Text style={styles.internalBadgeText}>Apply in app</Text>
            </View>
          )}
        </View>

        <View style={styles.metaChips}>
          <View style={styles.metaChip}>
            <Ionicons name="briefcase-outline" size={13} color="#aaa" />
            <Text style={styles.meta}>{typeLabel(job.type)}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="laptop-outline" size={13} color="#aaa" />
            <Text style={styles.meta}>{job.workMode || 'remote'}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="location-outline" size={13} color="#aaa" />
            <Text style={styles.meta} numberOfLines={1}>
              {job.location || 'Egypt'}
            </Text>
          </View>
        </View>
        {job.salaryRange ? <Text style={styles.salary}>{job.salaryRange}</Text> : null}
      </TouchableOpacity>
    );
  };

  const renderRegionBlock = (id: 'egypt' | 'arab' | 'world', title: string) => {
    const list = jobsByRegion[id];
    if (!list.length) return null;
    return (
      <View key={id} style={styles.sectionBlock}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{list.length}</Text>
        </View>
        {list.map(renderJobCard)}
      </View>
    );
  };

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
              <Text style={styles.subtitle}>Egypt · Arab World · International</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.myJobsBtn}
                onPress={() => router.push('/my-jobs')}
              >
                <Ionicons name="people-outline" size={16} color="#fff" />
                <Text style={styles.myJobsBtnText}>My Jobs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postBtn}
                onPress={() => router.push('/post-job')}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.postBtnText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a job or company..."
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={load}
              returnKeyType="search"
            />
          </View>

          <View style={styles.regionRow}>
            {REGION_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.regionTab, region === f.id && styles.regionTabOn]}
                onPress={() => setRegion(f.id)}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={region === f.id ? '#fff' : '#888'}
                />
                <Text style={[styles.regionTabText, region === f.id && styles.regionTabTextOn]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
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

          <Text style={styles.count}>{countLabel}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} />
          ) : visibleJobs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No jobs in this section</Text>
              <Text style={styles.emptyHint}>Try another section or refresh the page</Text>
            </View>
          ) : region === 'all' ? (
            <>
              {renderRegionBlock('egypt', 'Egypt')}
              {renderRegionBlock('arab', 'Arab World')}
              {renderRegionBlock('world', 'International')}
            </>
          ) : (
            visibleJobs.map(renderJobCard)
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
  regionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  regionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  regionTabOn: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  regionTabText: { color: '#888', fontSize: 12, fontWeight: '700' },
  regionTabTextOn: { color: '#fff' },
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
  sectionBlock: { marginBottom: 8 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCount: { color: '#888', fontSize: 13, fontWeight: '700' },
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
    backgroundColor: '#101010',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 12,
  },
  cardFeatured: {
    borderColor: 'rgba(229,9,20,0.45)',
    backgroundColor: '#160808',
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.35)',
  },
  logoText: { color: '#E50914', fontSize: 20, fontWeight: '800' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  jobTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4, flex: 1 },
  company: { color: '#9a9a9a', fontSize: 13, fontWeight: '600' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  regionPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  regionPillText: { fontSize: 11, fontWeight: '800' },
  featured: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  featuredText: { color: '#E50914', fontSize: 11, fontWeight: '800' },
  externalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#333',
  },
  externalBadgeText: { color: '#bbb', fontSize: 11, fontWeight: '700' },
  internalBadge: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  internalBadgeText: { color: '#4ADE80', fontSize: 11, fontWeight: '700' },
  metaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#171717',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  meta: { color: '#c4c4c4', fontSize: 12, textTransform: 'capitalize', maxWidth: 140 },
  salary: { color: '#4ADE80', fontSize: 13, fontWeight: '700', marginTop: 10 },
});
