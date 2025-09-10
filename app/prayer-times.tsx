import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerTimesScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: '05:15',
    dhuhr: '12:55',
    asr: '16:25',
    maghrib: '19:10',
    isha: '20:40'
  });
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Cairo',
    country: 'Egypt',
    displayName: 'القاهرة، مصر'
  });
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Arab countries and cities with fallback prayer times
  const arabCountries = [
    { name: 'Cairo', country: 'Egypt', displayName: 'القاهرة، مصر', fallback: { fajr: '05:15', dhuhr: '12:55', asr: '16:25', maghrib: '19:10', isha: '20:40' } },
    { name: 'Riyadh', country: 'Saudi Arabia', displayName: 'الرياض، السعودية', fallback: { fajr: '04:45', dhuhr: '12:15', asr: '15:45', maghrib: '18:30', isha: '20:00' } },
    { name: 'Dubai', country: 'UAE', displayName: 'دبي، الإمارات', fallback: { fajr: '05:00', dhuhr: '12:30', asr: '16:00', maghrib: '18:45', isha: '20:15' } },
    { name: 'Kuwait City', country: 'Kuwait', displayName: 'الكويت، الكويت', fallback: { fajr: '04:50', dhuhr: '12:20', asr: '15:50', maghrib: '18:35', isha: '20:05' } },
    { name: 'Doha', country: 'Qatar', displayName: 'الدوحة، قطر', fallback: { fajr: '04:55', dhuhr: '12:25', asr: '15:55', maghrib: '18:40', isha: '20:10' } },
    { name: 'Manama', country: 'Bahrain', displayName: 'المنامة، البحرين', fallback: { fajr: '04:50', dhuhr: '12:20', asr: '15:50', maghrib: '18:35', isha: '20:05' } },
    { name: 'Amman', country: 'Jordan', displayName: 'عمان، الأردن', fallback: { fajr: '05:20', dhuhr: '12:50', asr: '16:20', maghrib: '19:05', isha: '20:35' } },
    { name: 'Beirut', country: 'Lebanon', displayName: 'بيروت، لبنان', fallback: { fajr: '05:25', dhuhr: '12:55', asr: '16:25', maghrib: '19:10', isha: '20:40' } },
    { name: 'Damascus', country: 'Syria', displayName: 'دمشق، سوريا', fallback: { fajr: '05:20', dhuhr: '12:50', asr: '16:20', maghrib: '19:05', isha: '20:35' } },
    { name: 'Baghdad', country: 'Iraq', displayName: 'بغداد، العراق', fallback: { fajr: '05:00', dhuhr: '12:30', asr: '16:00', maghrib: '18:45', isha: '20:15' } },
    { name: 'Tunis', country: 'Tunisia', displayName: 'تونس، تونس', fallback: { fajr: '05:30', dhuhr: '13:00', asr: '16:30', maghrib: '19:15', isha: '20:45' } },
    { name: 'Algiers', country: 'Algeria', displayName: 'الجزائر، الجزائر', fallback: { fajr: '05:35', dhuhr: '13:05', asr: '16:35', maghrib: '19:20', isha: '20:50' } },
    { name: 'Rabat', country: 'Morocco', displayName: 'الرباط، المغرب', fallback: { fajr: '05:40', dhuhr: '13:10', asr: '16:40', maghrib: '19:25', isha: '20:55' } },
    { name: 'Tripoli', country: 'Libya', displayName: 'طرابلس، ليبيا', fallback: { fajr: '05:25', dhuhr: '12:55', asr: '16:25', maghrib: '19:10', isha: '20:40' } },
    { name: 'Khartoum', country: 'Sudan', displayName: 'الخرطوم، السودان', fallback: { fajr: '05:10', dhuhr: '12:40', asr: '16:10', maghrib: '18:55', isha: '20:25' } },
    { name: 'Sanaa', country: 'Yemen', displayName: 'صنعاء، اليمن', fallback: { fajr: '05:00', dhuhr: '12:30', asr: '16:00', maghrib: '18:45', isha: '20:15' } },
    { name: 'Muscat', country: 'Oman', displayName: 'مسقط، عمان', fallback: { fajr: '05:05', dhuhr: '12:35', asr: '16:05', maghrib: '18:50', isha: '20:20' } },
    { name: 'Jerusalem', country: 'Palestine', displayName: 'القدس، فلسطين', fallback: { fajr: '05:20', dhuhr: '12:50', asr: '16:20', maghrib: '19:05', isha: '20:35' } }
  ];

  // Function to calculate prayer times for selected city
  const calculatePrayerTimes = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      // Using Aladhan API for accurate prayer times
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=${selectedCountry.name}&country=${selectedCountry.country}&method=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        const timings = data.data.timings;
        
        setPrayerTimes({
          fajr: timings.Fajr,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha
        });
      } else {
        // Use fallback times for the selected country
        const selectedCountryData = arabCountries.find(country => 
          country.name === selectedCountry.name && country.country === selectedCountry.country
        );
        if (selectedCountryData && selectedCountryData.fallback) {
          setPrayerTimes(selectedCountryData.fallback);
        }
        console.log('API failed, using fallback times for', selectedCountry.displayName);
      }
    } catch (error) {
      console.log('Error fetching prayer times:', error);
      // Use fallback times for the selected country
      const selectedCountryData = arabCountries.find(country => 
        country.name === selectedCountry.name && country.country === selectedCountry.country
      );
      if (selectedCountryData && selectedCountryData.fallback) {
        setPrayerTimes(selectedCountryData.fallback);
      }
    }
    setLoading(false);
  };

  // Load prayer times on component mount
  useEffect(() => {
    calculatePrayerTimes();
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

  // Reload prayer times when country changes
  useEffect(() => {
    calculatePrayerTimes();
  }, [selectedCountry]);

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

  const schedulePrayerNotifications = async () => {
    if (!notificationsEnabled) return;

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule notifications for each prayer
    Object.entries(prayerTimes).forEach(([prayer, time]) => {
      const [hours, minutes] = time.split(':').map(Number);
      const triggerDate = new Date();
      triggerDate.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (triggerDate <= new Date()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      Notifications.scheduleNotificationAsync({
        content: {
          title: `وقت صلاة ${prayerNames[prayer as keyof typeof prayerNames]}`,
          body: `حان وقت صلاة ${prayerNames[prayer as keyof typeof prayerNames]} - ${time}`,
          sound: true,
        },
        trigger: triggerDate,
      });
    });

    Alert.alert('تم', 'تم جدولة إشعارات الصلاة بنجاح');
  };

  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      schedulePrayerNotifications();
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const getCurrentPrayer = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const currentPrayer = getCurrentPrayer();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
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
                data={arabCountries}
                keyExtractor={(item) => `${item.name}-${item.country}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.countryItem,
                      selectedCountry.name === item.name && styles.selectedCountryItem
                    ]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setCountryModalVisible(false);
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
