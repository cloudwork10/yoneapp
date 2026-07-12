import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationService from '../services/NotificationService';

export default function NotificationSettingsScreen() {
  const [contentNotifications, setContentNotifications] = useState(true);
  const [prayerNotifications, setPrayerNotifications] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Register for push notifications first
      const token = await NotificationService.registerForPushNotifications();
      console.log('🔔 Push token:', token);
      
      const settings = await NotificationService.getNotificationSettings();
      setContentNotifications(settings.contentNotifications);
      setPrayerNotifications(settings.prayerNotifications);
      setPushToken(settings.pushToken);
      
      // Check notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      console.log('🔔 Notification permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          '⚠️ الإشعارات غير مفعلة',
          'يرجى تفعيل الإشعارات من إعدادات التطبيق لاستلام التنبيهات',
          [
            { text: 'موافق', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentNotificationToggle = async (value: boolean) => {
    setContentNotifications(value);
    await NotificationService.updateNotificationSettings({
      contentNotifications: value
    });
    
    if (value) {
      Alert.alert(
        '✅ تم التفعيل',
        'سيتم إرسال إشعارات عند إضافة محتوى جديد'
      );
    } else {
      Alert.alert(
        '❌ تم الإلغاء',
        'لن يتم إرسال إشعارات المحتوى الجديد'
      );
    }
  };

  const handlePrayerNotificationToggle = async (value: boolean) => {
    setPrayerNotifications(value);
    await NotificationService.updateNotificationSettings({
      prayerNotifications: value
    });
    
    if (value) {
      Alert.alert(
        '🕌 تم التفعيل',
        'سيتم إرسال إشعارات أوقات الصلاة يومياً'
      );
    } else {
      Alert.alert(
        '❌ تم الإلغاء',
        'لن يتم إرسال إشعارات أوقات الصلاة'
      );
    }
  };

  const testContentNotification = async () => {
    await NotificationService.sendContentNotification(
      'article',
      'مقال تجريبي رائع',
      'المطور'
    );
    Alert.alert('✅ تم الإرسال', 'تم إرسال إشعار تجريبي للمحتوى');
  };

  const testPrayerNotification = async () => {
    await NotificationService.sendLocalNotification({
      title: '🕌 حان وقت صلاة الظهر',
      body: 'السلام عليكم، حان الآن وقت صلاة الظهر. بارك الله فيك.',
      data: {
        type: 'prayer',
        prayerName: 'dhuhr'
      },
      priority: 'max'
    });
    Alert.alert('✅ تم الإرسال', 'تم إرسال إشعار تجريبي للصلاة');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🔄 جاري تحميل الإعدادات...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← رجوع</Text>
            </TouchableOpacity>
            <Text style={styles.title}>إعدادات الإشعارات</Text>
            <Text style={styles.subtitle}>تحكم في الإشعارات التي تريد استلامها</Text>
          </View>

          {/* Push Token Info */}
          {pushToken && (
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenTitle}>🔑 معرف الجهاز:</Text>
              <Text style={styles.tokenText} numberOfLines={2}>{pushToken}</Text>
            </View>
          )}

          {/* Content Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📢</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>إشعارات المحتوى الجديد</Text>
                <Text style={styles.sectionDescription}>
                  احصل على إشعار عند إضافة مقالات، بودكاست، نصائح، أو خرائط طريق جديدة
                </Text>
              </View>
              <Switch
                value={contentNotifications}
                onValueChange={handleContentNotificationToggle}
                trackColor={{ false: '#333', true: '#4ECDC4' }}
                thumbColor={contentNotifications ? '#fff' : '#999'}
                ios_backgroundColor="#333"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.testButton}
              onPress={testContentNotification}
            >
              <Text style={styles.testButtonText}>🧪 اختبار إشعار المحتوى</Text>
            </TouchableOpacity>
          </View>

          {/* Prayer Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🕌</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>إشعارات أوقات الصلاة</Text>
                <Text style={styles.sectionDescription}>
                  احصل على تذكير بأوقات الصلاة الخمس يومياً (الفجر، الظهر، العصر، المغرب، العشاء)
                </Text>
              </View>
              <Switch
                value={prayerNotifications}
                onValueChange={handlePrayerNotificationToggle}
                trackColor={{ false: '#333', true: '#4ECDC4' }}
                thumbColor={prayerNotifications ? '#fff' : '#999'}
                ios_backgroundColor="#333"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.testButton}
              onPress={testPrayerNotification}
            >
              <Text style={styles.testButtonText}>🧪 اختبار إشعار الصلاة</Text>
            </TouchableOpacity>
          </View>

          {/* Prayer Times Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕐 أوقات الصلاة اليوم</Text>
            <View style={styles.prayerTimesContainer}>
              {[
                { name: 'الفجر', time: '04:30', icon: '🌅' },
                { name: 'الظهر', time: '12:15', icon: '☀️' },
                { name: 'العصر', time: '15:45', icon: '🌤️' },
                { name: 'المغرب', time: '18:30', icon: '🌅' },
                { name: 'العشاء', time: '20:00', icon: '🌙' },
              ].map((prayer, index) => (
                <View key={index} style={styles.prayerTimeItem}>
                  <Text style={styles.prayerIcon}>{prayer.icon}</Text>
                  <Text style={styles.prayerName}>{prayer.name}</Text>
                  <Text style={styles.prayerTime}>{prayer.time}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                  const token = await NotificationService.registerForPushNotifications();
                  setPushToken(token);
                  Alert.alert('✅ تم التفعيل', 'تم تفعيل الإشعارات بنجاح!');
                } else {
                  Alert.alert('❌ تم الرفض', 'يرجى تفعيل الإشعارات من إعدادات التطبيق');
                }
              }}
            >
              <Text style={styles.actionButtonText}>🔔 تفعيل الإشعارات</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={async () => {
                await NotificationService.schedulePrayerNotifications();
                Alert.alert('✅ تم', 'تم تحديث جدول إشعارات الصلاة');
              }}
            >
              <Text style={styles.actionButtonText}>🔄 تحديث أوقات الصلاة</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={async () => {
                Alert.alert(
                  'تأكيد الحذف',
                  'هل تريد حذف جميع الإشعارات المجدولة؟',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    { 
                      text: 'حذف', 
                      style: 'destructive',
                      onPress: async () => {
                        await NotificationService.cancelAllNotifications();
                        Alert.alert('✅ تم', 'تم حذف جميع الإشعارات');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionButtonText}>🗑️ حذف جميع الإشعارات</Text>
            </TouchableOpacity>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  tokenContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  tokenTitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tokenText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  sectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  testButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  prayerTimesContainer: {
    gap: 12,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  prayerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  prayerName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  prayerTime: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#E50914',
    shadowColor: '#E50914',
  },
  dangerButton: {
    backgroundColor: '#E50914',
    shadowColor: '#E50914',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
