import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

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

export default function PostJobScreen() {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState(user?.email || '');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [location, setLocation] = useState('Egypt');
  const [type, setType] = useState('full-time');
  const [workMode, setWorkMode] = useState('remote');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [applyType, setApplyType] = useState<'internal' | 'external'>('internal');
  const [applyUrl, setApplyUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول مطلوب', 'سجّل دخول كشركة أو مستخدم عشان تنشر وظيفة', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!title.trim() || !companyName.trim() || !description.trim()) {
      Alert.alert('مطلوب', 'العنوان واسم الشركة والوصف مطلوبين');
      return;
    }
    if (companyEmail.trim() && !companyEmail.includes('@')) {
      Alert.alert('خطأ', 'إيميل الشركة غير صحيح');
      return;
    }

    try {
      setSubmitting(true);
      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/jobs/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          companyName: companyName.trim(),
          companyEmail: companyEmail.trim(),
          companyWebsite: companyWebsite.trim(),
          location: location.trim(),
          type,
          workMode,
          description: description.trim(),
          requirements: requirements.trim(),
          salaryRange: salaryRange.trim(),
          applyType,
          applyUrl: applyUrl.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          'تم الإرسال',
          'الوظيفة قيد المراجعة. بعد الموافقة، المتقدمين هيظهروا لك في «وظائفي».',
          [{ text: 'وظائفي', onPress: () => router.replace('/my-jobs') }, { text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('خطأ', data?.message || 'فشل إرسال الوظيفة');
      }
    } catch {
      Alert.alert('خطأ', 'فشل إرسال الوظيفة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#050505', '#0a0a0a']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.brand}>FOR COMPANIES</Text>
          <Text style={styles.title}>نشر وظيفة</Text>
          <Text style={styles.hint}>
            ابعت الوظيفة → حالة Pending → الأدمن يوافق أو يرفض قبل الظهور للطلاب
          </Text>

          <Text style={styles.label}>عنوان الوظيفة *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor="#666" placeholder="Frontend Developer" />

          <Text style={styles.label}>اسم الشركة *</Text>
          <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholderTextColor="#666" />

          <Text style={styles.label}>إيميل الشركة (اختياري)</Text>
          <TextInput
            style={styles.input}
            value={companyEmail}
            onChangeText={setCompanyEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="hr@company.com"
            placeholderTextColor="#666"
          />

          <Text style={styles.hint}>
            التقديمات والـ CV هتوصل لك جوه التطبيق من صفحة «وظائفي»
          </Text>

          <Text style={styles.label}>موقع الشركة (اختياري)</Text>
          <TextInput style={styles.input} value={companyWebsite} onChangeText={setCompanyWebsite} autoCapitalize="none" placeholder="https://" placeholderTextColor="#666" />

          <Text style={styles.label}>الموقع</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholderTextColor="#666" />

          <Text style={styles.label}>نوع الوظيفة</Text>
          <View style={styles.chips}>
            {TYPES.map((t) => (
              <TouchableOpacity key={t.id} style={[styles.chip, type === t.id && styles.chipOn]} onPress={() => setType(t.id)}>
                <Text style={[styles.chipText, type === t.id && styles.chipTextOn]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>نظام العمل</Text>
          <View style={styles.chips}>
            {MODES.map((m) => (
              <TouchableOpacity key={m.id} style={[styles.chip, workMode === m.id && styles.chipOn]} onPress={() => setWorkMode(m.id)}>
                <Text style={[styles.chipText, workMode === m.id && styles.chipTextOn]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>الوصف *</Text>
          <TextInput style={[styles.input, styles.area]} value={description} onChangeText={setDescription} multiline placeholderTextColor="#666" />

          <Text style={styles.label}>المتطلبات</Text>
          <TextInput style={[styles.input, styles.area]} value={requirements} onChangeText={setRequirements} multiline placeholderTextColor="#666" />

          <Text style={styles.label}>الراتب (اختياري)</Text>
          <TextInput style={styles.input} value={salaryRange} onChangeText={setSalaryRange} placeholder="مثلاً 15,000 - 25,000 EGP" placeholderTextColor="#666" />

          <Text style={styles.label}>طريقة التقديم</Text>
          <View style={styles.chips}>
            <TouchableOpacity style={[styles.chip, applyType === 'internal' && styles.chipOn]} onPress={() => setApplyType('internal')}>
              <Text style={[styles.chipText, applyType === 'internal' && styles.chipTextOn]}>داخل التطبيق</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, applyType === 'external' && styles.chipOn]} onPress={() => setApplyType('external')}>
              <Text style={[styles.chipText, applyType === 'external' && styles.chipTextOn]}>لينك خارجي</Text>
            </TouchableOpacity>
          </View>

          {applyType === 'external' ? (
            <>
              <Text style={styles.label}>لينك التقديم</Text>
              <TextInput style={styles.input} value={applyUrl} onChangeText={setApplyUrl} autoCapitalize="none" placeholder="https://" placeholderTextColor="#666" />
            </>
          ) : null}

          <TouchableOpacity style={[styles.submit, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'جاري الإرسال...' : 'إرسال للمراجعة'}</Text>
          </TouchableOpacity>
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
  brand: { color: '#E50914', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 4 },
  hint: { color: '#888', fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 12 },
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
  area: { minHeight: 100, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#141414',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chipOn: { backgroundColor: 'rgba(229,9,20,0.15)', borderColor: '#E50914' },
  chipText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  submit: {
    backgroundColor: '#E50914',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
