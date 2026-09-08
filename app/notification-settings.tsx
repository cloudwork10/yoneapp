import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from '../components/FixedBackBar';
import NotificationService from '../services/NotificationService';
import { DEFAULT_PRAYER_CITY, fetchPrayerTimes, loadPrayerCity } from '../utils/prayerTimes';

const LANG_KEY = 'yone_notification_settings_lang';

const COPY = {
  en: {
    back: '← Back',
    loading: 'Loading settings...',
    title: 'Notification Settings',
    subtitle: 'Choose which alerts you want to receive',
    deviceId: 'Device ID',
    contentTitle: 'New content alerts',
    contentDesc: 'Get notified when new articles, podcasts, advice, or roadmaps are added',
    testContent: 'Test content notification',
    prayerTitle: 'Prayer time alerts',
    prayerDesc: 'Daily reminders for the five prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)',
    testPrayer: 'Test prayer notification',
    todayPrayers: "Today's prayer times",
    prayers: [
      { key: 'fajr', name: 'Fajr', icon: '🌅' },
      { key: 'dhuhr', name: 'Dhuhr', icon: '☀️' },
      { key: 'asr', name: 'Asr', icon: '🌤️' },
      { key: 'maghrib', name: 'Maghrib', icon: '🌅' },
      { key: 'isha', name: 'Isha', icon: '🌙' },
    ],
    enable: 'Enable notifications',
    refreshPrayer: 'Refresh prayer times',
    clearAll: 'Clear all notifications',
    permTitle: 'Notifications are off',
    permBody: 'Turn on notifications in app settings to receive alerts.',
    permOk: 'OK',
    contentOnTitle: 'Enabled',
    contentOnBody: 'You will get alerts when new content is added.',
    contentOffTitle: 'Disabled',
    contentOffBody: 'New content alerts are turned off.',
    prayerOnTitle: 'Enabled',
    prayerOnBody: 'You will get daily prayer time reminders.',
    prayerOffTitle: 'Disabled',
    prayerOffBody: 'Prayer time alerts are turned off.',
    testContentSent: 'Test content notification sent.',
    testPrayerSent: 'Test prayer notification sent.',
    testSentTitle: 'Sent',
    enableOk: 'Notifications enabled.',
    enableDenied: 'Please enable notifications from your device settings.',
    enableDeniedTitle: 'Permission denied',
    enableOkTitle: 'Enabled',
    prayerUpdated: 'Prayer notification schedule updated.',
    done: 'Done',
    clearTitle: 'Clear notifications?',
    clearBody: 'This will remove all scheduled notifications.',
    cancel: 'Cancel',
    delete: 'Delete',
    cleared: 'All notifications were cleared.',
    testArticleTitle: 'Sample article',
    testArticleAuthor: 'Editor',
    testPrayerPushTitle: 'Dhuhr prayer time',
    testPrayerPushBody: 'It is time for Dhuhr. May Allah bless you.',
  },
  ar: {
    back: '← رجوع',
    loading: 'جاري تحميل الإعدادات...',
    title: 'إعدادات الإشعارات',
    subtitle: 'تحكم في الإشعارات التي تريد استلامها',
    deviceId: 'معرف الجهاز',
    contentTitle: 'إشعارات المحتوى الجديد',
    contentDesc: 'احصل على إشعار عند إضافة مقالات، بودكاست، نصائح، أو خرائط طريق جديدة',
    testContent: 'اختبار إشعار المحتوى',
    prayerTitle: 'إشعارات أوقات الصلاة',
    prayerDesc: 'احصل على تذكير بأوقات الصلاة الخمس يومياً (الفجر، الظهر، العصر، المغرب، العشاء)',
    testPrayer: 'اختبار إشعار الصلاة',
    todayPrayers: 'أوقات الصلاة اليوم',
    prayers: [
      { key: 'fajr', name: 'الفجر', icon: '🌅' },
      { key: 'dhuhr', name: 'الظهر', icon: '☀️' },
      { key: 'asr', name: 'العصر', icon: '🌤️' },
      { key: 'maghrib', name: 'المغرب', icon: '🌅' },
      { key: 'isha', name: 'العشاء', icon: '🌙' },
    ],
    enable: 'تفعيل الإشعارات',
    refreshPrayer: 'تحديث أوقات الصلاة',
    clearAll: 'حذف جميع الإشعارات',
    permTitle: 'الإشعارات غير مفعلة',
    permBody: 'يرجى تفعيل الإشعارات من إعدادات التطبيق لاستلام التنبيهات',
    permOk: 'موافق',
    contentOnTitle: 'تم التفعيل',
    contentOnBody: 'سيتم إرسال إشعارات عند إضافة محتوى جديد',
    contentOffTitle: 'تم الإلغاء',
    contentOffBody: 'لن يتم إرسال إشعارات المحتوى الجديد',
    prayerOnTitle: 'تم التفعيل',
    prayerOnBody: 'سيتم إرسال إشعارات أوقات الصلاة يومياً',
    prayerOffTitle: 'تم الإلغاء',
    prayerOffBody: 'لن يتم إرسال إشعارات أوقات الصلاة',
    testContentSent: 'تم إرسال إشعار تجريبي للمحتوى',
    testPrayerSent: 'تم إرسال إشعار تجريبي للصلاة',
    testSentTitle: 'تم الإرسال',
    enableOk: 'تم تفعيل الإشعارات بنجاح!',
    enableDenied: 'يرجى تفعيل الإشعارات من إعدادات التطبيق',
    enableDeniedTitle: 'تم الرفض',
    enableOkTitle: 'تم التفعيل',
    prayerUpdated: 'تم تحديث جدول إشعارات الصلاة',
    done: 'تم',
    clearTitle: 'تأكيد الحذف',
    clearBody: 'هل تريد حذف جميع الإشعارات المجدولة؟',
    cancel: 'إلغاء',
    delete: 'حذف',
    cleared: 'تم حذف جميع الإشعارات',
    testArticleTitle: 'مقال تجريبي رائع',
    testArticleAuthor: 'المطور',
    testPrayerPushTitle: 'حان وقت صلاة الظهر',
    testPrayerPushBody: 'السلام عليكم، حان الآن وقت صلاة الظهر. بارك الله فيك.',
  },
};

