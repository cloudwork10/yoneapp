import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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

type Application = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  coverNote?: string;
  cvUrl?: string;
  status?: string;
  createdAt?: string;
};

type JobInfo = {
  _id: string;
  title: string;
  companyName: string;
};

export default function JobApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/${id}/applications`);
      const data = await res.json();
      if (res.ok) {
        setJob(data?.data?.job || null);
        setApps(data?.data?.applications || []);
      } else {
        Alert.alert('Error', data?.message || 'Could not load applicants');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openCv = async (url?: string) => {
    if (!url) {
      Alert.alert('No CV', 'This applicant did not attach a file');
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open the CV');
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString('en-US');
    } catch {
      return value;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#050505', '#111']} style={styles.flex}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Applicants</Text>
        {job ? (
          <Text style={styles.subtitle}>
            {job.title} · {job.companyName}
          </Text>
        ) : (
          <Text style={styles.subtitle}>Applications and CVs</Text>
        )}

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
            {apps.length === 0 ? (
              <Text style={styles.empty}>No applications for this job yet</Text>
            ) : (
              apps.map((app) => (
                <View key={app._id} style={styles.card}>
                  <Text style={styles.name}>{app.name}</Text>
                  <Text style={styles.meta}>{app.email}</Text>
                  {app.phone ? <Text style={styles.meta}>{app.phone}</Text> : null}
                  <Text style={styles.date}>{formatDate(app.createdAt)}</Text>
                  {app.coverNote ? (
                    <Text style={styles.note} numberOfLines={4}>
                      {app.coverNote}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.cvBtn, !app.cvUrl && { opacity: 0.5 }]}
                    onPress={() => openCv(app.cvUrl)}
                    disabled={!app.cvUrl}
                  >
                    <Ionicons name="document-text-outline" size={18} color="#fff" />
                    <Text style={styles.cvBtnText}>
                      {app.cvUrl ? 'Open CV (PDF)' : 'No CV'}
                    </Text>
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
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 12,
  },
  name: { color: '#fff', fontSize: 17, fontWeight: '700' },
  meta: { color: '#999', fontSize: 13, marginTop: 4 },
  date: { color: '#666', fontSize: 12, marginTop: 6 },
  note: { color: '#bbb', fontSize: 13, lineHeight: 20, marginTop: 10 },
  cvBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E50914',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 14,
  },
  cvBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
