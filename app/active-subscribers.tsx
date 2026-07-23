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
import { useUser } from '../contexts/UserContext';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type Subscriber = {
  _id: string;
  plan: string;
  planName?: string;
  price: number;
  startDate?: string;
  endDate: string;
  remainingDays: number;
  endingSoon?: boolean;
  cancelAtPeriodEnd?: boolean;
  user?: { name?: string; email?: string };
};

export default function ActiveSubscribersScreen() {
  const { isAdmin } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [endingSoonCount, setEndingSoonCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/active-subscribers`
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        Alert.alert('Error', data?.message || 'Failed to load subscribers');
        return;
      }
      setSubscribers(data?.data?.subscribers || []);
      setEndingSoonCount(Number(data?.data?.endingSoonCount || 0));
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#000', '#1a1a1a']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Active Subscribers</Text>
          <Text style={styles.sub}>
            {subscribers.length} active · {endingSoonCount} ending in ≤3 days
          </Text>
          <Text style={styles.subAr}>المتبقي لكل مشترك · تنبيه قبل الانتهاء</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
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
            {subscribers.length === 0 ? (
              <Text style={styles.empty}>No active subscribers</Text>
            ) : (
              subscribers.map((item) => (
                <View
                  key={item._id}
                  style={[styles.card, item.endingSoon && styles.cardSoon]}
                >
                  <View style={styles.row}>
                    <Text style={styles.name}>{item.user?.name || 'User'}</Text>
                    <View
                      style={[
                        styles.daysBadge,
                        item.remainingDays <= 3 && styles.daysBadgeWarn,
                        item.remainingDays <= 0 && styles.daysBadgeDanger,
                      ]}
                    >
                      <Text style={styles.daysText}>
                        {item.remainingDays}d left
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.meta}>{item.user?.email}</Text>
                  <Text style={styles.meta}>
                    {item.planName || item.plan} · EGP {item.price}
                  </Text>
                  <Text style={styles.meta}>
                    Ends {new Date(item.endDate).toLocaleDateString()}
                    {item.startDate
                      ? ` · Started ${new Date(item.startDate).toLocaleDateString()}`
                      : ''}
                  </Text>
                  {item.cancelAtPeriodEnd ? (
                    <Text style={styles.cancelFlag}>
                      Cancelled — access until end date · ملغي للتجديد
                    </Text>
                  ) : null}
                  {item.endingSoon ? (
                    <Text style={styles.soonFlag}>Ending soon · هينتهي قريب</Text>
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
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  sub: { color: '#4ECDC4', marginTop: 6, fontSize: 13 },
  subAr: { color: '#777', marginTop: 2, fontSize: 12 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardSoon: {
    borderColor: 'rgba(229,9,20,0.45)',
    backgroundColor: 'rgba(229,9,20,0.1)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 8 },
  daysBadge: {
    backgroundColor: 'rgba(78,205,196,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysBadgeWarn: { backgroundColor: 'rgba(255,180,0,0.25)' },
  daysBadgeDanger: { backgroundColor: 'rgba(229,9,20,0.35)' },
  daysText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  meta: { color: '#aaa', fontSize: 13, marginTop: 4 },
  cancelFlag: { color: '#FFB84D', marginTop: 8, fontSize: 12, fontWeight: '600' },
  soonFlag: { color: '#FF8A8A', marginTop: 6, fontSize: 12, fontWeight: '600' },
});
