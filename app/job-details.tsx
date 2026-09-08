import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import { getCachedFeedJob } from '../utils/jobFeedClient';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type Job = {
  _id: string;
  title: string;
  companyName: string;
  companyWebsite?: string;
  location?: string;
  type?: string;
  workMode?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  applyType?: 'internal' | 'external';
  applyUrl?: string;
  source?: string;
  sourceName?: string;
};

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [cvFileName, setCvFileName] = useState('');

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      const cached = getCachedFeedJob(id);
      if (cached) {
        setJob(cached);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`);
        const data = await res.json();
        if (res.ok) setJob(data?.data?.job || null);
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    const checkApplied = async () => {
      if (!user || !id) {
        setHasApplied(false);
        return;
      }
      try {
        const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/me/applications`);
        const data = await res.json();
        if (!res.ok) return;
        const apps = data?.data?.applications || [];
        const applied = apps.some((a: any) => String(a?.job?._id || a?.job) === String(id));
        setHasApplied(applied);
      } catch {
        // ignore
      }
    };
    checkApplied();
  }, [user, id]);

  const handleApplyPress = async () => {
    if (hasApplied) return;

    if (!user) {
      Alert.alert('Login required', 'Sign in to apply for this job', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (job?.applyType === 'external' && job.applyUrl) {
      try {
        await Linking.openURL(job.applyUrl);
      } catch {
        Alert.alert('Error', 'Could not open the application link');
      }
      return;
    }

    setShowApply(true);
  };

  const pickAndUploadCv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setUploadingCv(true);

      const formData = new FormData();
      formData.append('cv', {
        uri: file.uri,
        name: file.name || 'cv.pdf',
        type: file.mimeType || 'application/pdf',
      } as any);

      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/upload-cv`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data?.data?.cvUrl) {
        setCvUrl(data.data.cvUrl);
        setCvFileName(data.data.filename || file.name || 'cv.pdf');
        Alert.alert('Done', 'CV uploaded successfully');
      } else {
        Alert.alert('Error', data?.message || 'Failed to upload CV');
      }
    } catch (e) {
      console.error('CV pick/upload error:', e);
      Alert.alert('Error', 'Failed to pick or upload the file');
    } finally {
      setUploadingCv(false);
    }
  };

  const submitApplication = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required', 'Name and email are required');
      return;
    }
    if (!cvUrl.trim()) {
      Alert.alert('Required', 'Upload the CV as a PDF file');
      return;
    }

    try {
      setSubmitting(true);
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          coverNote: coverNote.trim(),
          cvUrl: cvUrl.trim(),
        }),
      });
      const data = await res.json();
        if (res.ok) {
        setShowApply(false);
        setHasApplied(true);
        setCvUrl('');
        setCvFileName('');
        setCoverNote('');
        Alert.alert(
          'Applied',
          'Your application and CV are now visible to the employer in My Jobs.'
        );
      } else if (String(data?.message || '').toLowerCase().includes('already applied')) {
        setShowApply(false);
        setHasApplied(true);
        Alert.alert('Done', 'You already applied to this job');
      } else {
        Alert.alert('Error', data?.message || 'Failed to apply');
      }
    } catch {
      Alert.alert('Error', 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color="#E50914" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.error}>Job not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#050505', '#0a0a0a']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>{job.companyName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.company}>{job.companyName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{job.type}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.meta}>{job.workMode}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.meta}>{job.location || 'Egypt'}</Text>
            </View>
            {job.salaryRange ? <Text style={styles.salary}>{job.salaryRange}</Text> : null}
            {job.source === 'feed' ? (
              <Text style={styles.sourceNote}>
                Source: {job.sourceName || 'Official site'} · Apply on the original website
              </Text>
            ) : null}
          </View>

          <Text style={styles.section}>Description</Text>
          <Text style={styles.body}>{job.description}</Text>

          {job.requirements ? (
            <>
              <Text style={styles.section}>Requirements</Text>
              <Text style={styles.body}>{job.requirements}</Text>
            </>
          ) : null}

          {job.companyWebsite ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(job.companyWebsite!)}
              style={styles.linkRow}
            >
              <Ionicons name="globe-outline" size={16} color="#E50914" />
              <Text style={styles.linkText}>Company website</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.applyBtn, hasApplied && styles.applyBtnDone]}
            onPress={handleApplyPress}
            disabled={hasApplied}
          >
            <Text style={styles.applyBtnText}>
              {hasApplied
                ? 'Applied ✓'
                : job.applyType === 'external'
                  ? 'Apply via link'
                  : 'Apply now'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <Modal visible={showApply} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Apply for this job</Text>
            <TouchableOpacity onPress={() => setShowApply(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#666" />
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#666"
            />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#666" />
            <Text style={styles.label}>Short message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={coverNote}
              onChangeText={setCoverNote}
              multiline
              placeholder="Why you are a good fit..."
              placeholderTextColor="#666"
            />
            <Text style={styles.label}>CV (PDF) *</Text>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={pickAndUploadCv}
              disabled={uploadingCv}
            >
              <Ionicons name="document-attach-outline" size={18} color="#fff" />
              <Text style={styles.uploadBtnText}>
                {uploadingCv ? 'Uploading...' : cvFileName ? 'Change file' : 'Upload PDF'}
              </Text>
            </TouchableOpacity>
            {cvFileName ? (
              <View style={styles.fileRow}>
                <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {cvFileName}
                </Text>
              </View>
            ) : (
              <Text style={styles.hint}>Required — this file is sent to the company with your application</Text>
            )}

            <TouchableOpacity
              style={[styles.applyBtn, (submitting || uploadingCv) && { opacity: 0.6 }]}
              onPress={submitApplication}
              disabled={submitting || uploadingCv}
            >
              <Text style={styles.applyBtnText}>{submitting ? 'Submitting...' : 'Submit application'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 16 },
  backText: { color: '#ccc', fontSize: 15 },
  hero: {
    backgroundColor: '#121212',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 20,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoText: { color: '#E50914', fontSize: 22, fontWeight: '800' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  company: { color: '#aaa', fontSize: 15, marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  meta: { color: '#888', fontSize: 13, textTransform: 'capitalize' },
  dot: { color: '#555', marginHorizontal: 6 },
  salary: { color: '#4ADE80', fontSize: 14, fontWeight: '700', marginTop: 10 },
  sourceNote: { color: '#888', fontSize: 12, marginTop: 10 },
  section: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  body: { color: '#ccc', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  linkText: { color: '#E50914', fontSize: 14, fontWeight: '600' },
  applyBtn: {
    backgroundColor: '#E50914',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnDone: {
    backgroundColor: '#166534',
  },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  error: { color: '#E50914', textAlign: 'center', marginTop: 40 },
  modalSafe: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modalBody: { padding: 20 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 14,
  },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  fileName: { color: '#4ADE80', fontSize: 13, flex: 1 },
  hint: { color: '#666', fontSize: 12, marginTop: 8 },
});
