import {
  INSTAPAY_NUMBER,
  VODAFONE_CASH_NUMBER,
  whatsappWaMeNumber,
} from '@/config/legal';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import { useUser } from '../contexts/UserContext';
import resolveMediaUrl from '../utils/mediaUrl';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

const { width } = Dimensions.get('window');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  discount: number;
  originalPrice: number;
}

type ManualRequest = {
  _id: string;
  plan: string;
  price: number;
  status: string;
  receiptUrl?: string;
  referenceCode?: string;
  adminNote?: string;
};

export default function Subscription2Screen() {
  const { user } = useUser();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [manualNote, setManualNote] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<ManualRequest | null>(null);
  const [latestRequest, setLatestRequest] = useState<ManualRequest | null>(null);
  const [zoomUri, setZoomUri] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
    fetchManualRequest();
  }, []);

  const selected = plans.find((p) => p.id === selectedPlan) || null;

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/plans`);
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setPlans(data.data.plans || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/payments/subscription`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.status === 'success') setCurrentSubscription(data.data.subscription);
    } catch {
      // ignore
    }
  };

  const fetchManualRequest = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/subscription-requests/mine`
      );
      if (!response.ok) return;
      const data = await response.json();
      setPendingRequest(data?.data?.pending || null);
      setLatestRequest(data?.data?.latest || null);
    } catch {
      // ignore
    }
  };

  const buildWhatsAppMessage = () =>
    [
      'طلب اشتراك ELNADY',
      `الاسم: ${user?.name || ''}`,
      `الإيميل: ${user?.email || ''}`,
      `User ID: ${user?.id || ''}`,
      `الباقة: ${selected?.name || selectedPlan || ''}`,
      `المبلغ: EGP ${selected?.price ?? ''}`,
      'مرفق سكرين التحويل',
    ].join('\n');

  const openWhatsApp = async (extraNote?: string) => {
    const text = extraNote ? `${buildWhatsAppMessage()}\n\n${extraNote}` : buildWhatsAppMessage();
    const url = `https://wa.me/${whatsappWaMeNumber()}?text=${encodeURIComponent(text)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('WhatsApp', 'تعذر فتح واتساب');
    }
  };

  const showWhatsAppFallback = (reason: string) => {
    Alert.alert(
      'مشكلة في الرفع',
      `${reason}\n\nابعت السكرين على واتساب وهنفعّل الاشتراك يدويًا.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open WhatsApp', onPress: () => openWhatsApp(`سبب: ${reason}`) },
      ]
    );
  };

  const copyNumber = (label: string, number: string) => {
    Clipboard.setString(number);
    Alert.alert('تم النسخ', `${label}: ${number}`);
  };

  const pickReceipt = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      setReceiptUri(result.assets[0].uri);
    } catch {
      showWhatsAppFallback('تعذر فتح معرض الصور');
    }
  };

  const submitManualRequest = async () => {
    if (!user) {
      Alert.alert('Login required', 'سجّل دخول أولاً');
      router.push('/login');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('اختَر باقة', 'اختَر خطة من الباقات فوق');
      return;
    }
    if (!receiptUri) {
      Alert.alert('السكرين مطلوب', 'ارفع صورة التحويل، أو ابعتها على واتساب');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('plan', selectedPlan);
      if (manualNote.trim()) formData.append('userNote', manualNote.trim());
      formData.append('receipt', {
        uri: receiptUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/subscription-requests`,
        { method: 'POST', body: formData }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          data?.message ||
          (response.status === 404
            ? 'الخدمة لسه بتتعمل deploy — ابعت على واتساب مؤقتًا'
            : `فشل الرفع (${response.status})`);
        showWhatsAppFallback(msg);
        return;
      }

      setReceiptUri(null);
      setManualNote('');
      await fetchManualRequest();
      Alert.alert(
        'تم إرسال الطلب ✅',
        `الرقم المرجعي: ${data?.data?.request?.referenceCode || '—'}\nهنراجع السكرين ونفعّل الاشتراك.`
      );
    } catch {
      showWhatsAppFallback('حصل خطأ شبكة أثناء الرفع');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelPendingRequest = async () => {
    if (!pendingRequest?._id) return;
    Alert.alert('إلغاء الطلب؟', 'تقدر تبعت طلب جديد بعدين.', [
      { text: 'إبقاء', style: 'cancel' },
      {
        text: 'إلغاء',
        style: 'destructive',
        onPress: async () => {
          const response = await makeAuthenticatedRequest(
            `${API_BASE_URL}/api/subscription-requests/${pendingRequest._id}/cancel`,
            { method: 'POST' }
          );
          if (response.ok) {
            await fetchManualRequest();
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>اشتراك يدوي</Text>
            <Text style={styles.subtitle}>3 خطوات بسيطة · التحويل ثم رفع السكرين</Text>
          </View>

          {currentSubscription ? (
            <View style={styles.activeBox}>
              <Text style={styles.activeTitle}>اشتراكك الحالي نشط</Text>
              <Text style={styles.activeText}>
                {currentSubscription.plan} حتى{' '}
                {new Date(currentSubscription.endDate).toLocaleDateString()}
              </Text>
            </View>
          ) : null}

          {/* STEP 1 */}
          <View style={styles.stepCard}>
            <Text style={styles.stepBadge}>1</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>اختَر الباقة</Text>
              <View style={styles.plansGrid}>
                {plans.map((plan) => {
                  const active = selectedPlan === plan.id;
                  const popular = plan.id === 'quarterly';
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planChip,
                        active && styles.planChipActive,
                        popular && styles.planChipPopular,
                      ]}
                      onPress={() => setSelectedPlan(plan.id)}
                      disabled={!!pendingRequest}
                    >
                      {popular ? <Text style={styles.popularTag}>الأشهر</Text> : null}
                      <Text style={styles.planName}>
                        {plan.name.replace(' Plan', '')}
                      </Text>
                      <Text style={styles.planPrice}>EGP {plan.price}</Text>
                      <Text style={styles.planDays}>{plan.duration} يوم</Text>
                      {plan.discount > 0 ? (
                        <Text style={styles.planDiscount}>-{plan.discount}%</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {selected ? (
                <Text style={styles.selectedHint}>
                  اخترت: {selected.name} · EGP {selected.price}
                </Text>
              ) : (
                <Text style={styles.selectedHintMuted}>اختَر باقة للمتابعة</Text>
              )}
            </View>
          </View>

          {/* STEP 2 */}
          <View style={styles.stepCard}>
            <Text style={styles.stepBadge}>2</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>حوّل المبلغ</Text>
              <Text style={styles.stepDesc}>
                حوّل على أحد الرقمين، واحفظ سكرين التحويل.
              </Text>
              <TouchableOpacity
                style={styles.payRow}
                onPress={() => copyNumber('فودافون كاش', VODAFONE_CASH_NUMBER)}
              >
                <View>
                  <Text style={styles.payLabel}>فودافون كاش</Text>
                  <Text style={styles.payNumber}>{VODAFONE_CASH_NUMBER}</Text>
                </View>
                <Text style={styles.copyBtn}>نسخ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payRow}
                onPress={() => copyNumber('InstaPay', INSTAPAY_NUMBER)}
              >
                <View>
                  <Text style={styles.payLabel}>InstaPay</Text>
                  <Text style={styles.payNumber}>{INSTAPAY_NUMBER}</Text>
                </View>
                <Text style={styles.copyBtn}>نسخ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* STEP 3 */}
          <View style={styles.stepCard}>
            <Text style={styles.stepBadge}>3</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>ارفع السكرين للتفعيل</Text>
              <Text style={styles.stepDesc}>
                لو الرفع في التطبيق واجه مشكلة، ابعت السكرين على واتساب بنفس البيانات.
              </Text>

              {pendingRequest ? (
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingTitle}>طلبك قيد المراجعة ⏳</Text>
                  <Text style={styles.pendingMeta}>
                    Ref: {pendingRequest.referenceCode} · {pendingRequest.plan} · EGP{' '}
                    {pendingRequest.price}
                  </Text>
                  {pendingRequest.receiptUrl ? (
                    <TouchableOpacity
                      onPress={() =>
                        setZoomUri(resolveMediaUrl(pendingRequest.receiptUrl || ''))
                      }
                    >
                      <Image
                        source={{ uri: resolveMediaUrl(pendingRequest.receiptUrl) }}
                        style={styles.receipt}
                      />
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.ghostBtn} onPress={cancelPendingRequest}>
                    <Text style={styles.ghostBtnText}>إلغاء الطلب</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {receiptUri ? (
                    <View style={styles.uploadBox}>
                      <TouchableOpacity onPress={() => setZoomUri(receiptUri)}>
                        <Image source={{ uri: receiptUri }} style={styles.receipt} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={pickReceipt}>
                        <Text style={styles.changeText}>تغيير الصورة</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.uploadBox} onPress={pickReceipt}>
                      <Text style={styles.uploadText}>📷 اضغط لرفع سكرين التحويل</Text>
                    </TouchableOpacity>
                  )}

                  <TextInput
                    style={styles.note}
                    placeholder="ملاحظة اختيارية (اسم المحوّل / الوقت)"
                    placeholderTextColor="#777"
                    value={manualNote}
                    onChangeText={setManualNote}
                  />

                  <TouchableOpacity
                    style={[styles.primaryBtn, (!selectedPlan || submitting) && styles.disabled]}
                    onPress={submitManualRequest}
                    disabled={!selectedPlan || submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryBtnText}>إرسال للتفعيل</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.helpBox}>
                <Text style={styles.helpTitle}>مشكلة في الرفع؟</Text>
                <Text style={styles.helpText}>
                  ابعت على واتساب: اسمك + إيميلك + الباقة + سكرين التحويل — وهنفعّلك يدويًا.
                </Text>
                <TouchableOpacity
                  style={styles.whatsappBtn}
                  onPress={() =>
                    openWhatsApp('مشكلة في رفع السكرين داخل التطبيق — مرفق التحويل')
                  }
                >
                  <Text style={styles.whatsappBtnText}>إرسال عبر واتساب</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {latestRequest && latestRequest.status !== 'pending' ? (
            <Text style={styles.latest}>
              آخر طلب: {latestRequest.status}
              {latestRequest.adminNote ? ` · ${latestRequest.adminNote}` : ''}
            </Text>
          ) : null}
        </ScrollView>

        <Modal visible={!!zoomUri} transparent animationType="fade" onRequestClose={() => setZoomUri(null)}>
          <View style={styles.zoomOverlay}>
            <TouchableOpacity style={styles.zoomClose} onPress={() => setZoomUri(null)}>
              <Text style={styles.zoomCloseText}>إغلاق</Text>
            </TouchableOpacity>
            <ScrollView maximumZoomScale={4} minimumZoomScale={1} contentContainerStyle={styles.zoomScroll}>
              {zoomUri ? (
                <Image source={{ uri: zoomUri }} style={styles.zoomImage} resizeMode="contain" />
              ) : null}
            </ScrollView>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: { color: '#E50914', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#aaa', marginTop: 6, fontSize: 14 },
  activeBox: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78,205,196,0.1)',
  },
  activeTitle: { color: '#4ECDC4', fontWeight: '700' },
  activeText: { color: '#fff', marginTop: 4, fontSize: 13 },
  stepCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E50914',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
    fontWeight: '800',
  },
  stepBody: { flex: 1 },
  stepTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  stepDesc: { color: '#aaa', fontSize: 13, lineHeight: 19, marginBottom: 10 },
  plansGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planChip: {
    width: (width - 32 - 28 - 24 - 8) / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  planChipActive: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229,9,20,0.18)',
  },
  planChipPopular: { borderColor: 'rgba(78,205,196,0.5)' },
  popularTag: { color: '#4ECDC4', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  planName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  planPrice: { color: '#E50914', fontSize: 16, fontWeight: '800', marginTop: 4 },
  planDays: { color: '#999', fontSize: 11, marginTop: 2 },
  planDiscount: { color: '#4ECDC4', fontSize: 11, marginTop: 2 },
  selectedHint: { color: '#4ECDC4', fontSize: 12, marginTop: 10, fontWeight: '600' },
  selectedHintMuted: { color: '#777', fontSize: 12, marginTop: 10 },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  payLabel: { color: '#bbb', fontSize: 12 },
  payNumber: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  copyBtn: {
    color: '#4ECDC4',
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginBottom: 10,
  },
  uploadText: { color: '#ccc', fontSize: 14 },
  receipt: { width: '100%', height: 160, resizeMode: 'cover' },
  changeText: { color: '#E50914', fontWeight: '600', paddingVertical: 10 },
  note: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  primaryBtn: {
    backgroundColor: '#E50914',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disabled: { backgroundColor: '#555' },
  helpBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(18,140,126,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(18,140,126,0.35)',
  },
  helpTitle: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  helpText: { color: '#bbb', fontSize: 12, lineHeight: 18, marginBottom: 10 },
  whatsappBtn: {
    backgroundColor: '#128C7E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  whatsappBtnText: { color: '#fff', fontWeight: '700' },
  pendingBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
  },
  pendingTitle: { color: '#4ECDC4', fontWeight: '700', marginBottom: 4 },
  pendingMeta: { color: '#ccc', fontSize: 12, marginBottom: 8 },
  ghostBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ghostBtnText: { color: '#fff', fontWeight: '600' },
  latest: { color: '#777', textAlign: 'center', marginTop: 16, fontSize: 12 },
  zoomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', paddingTop: 48 },
  zoomClose: {
    alignSelf: 'flex-end',
    marginRight: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  zoomCloseText: { color: '#fff', fontWeight: '600' },
  zoomScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 12 },
  zoomImage: { width: width - 24, height: width * 1.3 },
});
