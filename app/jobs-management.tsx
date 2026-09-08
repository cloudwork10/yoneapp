import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type Job = {
  _id: string;
  title: string;
  companyName: string;
  companyEmail?: string;
  companyWebsite?: string;
  location?: string;
  type?: string;
  workMode?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  applyType?: string;
  applyUrl?: string;
  accessType?: string;
  isFeatured?: boolean;
  approvalStatus?: string;
  source?: string;
  sourceName?: string;
  applicationsCount?: number;
  isActive?: boolean;
  rejectionReason?: string;
};

const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'الكل' },
];

const TYPES = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'internship', label: 'Internship' },
  { id: 'freelance', label: 'Freelance' },
];

const MODES = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'On-site' },
];

const emptyForm = () => ({
  title: '',
  companyName: '',
  companyEmail: '',
  companyWebsite: '',
  location: 'Egypt',
  type: 'full-time',
  workMode: 'remote',
  description: '',
  requirements: '',
  salaryRange: '',
  applyType: 'internal' as 'internal' | 'external',
  applyUrl: '',
  accessType: 'free' as 'free' | 'premium',
  isFeatured: false,
});

export default function JobsManagementScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (job: Job) => {
    setEditingId(job._id);
    setForm({
      title: job.title || '',
      companyName: job.companyName || '',
      companyEmail: job.companyEmail || '',
      companyWebsite: job.companyWebsite || '',
      location: job.location || 'Egypt',
      type: job.type || 'full-time',
      workMode: job.workMode || 'remote',
      description: job.description || '',
      requirements: job.requirements || '',
      salaryRange: job.salaryRange || '',
      applyType: (job.applyType === 'external' ? 'external' : 'internal') as 'internal' | 'external',
      applyUrl: job.applyUrl || '',
      accessType: (job.accessType === 'premium' ? 'premium' : 'free') as 'free' | 'premium',
      isFeatured: !!job.isFeatured,
    });
    setShowForm(true);
  };

  const setField = <K extends keyof ReturnType<typeof emptyForm>>(
    key: K,
    value: ReturnType<typeof emptyForm>[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/jobs/admin/all?status=${filter}`
      );
      const data = await res.json();
      if (res.ok) setJobs(data?.data?.jobs || []);
      else Alert.alert('Error', data?.message || 'Failed to load jobs');
    } catch {
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const approve = (job: Job) => {
    Alert.alert('Approve', `الموافقة على "${job.title}"؟`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          const res = await makeAuthenticatedRequest(
            `${API_BASE_URL}/api/jobs/admin/${job._id}/approve`,
            { method: 'POST' }
          );
          if (res.ok) load();
          else Alert.alert('Error', 'Approve failed');
        },
      },
    ]);
  };

  const reject = (job: Job) => {
    Alert.alert('Reject', `رفض "${job.title}"؟`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          const res = await makeAuthenticatedRequest(
            `${API_BASE_URL}/api/jobs/admin/${job._id}/reject`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: '' }),
            }
          );
          if (res.ok) load();
          else Alert.alert('Error', 'Reject failed');
        },
      },
    ]);
  };

  const syncFeed = async () => {
    try {
      setSyncing(true);
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/admin/sync-feed`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setFilter('approved');
        load();
        Alert.alert(
          'تم السحب',
          `جديد: ${data?.data?.created || 0} · تحديث: ${data?.data?.updated || 0}`
        );
      } else {
        Alert.alert('Error', data?.message || 'فشل سحب الوظائف');
      }
    } catch {
      Alert.alert('Error', 'فشل سحب الوظائف');
    } finally {
      setSyncing(false);
    }
  };

  const toggleActive = async (job: Job) => {
    const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/admin/${job._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: job.isActive === false }),
    });
    if (res.ok) load();
    else Alert.alert('Error', 'تعذر تغيير حالة الوظيفة');
  };

  const remove = (job: Job) => {
    Alert.alert('Delete', `حذف "${job.title}"؟`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await makeAuthenticatedRequest(
            `${API_BASE_URL}/api/jobs/admin/${job._id}`,
            { method: 'DELETE' }
          );
          if (res.ok) load();
        },
      },
    ]);
  };

  const saveJob = async () => {
    if (!form.title.trim() || !form.companyName.trim() || !form.description.trim()) {
      Alert.alert('Required', 'Title, company, and description are required');
      return;
    }
    if (form.companyEmail.trim() && !form.companyEmail.includes('@')) {
      Alert.alert('خطأ', 'إيميل الشركة غير صحيح');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        companyName: form.companyName.trim(),
        companyEmail: form.companyEmail.trim(),
        companyWebsite: form.companyWebsite.trim(),
        location: form.location.trim(),
        type: form.type,
        workMode: form.workMode,
        description: form.description.trim(),
        requirements: form.requirements.trim(),
        salaryRange: form.salaryRange.trim(),
        applyType: form.applyType,
        applyUrl: form.applyUrl.trim(),
        accessType: form.accessType,
        isFeatured: form.isFeatured,
        isActive: true,
      };

      const res = editingId
        ? await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/admin/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (res.ok) {
        closeForm();
        if (!editingId) setFilter('approved');
        load();
        Alert.alert('Done', editingId ? 'تم تعديل الوظيفة' : 'Job published');
      } else {
        Alert.alert('Error', data?.message || 'Failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s?: string) => {
    if (s === 'approved') return '#4ADE80';
    if (s === 'rejected') return '#F87171';
    return '#FBBF24';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#050505', '#111']} style={styles.flex}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.syncBtn} onPress={syncFeed} disabled={syncing}>
              <Text style={styles.addBtnText}>{syncing ? 'جاري السحب…' : 'سحب من النت'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
              <Text style={styles.addBtnText}>+ Add Job</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>Jobs Management</Text>
        <Text style={styles.subtitle}>إضافة يدوي + سحب رسمي من النت + إخفاء أي وظيفة</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, filter === f.id && styles.chipOn]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.chipText, filter === f.id && styles.chipTextOn]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {jobs.length === 0 ? (
              <Text style={styles.empty}>No jobs in this filter</Text>
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
                    {job.source === 'feed' ? `نت/${job.sourceName || 'feed'}` : job.source} · {job.type} · {job.workMode} · {job.isActive === false ? 'مخفية' : 'ظاهرة'}
                  </Text>
                  {job.companyEmail ? (
                    <Text style={styles.meta}>{job.companyEmail}</Text>
                  ) : null}
                  <Text style={styles.desc} numberOfLines={3}>
                    {job.description}
                  </Text>

                  <View style={styles.actions}>
                    {job.approvalStatus === 'pending' ? (
                      <>
                        <TouchableOpacity style={styles.approve} onPress={() => approve(job)}>
                          <Text style={styles.actionText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.reject} onPress={() => reject(job)}>
                          <Text style={styles.actionText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    ) : null}
                    <TouchableOpacity
                      style={styles.edit}
                      onPress={() =>
                        router.push({ pathname: '/job-applicants', params: { id: job._id } })
                      }
                    >
                      <Text style={styles.actionText}>
                        متقدمين ({job.applicationsCount || 0})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.edit} onPress={() => toggleActive(job)}>
                      <Text style={styles.actionText}>
                        {job.isActive === false ? 'إظهار' : 'إخفاء'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.edit} onPress={() => openEdit(job)}>
                      <Text style={styles.actionText}>تعديل</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.delete} onPress={() => remove(job)}>
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </LinearGradient>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>
              {editingId ? 'تعديل الوظيفة' : 'Add Job (Approved)'}
            </Text>
            <TouchableOpacity onPress={closeForm}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>عنوان الوظيفة *</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(v) => setField('title', v)}
              placeholder="Frontend Developer"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>اسم الشركة *</Text>
            <TextInput
              style={styles.input}
              value={form.companyName}
              onChangeText={(v) => setField('companyName', v)}
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>إيميل الشركة (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={form.companyEmail}
              onChangeText={(v) => setField('companyEmail', v)}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="hr@company.com"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>موقع الشركة</Text>
            <TextInput
              style={styles.input}
              value={form.companyWebsite}
              onChangeText={(v) => setField('companyWebsite', v)}
              autoCapitalize="none"
              placeholder="https://"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>الموقع الجغرافي</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(v) => setField('location', v)}
              placeholder="Cairo / Remote"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>نوع الوظيفة</Text>
            <View style={styles.chips}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.formChip, form.type === t.id && styles.formChipOn]}
                  onPress={() => setField('type', t.id)}
                >
                  <Text style={[styles.formChipText, form.type === t.id && styles.formChipTextOn]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>نظام العمل</Text>
            <View style={styles.chips}>
              {MODES.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.formChip, form.workMode === m.id && styles.formChipOn]}
                  onPress={() => setField('workMode', m.id)}
                >
                  <Text style={[styles.formChipText, form.workMode === m.id && styles.formChipTextOn]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>الوصف *</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={form.description}
              onChangeText={(v) => setField('description', v)}
              multiline
              placeholder="وصف الوظيفة والمسؤوليات..."
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>المتطلبات</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={form.requirements}
              onChangeText={(v) => setField('requirements', v)}
              multiline
              placeholder="المهارات والخبرة المطلوبة..."
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>الراتب (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={form.salaryRange}
              onChangeText={(v) => setField('salaryRange', v)}
              placeholder="15,000 - 25,000 EGP"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>طريقة التقديم</Text>
            <View style={styles.chips}>
              <TouchableOpacity
                style={[styles.formChip, form.applyType === 'internal' && styles.formChipOn]}
                onPress={() => setField('applyType', 'internal')}
              >
                <Text style={[styles.formChipText, form.applyType === 'internal' && styles.formChipTextOn]}>
                  داخل التطبيق
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formChip, form.applyType === 'external' && styles.formChipOn]}
                onPress={() => setField('applyType', 'external')}
              >
                <Text style={[styles.formChipText, form.applyType === 'external' && styles.formChipTextOn]}>
                  لينك خارجي
                </Text>
              </TouchableOpacity>
            </View>

            {form.applyType === 'external' ? (
              <>
                <Text style={styles.label}>لينك التقديم</Text>
                <TextInput
                  style={styles.input}
                  value={form.applyUrl}
                  onChangeText={(v) => setField('applyUrl', v)}
                  autoCapitalize="none"
                  placeholder="https://"
                  placeholderTextColor="#666"
                />
              </>
            ) : null}

            <Text style={styles.label}>الوصول</Text>
            <View style={styles.chips}>
              <TouchableOpacity
                style={[styles.formChip, form.accessType === 'free' && styles.formChipOn]}
                onPress={() => setField('accessType', 'free')}
              >
                <Text style={[styles.formChipText, form.accessType === 'free' && styles.formChipTextOn]}>
                  مجاني
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formChip, form.accessType === 'premium' && styles.formChipOn]}
                onPress={() => setField('accessType', 'premium')}
              >
                <Text style={[styles.formChipText, form.accessType === 'premium' && styles.formChipTextOn]}>
                  اشتراك
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.formChip, form.isFeatured && styles.formChipOn, { alignSelf: 'flex-start', marginTop: 12 }]}
              onPress={() => setField('isFeatured', !form.isFeatured)}
            >
              <Text style={[styles.formChipText, form.isFeatured && styles.formChipTextOn]}>
                {form.isFeatured ? '★ Featured' : '☆ Featured'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.approve, { marginTop: 24, paddingVertical: 14 }]}
              onPress={saveJob}
              disabled={saving}
            >
              <Text style={styles.actionText}>
                {saving ? 'Saving...' : editingId ? 'حفظ التعديل' : 'Publish'}
              </Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { color: '#ccc', fontSize: 15 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncBtn: {
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  addBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  subtitle: { color: '#888', paddingHorizontal: 20, marginTop: 4, marginBottom: 12 },
  filters: { paddingHorizontal: 20, marginBottom: 8, maxHeight: 44 },
  chip: {
    backgroundColor: '#141414',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chipOn: { borderColor: '#E50914', backgroundColor: 'rgba(229,9,20,0.15)' },
  chipText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
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
  cardHead: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  jobTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  company: { color: '#999', fontSize: 13, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '800' },
  meta: { color: '#777', fontSize: 12, marginBottom: 4 },
  desc: { color: '#bbb', fontSize: 13, lineHeight: 18, marginTop: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  approve: {
    flexGrow: 1,
    minWidth: '30%',
    backgroundColor: '#166534',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reject: {
    flexGrow: 1,
    minWidth: '30%',
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  edit: {
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  delete: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalSafe: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  label: { color: '#aaa', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  area: { minHeight: 100, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  formChip: {
    backgroundColor: '#141414',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  formChipOn: { backgroundColor: 'rgba(229,9,20,0.15)', borderColor: '#E50914' },
  formChipText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  formChipTextOn: { color: '#fff' },
});
