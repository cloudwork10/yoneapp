import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type Job = {
  _id: string;
  title: string;
  companyName: string;
  approvalStatus?: string;
  applicationsCount?: number;
  type?: string;
  workMode?: string;
  isActive?: boolean;
};

export default function MyJobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/company/mine`);
      const data = await res.json();
      if (res.ok) setJobs(data?.data?.jobs || []);
      else Alert.alert('خطأ', data?.message || 'تعذر تحميل وظائفك');
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالسيرفر');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const statusColor = (s?: string) => {
    if (s === 'approved') return '#4ADE80';
    if (s === 'rejected') return '#F87171';
    return '#FBBF24';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#050505', '#111']} style={styles.flex}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>وظائفي</Text>
        <Text style={styles.subtitle}>شوف مين قدّم على الوظائف اللي نشرتها</Text>

        {loading ? (
          <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
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
            {jobs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.empty}>لسه ما نشرتش وظائف</Text>
                <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/post-job')}>
                  <Text style={styles.postBtnText}>نشر وظيفة</Text>
                </TouchableOpacity>
              </View>
            ) : (
              jobs.map((job) => (
                <View key={job._id} style={styles.card}>
                  <View style={styles.cardHead}>
                    <View style={styles.flex}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.company}>{job.companyName}</Text>
                    </View>
                    <Text style={[styles.status, { color: statusColor(job.approvalStatus) }]}>
                      {(job.approvalStatus || '').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.meta}>
                    {job.type} · {job.workMode} · {job.applicationsCount || 0} متقدم
                  </Text>
                  <TouchableOpacity
                    style={styles.appsBtn}
                    onPress={() =>
                      router.push({ pathname: '/job-applicants', params: { id: job._id } })
                    }
                  >
                    <Ionicons name="people-outline" size={18} color="#fff" />
                    <Text style={styles.appsBtnText}>عرض المتقدمين</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  flex: { flex: 1 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backText: { color: '#ccc', fontSize: 15 },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  subtitle: { color: '#888', paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyBox: { alignItems: 'center', marginTop: 48 },
  empty: { color: '#888', marginBottom: 16 },
  postBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  postBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 12,
  },
  cardHead: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  jobTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  company: { color: '#999', fontSize: 13, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '800' },
  meta: { color: '#777', fontSize: 12, marginBottom: 12 },
  appsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 12,
  },
  appsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
