import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

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

  // Function to calculate prayer times for Cairo, Egypt
  const calculatePrayerTimes = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      // Using Aladhan API for accurate prayer times
      const response = await fetch(
        `http://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=Cairo&country=Egypt&method=5`
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
        // Fallback to calculated times if API fails
        console.log('API failed, using fallback times');
      }
    } catch (error) {
      console.log('Error fetching prayer times:', error);
      // Keep current times as fallback
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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

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
            <View style={styles.locationCard}>
              <Text style={styles.locationText}>📍 القاهرة، مصر</Text>
              <Text style={styles.locationSubtext}>Cairo, Egypt</Text>
            </View>
          </View>
        </ScrollView>
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
  },
});
