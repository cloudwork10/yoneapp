import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from '../components/FixedBackBar';
import NotificationService from '../services/NotificationService';
import {
  DEFAULT_PRAYER_CITY,
  PRAYER_CITIES,
  fetchPrayerTimes,
  formatClock,
  getZonedParts,
  loadPrayerCity,
  savePrayerCity,
} from '../utils/prayerTimes';

// Configure notifications.
// SDK 54 replaced `shouldShowAlert` with `shouldShowBanner` / `shouldShowList`.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerTimesScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState(DEFAULT_PRAYER_CITY.fallback);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_PRAYER_CITY);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<string[]>([]);
  const cityTimeZone = selectedCountry.tz || 'Africa/Cairo';

  const calculatePrayerTimes = async (city = selectedCountry) => {
    setLoading(true);
    const times = await fetchPrayerTimes(city);
    setPrayerTimes(times);
    setLoading(false);
    return times;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const city = await loadPrayerCity();
      setSelectedCountry(city);
      const times = await calculatePrayerTimes(city);
      if (notificationsEnabled) {
        await NotificationService.schedulePrayerNotifications(times, { force: true });
      }
    };
    bootstrap();
  }, []);

  const prayerNames = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };

  const prayerNamesEn = {
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  };

  // Update current time every second for live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Request notification permissions
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('إشعارات', 'يرجى تفعيل الإشعارات لتلقي تنبيهات الصلاة');
    }
  };


  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await schedulePrayerNotifications();
    } else {
      await cancelAllNotifications();
    }
  };


  const getCurrentPrayer = () => {
    const now = getZonedParts(new Date(), cityTimeZone);
    const currentTimeMinutes = now.hour * 60 + now.minute;

    const prayers = [
      { name: 'fajr', time: prayerTimes.fajr },
      { name: 'dhuhr', time: prayerTimes.dhuhr },
      { name: 'asr', time: prayerTimes.asr },
      { name: 'maghrib', time: prayerTimes.maghrib },
      { name: 'isha', time: prayerTimes.isha }
    ];

    for (let i = 0; i < prayers.length; i++) {
      const [hours, minutes] = prayers[i].time.split(':').map(Number);
      const prayerTimeMinutes = hours * 60 + minutes;
      
      if (currentTimeMinutes < prayerTimeMinutes) {
        return prayers[i];
      }
    }
    
    return prayers[0]; // Next day's Fajr
  };

  // Schedule prayer notifications
  const schedulePrayerNotifications = async () => {
    if (!notificationsEnabled) return;

    try {
      console.log('🕌 Scheduling prayer notifications from prayer-times page...');
      
      // Use the service method instead of duplicating logic
      await NotificationService.schedulePrayerNotifications(prayerTimes, { force: true });
      
      // Update UI to show notifications are scheduled
      const prayers = [
        { name: 'Fajr', time: prayerTimes.fajr, arabic: 'الفجر' },
        { name: 'Dhuhr', time: prayerTimes.dhuhr, arabic: 'الظهر' },
        { name: 'Asr', time: prayerTimes.asr, arabic: 'العصر' },
        { name: 'Maghrib', time: prayerTimes.maghrib, arabic: 'المغرب' },
        { name: 'Isha', time: prayerTimes.isha, arabic: 'العشاء' }
      ];
      
      setScheduledNotifications(prayers.map(prayer => ({
        id: prayer.name,
        title: `تذكير صلاة ${prayer.arabic}`,
        time: prayer.time
      })));
      console.log('Prayer notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  // Cancel all notifications
  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setScheduledNotifications([]);
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  };

  const formatTime = (date: Date) => formatClock(date, cityTimeZone);

  const currentPrayer = getCurrentPrayer();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <FixedBackBar />
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>مواعيد الصلاة</Text>
              <Text style={styles.subtitle}>Prayer Times & Notifications</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={calculatePrayerTimes}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>
                {loading ? '⏳' : '🔄'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Time */}
          <View style={styles.currentTimeSection}>
            <Text style={styles.currentTimeLabel}>الوقت الحالي</Text>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>
              {currentTime.toLocaleDateString('ar-EG', {
                timeZone: cityTimeZone,
                calendar: 'gregory',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Next Prayer */}
          <View style={styles.nextPrayerSection}>
            <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>
            <View style={styles.nextPrayerCard}>
              <Text style={styles.nextPrayerName}>
                {prayerNames[currentPrayer.name as keyof typeof prayerNames]}
              </Text>
              <Text style={styles.nextPrayerTime}>
                {prayerTimes[currentPrayer.name as keyof typeof prayerTimes]}
              </Text>
              <Text style={styles.nextPrayerNameEn}>
                {prayerNamesEn[currentPrayer.name as keyof typeof prayerNamesEn]}
              </Text>
            </View>
          </View>

          {/* Prayer Times List */}
          <View style={styles.prayerTimesSection}>
            <Text style={styles.sectionTitle}>مواعيد الصلاة اليوم</Text>
            {Object.entries(prayerTimes).map(([prayer, time]) => (
              <View key={prayer} style={styles.prayerTimeCard}>
                <View style={styles.prayerInfo}>
                  <Text style={styles.prayerName}>
                    {prayerNames[prayer as keyof typeof prayerNames]}
                  </Text>
                  <Text style={styles.prayerNameEn}>
                    {prayerNamesEn[prayer as keyof typeof prayerNamesEn]}
                  </Text>
                </View>
                <Text style={styles.prayerTime}>{time}</Text>
              </View>
            ))}
          </View>

          {/* Notifications Settings */}
          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>إعدادات الإشعارات</Text>
            <View style={styles.notificationCard}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>تنبيهات الصلاة</Text>
                <Text style={styles.notificationDescription}>
                  استقبل إشعارات عند دخول وقت كل صلاة
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#767577', true: '#E50914' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
            
            {notificationsEnabled && (
              <View style={styles.notificationActions}>
                <TouchableOpacity 
                  style={styles.scheduleButton}
                  onPress={schedulePrayerNotifications}
                >
                  <Text style={styles.scheduleButtonText}>🔄 تحديث الإشعارات</Text>
                </TouchableOpacity>
                
                {scheduledNotifications.length > 0 && (
                  <Text style={styles.notificationStatus}>
                    ✅ تم جدولة {scheduledNotifications.length} إشعار
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Location Info */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>الموقع</Text>
            <TouchableOpacity 
              style={styles.locationCard}
              onPress={() => setCountryModalVisible(true)}
            >
              <Text style={styles.locationText}>📍 {selectedCountry.displayName}</Text>
              <Text style={styles.locationSubtext}>{selectedCountry.name}, {selectedCountry.country}</Text>
              <Text style={styles.changeLocationText}>اضغط لتغيير الموقع</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Country Selector Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={countryModalVisible}
          onRequestClose={() => setCountryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>اختر المدينة</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setCountryModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={PRAYER_CITIES}
                keyExtractor={(item) => `${item.name}-${item.country}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.countryItem,
                      selectedCountry.name === item.name && styles.selectedCountryItem
                    ]}
                    onPress={async () => {
                      setSelectedCountry(item);
                      setCountryModalVisible(false);
                      await savePrayerCity(item);
                      const times = await calculatePrayerTimes(item);
                      if (notificationsEnabled) {
                        await NotificationService.schedulePrayerNotifications(times, { force: true });
                      }
                    }}
                  >
                    <Text style={styles.countryName}>{item.displayName}</Text>
                    <Text style={styles.countryNameEn}>{item.name}, {item.country}</Text>
                  </TouchableOpacity>
                )}
                style={styles.countryList}
              />
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  refreshButtonText: {
    fontSize: 18,
  },
  currentTimeSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  currentTimeLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 10,
  },
  currentDate: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  nextPrayerSection: {
    marginBottom: 30,
  },
  nextPrayerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  nextPrayerCard: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  nextPrayerTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  nextPrayerNameEn: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  prayerTimesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  prayerTimeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  prayerNameEn: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
  },
  notificationsSection: {
    marginBottom: 30,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  notificationActions: {
    marginTop: 15,
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationStatus: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
  },
  locationSection: {
    marginBottom: 30,
  },
  locationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  changeLocationText: {
    fontSize: 12,
    color: '#E50914',
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedCountryItem: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  countryNameEn: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
