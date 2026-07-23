import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import API_BASE_URL from '../config/api';
import { useUser } from '../contexts/UserContext';
import resolveMediaUrl from '../utils/mediaUrl';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type RequestItem = {
  _id: string;
  plan: string;
  price: number;
  status: string;
  receiptUrl: string;
  referenceCode: string;
  userNote?: string;
  adminNote?: string;
  createdAt?: string;
  user?: { _id?: string; name?: string; email?: string };
};

export default function SubscriptionRequestsScreen() {
  const { isAdmin } = useUser();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selected, setSelected] = useState<RequestItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [acting, setActing] = useState(false);
  const [zoomUri, setZoomUri] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/subscription-requests/admin?status=${filter}`
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        Alert.alert('Error', data?.message || 'Failed to load requests');
        return;
      }
      setRequests(data?.data?.requests || []);
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
  }, [filter]);

  const act = async (action: 'approve' | 'reject') => {
    if (!selected) return;
    try {
      setActing(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/subscription-requests/admin/${selected._id}/${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminNote }),
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
          ? data?.data?.pushSent
            ? 'Subscription activated · notification sent ✅'
            : 'Subscription activated (push may need device token — user should open the app once)'
          : 'Request rejected'
      );
      setSelected(null);
      setAdminNote('');
      await load();
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setActing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Subscription Requests</Text>
          <Text style={styles.sub}>Approve manual transfer receipts</Text>
        </View>

        <View style={styles.filters}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={styles.filterText}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => {
                setRefreshing(true);
                load();
              }} tintColor="#E50914" />
            }
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          >
            {requests.length === 0 ? (
              <Text style={styles.empty}>No requests</Text>
            ) : (
              requests.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.card}
                  onPress={() => {
                    setSelected(item);
                    setAdminNote(item.adminNote || '');
                  }}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.name}>{item.user?.name || 'User'}</Text>
                    <Text style={[styles.badge, item.status === 'pending' && styles.badgePending]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.meta}>{item.user?.email}</Text>
                  <Text style={styles.meta}>
                    {item.plan} · EGP {item.price} · {item.referenceCode}
                  </Text>
                  <Text style={styles.meta}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        <Modal
          visible={!!selected}
          animationType="slide"
          transparent
          onRequestClose={() => {
            if (zoomUri) setZoomUri(null);
            else setSelected(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView>
                <Text style={styles.modalTitle}>{selected?.user?.name}</Text>
                <Text style={styles.meta}>{selected?.user?.email}</Text>
                <Text style={styles.meta}>
                  {selected?.plan} · EGP {selected?.price}
                </Text>
                <Text style={styles.meta}>Ref: {selected?.referenceCode}</Text>
                {selected?.userNote ? (
                  <Text style={styles.note}>User note: {selected.userNote}</Text>
                ) : null}
                {selected?.receiptUrl ? (
                  <View style={styles.receiptWrap}>
                    <Pressable
                      onPress={() => setZoomUri(resolveMediaUrl(selected.receiptUrl))}
                    >
                      <Image
                        source={{ uri: resolveMediaUrl(selected.receiptUrl) }}
                        style={styles.receipt}
                        resizeMode="contain"
                      />
                    </Pressable>
                    <TouchableOpacity
                      style={styles.zoomOpenBtn}
                      onPress={() => setZoomUri(resolveMediaUrl(selected.receiptUrl))}
                    >
                      <Text style={styles.zoomOpenBtnText}>
                        Open full size · تكبير الصورة
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <TextInput
                  style={styles.input}
                  placeholder="Admin note (optional)"
                  placeholderTextColor="#777"
                  value={adminNote}
                  onChangeText={setAdminNote}
                />
                {selected?.status === 'pending' ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btn, styles.reject]}
                      disabled={acting}
                      onPress={() => act('reject')}
                    >
                      <Text style={styles.btnText}>{acting ? '...' : 'Reject'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.approve]}
                      disabled={acting}
                      onPress={() => act('approve')}
                    >
                      <Text style={styles.btnText}>{acting ? '...' : 'Activate'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.close}
                  onPress={() => {
                    setZoomUri(null);
                    setSelected(null);
                  }}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Fullscreen zoom inside same modal (nested Modal is unreliable) */}
            {zoomUri ? (
              <View
                style={[
                  styles.zoomOverlay,
                  { paddingTop: Math.max(insets.top, 12) + 4 },
                ]}
              >
                <View style={styles.zoomTopBar}>
                  <View style={styles.zoomTitleBlock}>
                    <Text style={styles.zoomTitle} numberOfLines={1}>
                      Receipt
                    </Text>
                    <Text style={styles.zoomTitleAr} numberOfLines={1}>
                      إيصال التحويل
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.zoomClose}
                    onPress={() => setZoomUri(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.zoomCloseText}>Close</Text>
                    <Text style={styles.zoomCloseTextAr}>إغلاق</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.zoomPinchHint} numberOfLines={1}>
                  Pinch to zoom · قرّب الصورة
                </Text>
                <ScrollView
                  style={styles.zoomScrollView}
                  contentContainerStyle={styles.zoomScroll}
                  maximumZoomScale={6}
                  minimumZoomScale={1}
                  centerContent
                  bouncesZoom
                  showsHorizontalScrollIndicator
                  showsVerticalScrollIndicator
                >
                  <Image
                    source={{ uri: zoomUri }}
                    style={styles.zoomImage}
                    resizeMode="contain"
                  />
                </ScrollView>
              </View>
            ) : null}
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  back: { color: '#E50914', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  sub: { color: '#999', marginTop: 4 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: { borderColor: '#E50914', backgroundColor: 'rgba(229,9,20,0.2)' },
  filterText: { color: '#fff', fontSize: 12, textTransform: 'capitalize' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  badge: { color: '#ccc', fontSize: 12, textTransform: 'uppercase' },
  badgePending: { color: '#4ECDC4', fontWeight: '700' },
  meta: { color: '#aaa', fontSize: 13, marginTop: 4 },
  note: { color: '#ddd', marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    backgroundColor: '#141414',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  receiptWrap: { marginTop: 12 },
  receipt: {
    width: '100%',
    height: 280,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  zoomOpenBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.45)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  zoomOpenBtnText: { color: '#4ECDC4', fontWeight: '700', fontSize: 13 },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    color: '#fff',
    padding: 12,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  approve: { backgroundColor: '#E50914' },
  reject: { backgroundColor: '#444' },
  btnText: { color: '#fff', fontWeight: '700' },
  close: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  closeText: { color: '#aaa' },
  zoomOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 50,
    elevation: 50,
  },
  zoomTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  zoomTitleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  zoomTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  zoomTitleAr: { color: '#999', fontSize: 12, marginTop: 2 },
  zoomClose: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  zoomCloseText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  zoomCloseTextAr: { color: '#bbb', fontSize: 11, marginTop: 1 },
  zoomPinchHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  zoomScrollView: { flex: 1 },
  zoomScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    minHeight: SCREEN_H - 160,
  },
  zoomImage: {
    width: SCREEN_W - 16,
    height: SCREEN_H - 180,
  },
});