export default function NotificationSettingsScreen() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [contentNotifications, setContentNotifications] = useState(true);
  const [prayerNotifications, setPrayerNotifications] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayPrayerTimes, setTodayPrayerTimes] = useState(DEFAULT_PRAYER_CITY.fallback);

  const t = COPY[lang];

  useEffect(() => {
    loadSettings();
  }, []);

  const switchLang = async (next: 'en' | 'ar') => {
    setLang(next);
    await AsyncStorage.setItem(LANG_KEY, next);
  };

  const loadSettings = async () => {
    try {
      const savedLang = await AsyncStorage.getItem(LANG_KEY);
      const nextLang = savedLang === 'ar' ? 'ar' : 'en';
      setLang(nextLang);
      const copy = COPY[nextLang];

      const token = await NotificationService.registerForPushNotifications();
      const settings = await NotificationService.getNotificationSettings();
      setContentNotifications(settings.contentNotifications);
      setPrayerNotifications(settings.prayerNotifications);
      setPushToken(settings.pushToken);
      const city = await loadPrayerCity();
      setTodayPrayerTimes(await fetchPrayerTimes(city));

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(copy.permTitle, copy.permBody, [{ text: copy.permOk }]);
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
      contentNotifications: value,
    });
    Alert.alert(
      value ? t.contentOnTitle : t.contentOffTitle,
      value ? t.contentOnBody : t.contentOffBody
    );
  };

  const handlePrayerNotificationToggle = async (value: boolean) => {
    setPrayerNotifications(value);
    await NotificationService.updateNotificationSettings({
      prayerNotifications: value,
    });
    Alert.alert(
      value ? t.prayerOnTitle : t.prayerOffTitle,
      value ? t.prayerOnBody : t.prayerOffBody
    );
  };

  const testContentNotification = async () => {
    await NotificationService.sendContentNotification(
      'article',
      t.testArticleTitle,
      t.testArticleAuthor
    );
    Alert.alert(t.testSentTitle, t.testContentSent);
  };

  const testPrayerNotification = async () => {
    await NotificationService.sendLocalNotification({
      title: t.testPrayerPushTitle,
      body: t.testPrayerPushBody,
      data: {
        type: 'prayer',
        prayerName: 'dhuhr',
      },
      priority: 'max',
    });
    Alert.alert(t.testSentTitle, t.testPrayerSent);
  };

  const LangToggle = () => (
    <View style={styles.langToggle}>
      <TouchableOpacity
        style={[styles.langBtn, lang === 'en' && styles.langBtnOn]}
        onPress={() => switchLang('en')}
      >
        <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextOn]}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.langBtn, lang === 'ar' && styles.langBtnOn]}
        onPress={() => switchLang('ar')}
      >
        <Text style={[styles.langBtnText, lang === 'ar' && styles.langBtnTextOn]}>عربي</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <FixedBackBar label={t.back} />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{t.title}</Text>
              <LangToggle />
            </View>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>

          {pushToken ? (
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenTitle}>{t.deviceId}</Text>
              <Text style={styles.tokenText} numberOfLines={2}>
                {pushToken}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📢</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{t.contentTitle}</Text>
                <Text style={styles.sectionDescription}>{t.contentDesc}</Text>
              </View>
              <Switch
                value={contentNotifications}
                onValueChange={handleContentNotificationToggle}
                trackColor={{ false: '#333', true: '#E50914' }}
                thumbColor={contentNotifications ? '#fff' : '#999'}
                ios_backgroundColor="#333"
              />
            </View>

            <TouchableOpacity style={styles.testButton} onPress={testContentNotification}>
              <Text style={styles.testButtonText}>{t.testContent}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🕌</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{t.prayerTitle}</Text>
                <Text style={styles.sectionDescription}>{t.prayerDesc}</Text>
              </View>
              <Switch
                value={prayerNotifications}
                onValueChange={handlePrayerNotificationToggle}
                trackColor={{ false: '#333', true: '#E50914' }}
                thumbColor={prayerNotifications ? '#fff' : '#999'}
                ios_backgroundColor="#333"
              />
            </View>

            <TouchableOpacity style={styles.testButton} onPress={testPrayerNotification}>
              <Text style={styles.testButtonText}>{t.testPrayer}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.todayPrayers}</Text>
            <View style={styles.prayerTimesContainer}>
              {t.prayers.map((prayer) => (
                <View key={prayer.key} style={styles.prayerTimeItem}>
                  <Text style={styles.prayerIcon}>{prayer.icon}</Text>
                  <Text style={styles.prayerName}>{prayer.name}</Text>
                  <Text style={styles.prayerTime}>{todayPrayerTimes[prayer.key]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                  const token = await NotificationService.registerForPushNotifications();
                  setPushToken(token);
                  Alert.alert(t.enableOkTitle, t.enableOk);
                } else {
                  Alert.alert(t.enableDeniedTitle, t.enableDenied);
                }
              }}
            >
              <Text style={styles.actionButtonText}>{t.enable}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={async () => {
                await NotificationService.schedulePrayerNotifications();
                Alert.alert(t.done, t.prayerUpdated);
              }}
            >
              <Text style={styles.actionButtonText}>{t.refreshPrayer}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => {
                Alert.alert(t.clearTitle, t.clearBody, [
                  { text: t.cancel, style: 'cancel' },
                  {
                    text: t.delete,
                    style: 'destructive',
                    onPress: async () => {
                      await NotificationService.cancelAllNotifications();
                      Alert.alert(t.done, t.cleared);
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.actionButtonText}>{t.clearAll}</Text>
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langBtnOn: {
    backgroundColor: '#E50914',
  },
  langBtnText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '700',
  },
  langBtnTextOn: {
    color: '#fff',
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  tokenContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.35)',
  },
  tokenTitle: {
    color: '#E50914',
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
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  testButtonText: {
    color: '#fff',
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
    color: '#E50914',
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
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#E50914',
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  dangerButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
