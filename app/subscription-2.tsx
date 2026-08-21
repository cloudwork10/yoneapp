import {
  INSTAPAY_NUMBER,
  VODAFONE_CASH_NUMBER,
  whatsappWaMeNumber,
} from '@/config/legal';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
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
import { PAID_FLOW_ENABLED, planLabel } from '../utils/subscriptionAccess';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

const { width } = Dimensions.get('window');

function Dual({
  en,
  ar,
  enStyle,
  arStyle,
}: {
  en: string;
  ar: string;
  enStyle?: any;
  arStyle?: any;
}) {
  return (
    <View style={{ marginBottom: 2 }}>
      <Text style={enStyle}>{en}</Text>
      <Text style={arStyle}>{ar}</Text>
    </View>
  );
}

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

  // Last line of defence: this screen shows external payment methods, which
  // App Store 3.1.1/3.1.3(a) forbid. Nothing on iOS should route here, but if
  // anything does (deep link, stale nav state), bounce out before rendering.
  useEffect(() => {
    if (!PAID_FLOW_ENABLED) {
      router.replace('/(tabs)/more');
    }
  }, []);

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
  const [refreshingStatus, setRefreshingStatus] = useState(false);

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

  const cancelSubscription = () => {
    if (!currentSubscription) return;
    Alert.alert(
      'Cancel subscription?',
      `You keep access until ${new Date(currentSubscription.endDate).toLocaleDateString()}. Content locks after that.\n\nهتفضل فاتح لحد تاريخ الانتهاء، وبعدين المحتوى يتقفل.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Confirm cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(
                `${API_BASE_URL}/api/payments/subscription/cancel`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                Alert.alert('Error', data?.message || 'Could not cancel');
                return;
              }
              setCurrentSubscription(data?.data?.subscription || {
                ...currentSubscription,
                cancelAtPeriodEnd: true,
              });
              Alert.alert('Done', 'Cancelled — access until end date\nتم الإلغاء — الدخول لحد نهاية المدة');
            } catch {
              Alert.alert('Error', 'Network error');
            }
          },
        },
      ]
    );
  };

  const fetchManualRequest = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/subscription-requests/mine`
      );
      if (!response.ok) return;
      const data = await response.json();
      const pending = data?.data?.pending || null;
      setPendingRequest(pending);
      setLatestRequest(data?.data?.latest || null);
      if (pending?.plan) setSelectedPlan(pending.plan);
    } catch {
      // ignore
    }
  };

  const refreshStatus = useCallback(async () => {
    setRefreshingStatus(true);
    try {
      await Promise.all([fetchCurrentSubscription(), fetchManualRequest()]);
    } finally {
      setRefreshingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus])
  );

  const buildWhatsAppMessage = () =>
    [
      'ELNADY subscription request',
      `Name: ${user?.name || ''}`,
      `Email: ${user?.email || ''}`,
      `User ID: ${user?.id || ''}`,
      `Plan: ${selected?.name || selectedPlan || ''}`,
      `Amount: EGP ${selected?.price ?? ''}`,
      'Transfer screenshot attached',
    ].join('\n');

  const openWhatsApp = async (extraNote?: string) => {
    const text = extraNote ? `${buildWhatsAppMessage()}\n\n${extraNote}` : buildWhatsAppMessage();
    const url = `https://wa.me/${whatsappWaMeNumber()}?text=${encodeURIComponent(text)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('WhatsApp', 'Could not open WhatsApp\nتعذر فتح واتساب');
    }
  };

  const showWhatsAppFallback = (reason: string) => {
    Alert.alert(
      'Upload issue',
      `${reason}\n\nSend the screenshot on WhatsApp and we will activate your plan.\nلو في مشكلة، ابعت السكرين على واتساب.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open WhatsApp', onPress: () => openWhatsApp(`Issue: ${reason}`) },
      ]
    );
  };

  const copyNumber = (label: string, number: string) => {
    Clipboard.setString(number);
    Alert.alert('Copied', `${label}: ${number}\nتم النسخ`);
  };

  const pickReceipt = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const uri = asset.uri || (asset as any).localUri;
      if (!uri) {
        showWhatsAppFallback('Could not read the image');
        return;
      }
      setReceiptUri(uri);
    } catch {
      showWhatsAppFallback('Could not open photo library');
    }
  };

  const submitManualRequest = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please log in first\nسجّل دخول أولاً');
      router.push('/login');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Select a plan', 'Choose a plan above\nاختَر باقة أولاً');
      return;
    }
    if (!receiptUri) {
      Alert.alert(
        'Screenshot required',
        'Upload your transfer screenshot, or send it on WhatsApp.\nارفع السكرين أو ابعتها واتساب.'
      );
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
            ? 'Service is updating — please use WhatsApp for now'
            : `Upload failed (${response.status})`);
        showWhatsAppFallback(msg);
        return;
      }

      setReceiptUri(null);
      setManualNote('');
      await fetchManualRequest();
      Alert.alert(
        'Request sent',
        `Reference: ${data?.data?.request?.referenceCode || '—'}\nWe will review and activate soon.\nتم الإرسال · هنراجع ونفعّل قريب.`
      );
    } catch {
      showWhatsAppFallback('Network error while uploading');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelPendingRequest = async () => {
    if (!pendingRequest?._id) return;
    Alert.alert('Cancel request?', 'You can submit again later.\nتقدر تبعت طلب جديد بعدين.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel',
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
            <Dual
              en="Premium Subscription"
              ar="الاشتراك المميز"
              enStyle={styles.title}
              arStyle={styles.titleAr}
            />
            <Dual
              en="3 simple steps · transfer, upload screenshot, get activated"
              ar="٣ خطوات · حوّل · ارفع السكرين · يتم التفعيل"
              enStyle={styles.subtitle}
              arStyle={styles.subtitleAr}
            />
          </View>

          {/* Live request status — user can reopen this screen anytime */}
          {pendingRequest ? (
            <View style={styles.statusBannerPending}>
              <Dual
                en="Status: Pending review"
                ar="الحالة: قيد المراجعة"
                enStyle={styles.statusBannerTitle}
                arStyle={styles.statusBannerTitleAr}
              />
              <Text style={styles.statusBannerBody}>
                You chose {planLabel(pendingRequest.plan).en} · EGP {pendingRequest.price}
              </Text>
              <Text style={styles.statusBannerBodyAr}>
                اخترت {planLabel(pendingRequest.plan).ar} · {pendingRequest.price} ج
              </Text>
              <Text style={styles.statusBannerHint}>
                Premium courses stay locked until admin activates your plan.
              </Text>
              <Text style={styles.statusBannerHintAr}>
                الكورسات المميزة هتفضل مقفولة لحد ما يتم التفعيل.
              </Text>
              <TouchableOpacity style={styles.refreshStatusBtn} onPress={refreshStatus}>
                <Text style={styles.refreshStatusBtnText}>
                  {refreshingStatus ? 'Checking…' : 'Refresh status · تحديث الحالة'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!pendingRequest && latestRequest?.status === 'rejected' ? (
            <View style={styles.statusBannerRejected}>
              <Dual
                en="Status: Not approved"
                ar="الحالة: مرفوض"
                enStyle={styles.statusBannerTitle}
                arStyle={styles.statusBannerTitleAr}
              />
              <Text style={styles.statusBannerBody}>
                Last request ({planLabel(latestRequest.plan).en}) was rejected.
                {latestRequest.adminNote ? `\n${latestRequest.adminNote}` : ''}
              </Text>
              <Text style={styles.statusBannerBodyAr}>
                آخر طلب ({planLabel(latestRequest.plan).ar}) اترفض.
                {latestRequest.adminNote ? `\n${latestRequest.adminNote}` : ''}
              </Text>
              <Text style={styles.statusBannerHint}>
                You can submit a new request below.
              </Text>
            </View>
          ) : null}

          {!pendingRequest && latestRequest?.status === 'approved' && !currentSubscription ? (
            <View style={styles.statusBannerPending}>
              <Dual
                en="Status: Approved"
                ar="الحالة: تم القبول"
                enStyle={styles.statusBannerTitle}
                arStyle={styles.statusBannerTitleAr}
              />
              <TouchableOpacity style={styles.refreshStatusBtn} onPress={refreshStatus}>
                <Text style={styles.refreshStatusBtnText}>
                  Refresh · تحديث
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {currentSubscription ? (
            <View style={styles.activeBox}>
              <Dual
                en="Your subscription is active"
                ar="اشتراكك الحالي نشط"
                enStyle={styles.activeTitle}
                arStyle={styles.activeTitleAr}
              />
              <Text style={styles.activeText}>
                {planLabel(currentSubscription.plan).en} · until{' '}
                {new Date(currentSubscription.endDate).toLocaleDateString()}
              </Text>
              <Text style={styles.activeDays}>
                {typeof currentSubscription.remainingDays === 'number'
                  ? `${currentSubscription.remainingDays} days left · متبقي ${currentSubscription.remainingDays} يوم`
                  : planLabel(currentSubscription.plan).ar}
              </Text>
              {currentSubscription.cancelAtPeriodEnd ? (
                <Text style={styles.cancelPending}>
                  Cancelled — access until end date · ملغي، الدخول لحد النهاية
                </Text>
              ) : (
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelSubscription}>
                  <Text style={styles.cancelBtnText}>Cancel subscription · إلغاء الاشتراك</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* STEP 1 */}
          <View style={styles.stepCard}>
            <Text style={styles.stepBadge}>1</Text>
            <View style={styles.stepBody}>
              <Dual
                en="Choose your plan"
                ar="اختَر الباقة"
                enStyle={styles.stepTitle}
                arStyle={styles.stepTitleAr}
              />
              <Dual
                en="Any plan = full access to everything (courses · club · premium content)"
                ar="أي باقة = وصول كامل لكل المحتوى"
                enStyle={styles.accessNote}
                arStyle={styles.accessNoteAr}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansRow}
              >
                {plans.map((plan) => {
                  const active = selectedPlan === plan.id;
                  const popular = plan.id === 'quarterly';
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCardH,
                        active && styles.planCardHActive,
                        popular && styles.planCardHPopular,
                      ]}
                      onPress={() => setSelectedPlan(plan.id)}
                      disabled={!!pendingRequest}
                    >
                      {popular ? <Text style={styles.popularTag}>Popular</Text> : null}
                      <Text style={styles.planName}>
                        {plan.name.replace(' Plan', '')}
                      </Text>
                      <Text style={styles.planPrice}>EGP {plan.price}</Text>
                      <Text style={styles.planDays}>{plan.duration} days</Text>
                      {plan.discount > 0 ? (
                        <Text style={styles.planDiscount}>-{plan.discount}%</Text>
                      ) : (
                        <Text style={styles.planDiscountSpacer}> </Text>
                      )}
                      <Text style={styles.planAccess}>Full access ✓</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {selected ? (
                <Text style={styles.selectedHint}>
                  Selected: {selected.name} · EGP {selected.price} · Full access
                </Text>
              ) : (
                <Text style={styles.selectedHintMuted}>
                  Swipe and pick a plan · اسحب واختَر باقة
                </Text>
              )}
            </View>
          </View>

          {/* STEP 2 */}
          <View style={styles.stepCard}>
            <Text style={styles.stepBadge}>2</Text>
            <View style={styles.stepBody}>
              <Dual
                en="Transfer the amount"
                ar="حوّل المبلغ"
                enStyle={styles.stepTitle}
                arStyle={styles.stepTitleAr}
              />
              <Dual
                en="Transfer to one of these numbers, then save the receipt screenshot."
                ar="حوّل على أحد الرقمين واحفظ سكرين التحويل."
                enStyle={styles.stepDesc}
                arStyle={styles.stepDescAr}
              />

              <View style={styles.payCard}>
                <Dual
                  en="Vodafone Cash"
                  ar="فودافون كاش"
                  enStyle={styles.payCardLabel}
                  arStyle={styles.payCardLabelAr}
                />
                <View style={styles.payCardInner}>
                  <Text style={styles.payNumber}>{VODAFONE_CASH_NUMBER}</Text>
                  <TouchableOpacity
                    style={styles.copyPill}
                    onPress={() => copyNumber('Vodafone Cash', VODAFONE_CASH_NUMBER)}
                  >
                    <Text style={styles.copyPillText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.payCard}>
                <Text style={styles.payCardLabel}>InstaPay</Text>
                <View style={styles.payCardInner}>
                  <Text style={styles.payNumber}>{INSTAPAY_NUMBER}</Text>
                  <TouchableOpacity
                    style={styles.copyPill}
                    onPress={() => copyNumber('InstaPay', INSTAPAY_NUMBER)}
                  >
                    <Text style={styles.copyPillText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* STEP 3 */}
          <View style={styles.stepCard}>
            <Text style={styles.stepBadge}>3</Text>
            <View style={styles.stepBody}>
              <Dual
                en="Upload screenshot to activate"
                ar="ارفع السكرين للتفعيل"
                enStyle={styles.stepTitle}
                arStyle={styles.stepTitleAr}
              />
              <Dual
                en="If upload fails in the app, send the same screenshot on WhatsApp."
                ar="لو الرفع فشل، ابعت السكرين على واتساب."
                enStyle={styles.stepDesc}
                arStyle={styles.stepDescAr}
              />

              {pendingRequest ? (
                <View style={styles.pendingBox}>
                  <Dual
                    en="Request pending review"
                    ar="طلبك قيد المراجعة"
                    enStyle={styles.pendingTitle}
                    arStyle={styles.pendingTitleAr}
                  />
                  <View style={styles.pendingPlanBox}>
                    <Text style={styles.pendingPlanLabel}>
                      You selected · الباقة اللي اخترتها
                    </Text>
                    <Text style={styles.pendingPlanName}>
                      {planLabel(pendingRequest.plan).en}
                    </Text>
                    <Text style={styles.pendingPlanNameAr}>
                      {planLabel(pendingRequest.plan).ar}
                    </Text>
                    <Text style={styles.pendingPlanMeta}>
                      EGP {pendingRequest.price}
                      {planLabel(pendingRequest.plan).days
                        ? ` · ${planLabel(pendingRequest.plan).days} days`
                        : ''}{' '}
                      · Full access
                    </Text>
                  </View>
                  <Text style={styles.pendingMeta}>
                    Ref: {pendingRequest.referenceCode}
                  </Text>
                  {pendingRequest.receiptUrl ? (
                    <Pressable
                      onPress={() =>
                        setZoomUri(resolveMediaUrl(pendingRequest.receiptUrl || ''))
                      }
                    >
                      <Image
                        source={{ uri: resolveMediaUrl(pendingRequest.receiptUrl) }}
                        style={styles.receipt}
                        resizeMode="contain"
                      />
                      <Text style={styles.openImageBtn}>Open image · فتح الصورة</Text>
                    </Pressable>
                  ) : null}
                  <TouchableOpacity style={styles.ghostBtn} onPress={cancelPendingRequest}>
                    <Text style={styles.ghostBtnText}>Cancel request · إلغاء الطلب</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {receiptUri ? (
                    <View style={styles.uploadBoxFilled}>
                      <Text style={styles.uploadedOk}>✓ Screenshot selected · تم اختيار السكرين</Text>
                      <Pressable
                        style={styles.previewTap}
                        onPress={() => setZoomUri(receiptUri)}
                      >
                        <Image
                          source={{ uri: receiptUri }}
                          style={styles.receipt}
                          resizeMode="contain"
                        />
                        <View style={styles.openImageOverlay}>
                          <Text style={styles.openImageBtn}>Open image</Text>
                        </View>
                      </Pressable>
                      <TouchableOpacity
                        style={styles.openImageFullBtn}
                        onPress={() => setZoomUri(receiptUri)}
                      >
                        <Text style={styles.openImageFullBtnText}>
                          Tap to open full size · اضغط لفتح الصورة
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={pickReceipt}>
                        <Text style={styles.changeText}>Change image · تغيير الصورة</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.uploadBox} onPress={pickReceipt}>
                      <Text style={styles.uploadText}>
                        📷 Tap to upload transfer screenshot
                      </Text>
                      <Text style={styles.uploadTextAr}>اضغط لرفع سكرين التحويل</Text>
                    </TouchableOpacity>
                  )}

                  <TextInput
                    style={styles.note}
                    placeholder="Optional note (sender name / time) · ملاحظة اختيارية"
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
                      <>
                        <Text style={styles.primaryBtnText}>Submit for activation</Text>
                        <Text style={styles.primaryBtnTextAr}>إرسال للتفعيل</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.helpBox}>
                <Dual
                  en="Upload problem?"
                  ar="مشكلة في الرفع؟"
                  enStyle={styles.helpTitle}
                  arStyle={styles.helpTitleAr}
                />
                <Dual
                  en="Send on WhatsApp: your name + email + plan + transfer screenshot — we will activate your access."
                  ar="ابعت واتساب: الاسم + الإيميل + الباقة + السكرين — وهنفعّل الاشتراك."
                  enStyle={styles.helpText}
                  arStyle={styles.helpTextAr}
                />
                <TouchableOpacity
                  style={styles.whatsappBtn}
                  onPress={() =>
                    openWhatsApp('Upload issue in the app — transfer screenshot attached')
                  }
                >
                  <Text style={styles.whatsappBtnText}>Send via WhatsApp</Text>
                  <Text style={styles.whatsappBtnTextAr}>إرسال عبر واتساب</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {latestRequest &&
          latestRequest.status !== 'pending' &&
          latestRequest.status !== 'rejected' &&
          latestRequest.status !== 'approved' ? (
            <Text style={styles.latest}>
              Last request: {latestRequest.status}
              {latestRequest.adminNote ? ` · ${latestRequest.adminNote}` : ''}
            </Text>
          ) : null}
        </ScrollView>

        <Modal
          visible={!!zoomUri}
          transparent
          animationType="fade"
          onRequestClose={() => setZoomUri(null)}
        >
          <View style={styles.zoomOverlay}>
            <Pressable style={styles.zoomClose} onPress={() => setZoomUri(null)}>
              <Text style={styles.zoomCloseText}>Close · إغلاق</Text>
            </Pressable>
            <ScrollView
              style={{ flex: 1 }}
              maximumZoomScale={5}
              minimumZoomScale={1}
              centerContent
              contentContainerStyle={styles.zoomScroll}
            >
              {zoomUri ? (
                <Image
                  source={{ uri: zoomUri }}
                  style={styles.zoomImage}
                  resizeMode="contain"
                />
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
  titleAr: { color: '#999', fontSize: 14, marginTop: 2 },
  subtitle: { color: '#aaa', marginTop: 8, fontSize: 14, lineHeight: 20 },
  subtitleAr: { color: '#777', fontSize: 12, marginTop: 2, lineHeight: 18 },
  activeBox: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.45)',
    backgroundColor: 'rgba(78, 205, 196, 0.12)',
  },
  statusBannerPending: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.5)',
    backgroundColor: 'rgba(78, 205, 196, 0.12)',
  },
  statusBannerRejected: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.55)',
    backgroundColor: 'rgba(229, 9, 20, 0.14)',
  },
  statusBannerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statusBannerTitleAr: { color: '#aaa', fontSize: 12, marginTop: 2, marginBottom: 8 },
  statusBannerBody: { color: '#eee', fontSize: 13, lineHeight: 19 },
  statusBannerBodyAr: { color: '#4ECDC4', fontSize: 12, marginTop: 4, lineHeight: 18 },
  statusBannerHint: { color: '#999', fontSize: 12, marginTop: 8, lineHeight: 17 },
  statusBannerHintAr: { color: '#777', fontSize: 11, marginTop: 2, lineHeight: 16 },
  refreshStatusBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  refreshStatusBtnText: { color: '#4ECDC4', fontWeight: '700', fontSize: 12 },
  activeTitle: { color: '#4ECDC4', fontWeight: '700' },
  activeTitleAr: { color: '#6fd9d0', fontSize: 12, marginTop: 2 },
  activeText: { color: '#fff', marginTop: 4, fontSize: 13 },
  activeDays: { color: '#ccc', marginTop: 6, fontSize: 13, fontWeight: '600' },
  cancelPending: { color: '#FFB84D', marginTop: 8, fontSize: 12, fontWeight: '600' },
  cancelBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cancelBtnText: { color: '#FF8A8A', fontWeight: '600', fontSize: 12 },
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
  stepTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  stepTitleAr: { color: '#999', fontSize: 12, marginTop: 2, marginBottom: 6 },
  stepDesc: { color: '#aaa', fontSize: 13, lineHeight: 19 },
  stepDescAr: { color: '#777', fontSize: 11, lineHeight: 17, marginBottom: 10 },
  accessNote: {
    color: '#4ECDC4',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  accessNoteAr: {
    color: '#6fd9d0',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  plansRow: {
    paddingVertical: 4,
    paddingRight: 8,
    gap: 10,
  },
  planCardH: {
    width: 128,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 2,
  },
  planCardHActive: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229,9,20,0.2)',
  },
  planCardHPopular: {
    borderColor: 'rgba(78,205,196,0.55)',
  },
  popularTag: { color: '#4ECDC4', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  planName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  planPrice: { color: '#E50914', fontSize: 17, fontWeight: '800', marginTop: 6 },
  planDays: { color: '#999', fontSize: 11, marginTop: 3 },
  planDiscount: { color: '#4ECDC4', fontSize: 11, marginTop: 3, fontWeight: '600' },
  planDiscountSpacer: { fontSize: 11, marginTop: 3 },
  planAccess: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.85,
  },
  selectedHint: { color: '#4ECDC4', fontSize: 12, marginTop: 10, fontWeight: '600' },
  selectedHintMuted: { color: '#777', fontSize: 12, marginTop: 10 },
  payCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.35)',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 14,
    marginBottom: 10,
  },
  payCardLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
  },
  payCardLabelAr: {
    color: '#777',
    fontSize: 11,
    marginBottom: 8,
  },
  payCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  payNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  copyPill: {
    backgroundColor: 'rgba(78,205,196,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.5)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  copyPillText: { color: '#4ECDC4', fontWeight: '800', fontSize: 13 },
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
  uploadBoxFilled: {
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.45)',
    borderRadius: 12,
    backgroundColor: 'rgba(78,205,196,0.08)',
    marginBottom: 10,
    paddingTop: 10,
    overflow: 'hidden',
  },
  uploadedOk: {
    color: '#4ECDC4',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 13,
  },
  previewTap: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#111',
    position: 'relative',
  },
  openImageOverlay: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  openImageBtn: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  openImageFullBtn: {
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  openImageFullBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  uploadText: { color: '#ccc', fontSize: 14, textAlign: 'center' },
  uploadTextAr: { color: '#888', fontSize: 12, marginTop: 4, textAlign: 'center' },
  receipt: {
    width: width - 32 - 28 - 24 - 2,
    height: 200,
    backgroundColor: '#1a1a1a',
  },
  changeText: { color: '#E50914', fontWeight: '600', paddingVertical: 10, textAlign: 'center' },
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  primaryBtnTextAr: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  disabled: { backgroundColor: '#555' },
  helpBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(18,140,126,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(18,140,126,0.35)',
  },
  helpTitle: { color: '#fff', fontWeight: '700' },
  helpTitleAr: { color: '#aaa', fontSize: 11, marginTop: 2, marginBottom: 4 },
  helpText: { color: '#bbb', fontSize: 12, lineHeight: 18 },
  helpTextAr: { color: '#888', fontSize: 11, lineHeight: 16, marginBottom: 10 },
  whatsappBtn: {
    backgroundColor: '#128C7E',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  whatsappBtnText: { color: '#fff', fontWeight: '700' },
  whatsappBtnTextAr: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  pendingBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
  },
  pendingTitle: { color: '#4ECDC4', fontWeight: '700' },
  pendingTitleAr: { color: '#6fd9d0', fontSize: 11, marginTop: 2, marginBottom: 4 },
  pendingPlanBox: {
    marginTop: 8,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.45)',
  },
  pendingPlanLabel: { color: '#aaa', fontSize: 11, marginBottom: 4 },
  pendingPlanName: { color: '#fff', fontSize: 17, fontWeight: '800' },
  pendingPlanNameAr: { color: '#4ECDC4', fontSize: 13, fontWeight: '600', marginTop: 2 },
  pendingPlanMeta: { color: '#ccc', fontSize: 12, marginTop: 6 },
  pendingMeta: { color: '#888', fontSize: 12, marginBottom: 8 },
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
  zoomImage: { width: width - 16, height: Math.round(width * 1.55), backgroundColor: '#000' },
});
