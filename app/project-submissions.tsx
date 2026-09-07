import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import API_BASE_URL from '../config/api';
import { useUser } from '../contexts/UserContext';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type Submission = {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  fullName?: string;
  githubUrl?: string;
  liveUrl?: string;
  videoUrl?: string;
  extraUrl?: string;
  adminNote?: string;
  createdAt?: string;
  user?: { name?: string; email?: string };
  course?: { title?: string };
};

export default function ProjectSubmissionsScreen() {
  const { isAdmin } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminNote, setAdminNote] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [inboxReady, setInboxReady] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/course-projects/admin?status=${filter}`
      );
      const data = await response.json().catch(() => ({}));
      if (response.status === 404) {
        setInboxReady(false);
        setSubmissions([]);
        return;
      }
      if (!response.ok) {
        setInboxReady(true);
        Alert.alert('Error', data?.message || 'Failed to load project submissions');
        return;
      }
      setInboxReady(true);
      setSubmissions(data?.data?.submissions || []);
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      if (!isAdmin) {
        Alert.alert('Access Denied', 'Admin only', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }
      setLoading(true);
      load();
    }, [isAdmin, load])
  );

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    load();
  }, [filter, isAdmin, load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    try {
      setActingId(id);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/course-projects/admin/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, adminNote }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        Alert.alert('Failed', data?.message || `Could not ${action}`);
        return;
      }
      Alert.alert(
        'Done',
        action === 'approve'
          ? 'Approved. The student can now open the certificate.'
          : 'Submission rejected. The student can resubmit.'
      );
      setAdminNote('');
      await load();
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setActingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Project Submissions</Text>
          <Text style={styles.sub}>Review graduation projects · approve to issue the certificate</Text>
        </View>

        <View style={styles.filters}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={styles.filterText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
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
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          >
            {!inboxReady ? (
              <Text style={styles.empty}>
                Inbox is ready in the app. Deploy the backend so submissions can arrive here.
              </Text>
            ) : !submissions.length ? (
              <Text style={styles.empty}>No submissions in this filter.</Text>
            ) : (
              submissions.map((item) => (
                <View key={item._id} style={styles.card}>
                  <Text style={styles.course}>{item.course?.title || 'Course'}</Text>
                  <Text style={styles.name}>{item.fullName || item.user?.name || 'Student'}</Text>
                  <Text style={styles.email}>{item.user?.email || ''}</Text>
                  <Text style={styles.status}>{item.status}</Text>
                  {item.githubUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(item.githubUrl!)}>
                      <Text style={styles.link}>GitHub: {item.githubUrl}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.liveUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(item.liveUrl!)}>
                      <Text style={styles.link}>Live: {item.liveUrl}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.videoUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(item.videoUrl!)}>
                      <Text style={styles.link}>Video: {item.videoUrl}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.extraUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(item.extraUrl!)}>
                      <Text style={styles.link}>Extra: {item.extraUrl}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.status === 'pending' ? (
                    <>
                      <TextInput
                        style={styles.note}
                        value={adminNote}
                        onChangeText={setAdminNote}
                        placeholder="Review note (optional)"
                        placeholderTextColor="#666"
                      />
                      <View style={styles.row}>
                        <TouchableOpacity
                          style={[styles.btn, styles.approve]}
                          disabled={actingId === item._id}
                          onPress={() => act(item._id, 'approve')}
                        >
                          <Text style={styles.btnText}>
                            {actingId === item._id ? '...' : 'Approve'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btn, styles.reject]}
                          disabled={actingId === item._id}
                          onPress={() => act(item._id, 'reject')}
                        >
                          <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : null}
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
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  back: { color: '#E50914', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: '#999', marginTop: 4, fontSize: 13 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: { borderColor: '#E50914', backgroundColor: '#1a0a0c' },
  filterText: { color: '#fff', fontSize: 12, textTransform: 'capitalize' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  course: { color: '#fff', fontSize: 16, fontWeight: '700' },
  name: { color: '#ddd', marginTop: 4 },
  email: { color: '#888', fontSize: 12, marginBottom: 6 },
  status: { color: '#F59E0B', marginBottom: 8, textTransform: 'capitalize' },
  link: { color: '#60A5FA', fontSize: 13, marginBottom: 6 },
  note: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  approve: { backgroundColor: '#166534' },
  reject: { backgroundColor: '#7F1D1D' },
  btnText: { color: '#fff', fontWeight: '700' },
});
