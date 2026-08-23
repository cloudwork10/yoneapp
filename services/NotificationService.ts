import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import API_BASE_URL from '../config/api';

// Configure notification behavior.
// SDK 54 deprecated `shouldShowAlert` in favour of `shouldShowBanner` (the
// heads-up alert) and `shouldShowList` (the notification centre entry).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
  sound?: 'default' | 'custom';
  vibrate?: boolean;
  priority?: 'default' | 'high' | 'max';
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      if (!projectId) {
        console.log('Project ID not found');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expoPushToken', token.data);
      
      console.log('✅ Push token registered:', token.data);
      await this.syncPushTokenToServer(token.data);
      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /** Persist Expo push token on the user so admin/server can notify them */
  async syncPushTokenToServer(token?: string | null): Promise<boolean> {
    try {
      const pushToken = token || this.expoPushToken || (await this.getPushToken());
      if (!pushToken) return false;

      const authToken = await AsyncStorage.getItem('token');
      if (!authToken) return false;

      const API_BASE_URL = (await import('../config/api')).default;
      const response = await fetch(`${API_BASE_URL}/api/users/push-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pushToken }),
      });
      if (!response.ok) {
        console.warn('Failed to sync push token:', response.status);
        return false;
      }
      console.log('✅ Push token synced to server');
      return true;
    } catch (error) {
      console.warn('syncPushTokenToServer error:', error);
      return false;
    }
  }

  /** Tell the server this user is currently in the app */
  async sendHeartbeat(): Promise<void> {
    try {
      const authToken = await AsyncStorage.getItem('token');
      if (!authToken) return;
      const API_BASE_URL = (await import('../config/api')).default;
      await fetch(`${API_BASE_URL}/api/users/heartbeat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
    } catch {
      // ignore — presence is best-effort
    }
  }

  // Send local notification
  async sendLocalNotification(notificationData: NotificationData): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound || 'default',
          vibrate: notificationData.vibrate !== false ? [0, 250, 250, 250] : [],
          priority: notificationData.priority || 'high',
        },
        trigger: null, // Show immediately
      });

      console.log('✅ Local notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  // Schedule notification
  async scheduleNotification(
    notificationData: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound || 'default',
          vibrate: notificationData.vibrate !== false ? [0, 250, 250, 250] : [],
          priority: notificationData.priority || 'high',
        },
        trigger,
      });

      console.log('✅ Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Send content notification
  async sendContentNotification(contentType: string, title: string, author?: string): Promise<void> {
    const emojis = {
      'advice': '💡',
      'podcast': '🎧',
      'article': '📚',
      'roadmap': '🗺️',
      'course': '🎓'
    };

    const emoji = emojis[contentType as keyof typeof emojis] || '📢';
    
    await this.sendLocalNotification({
      title: `${emoji} محتوى جديد متاح!`,
      body: `تم إضافة ${contentType === 'advice' ? 'نصيحة' : 
                     contentType === 'podcast' ? 'بودكاست' :
                     contentType === 'article' ? 'مقال' :
                     contentType === 'roadmap' ? 'خريطة طريق' : 'محتوى'} جديد: ${title}${author ? ` بواسطة ${author}` : ''}`,
      data: {
        type: 'new_content',
        contentType,
        title,
        author
      },
      categoryId: 'content_updates',
      priority: 'high'
    });
  }

  // Prayer time notifications
  async schedulePrayerNotifications(): Promise<void> {
    try {
      // Check if prayer notifications are enabled
      const prayerNotificationsEnabled = await AsyncStorage.getItem('prayerNotifications') !== 'false';
      if (!prayerNotificationsEnabled) {
        console.log('⏸️ Prayer notifications disabled, skipping...');
        return;
      }

      // Check if notifications were already scheduled today
      const lastScheduledDate = await AsyncStorage.getItem('lastPrayerScheduleDate');
      const today = new Date().toDateString();
      
      if (lastScheduledDate === today) {
        console.log('⏸️ Prayer notifications already scheduled for today, skipping...');
        return;
      }

      // Cancel existing prayer notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const prayerNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'prayer'
      );
      
      for (const notification of prayerNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      // Get current location and calculate prayer times
      // For now, using Cairo, Egypt times as default
      const prayerTimes = await this.getPrayerTimes();
      
      for (const [prayerName, time] of Object.entries(prayerTimes)) {
        await this.schedulePrayerNotification(prayerName, time);
        // Also schedule reminder 5 minutes before
        await this.schedulePrayerReminder(prayerName, time);
      }

      // Mark as scheduled for today
      await AsyncStorage.setItem('lastPrayerScheduleDate', today);

      console.log('✅ Prayer notifications scheduled for', today);
    } catch (error) {
      console.error('Error scheduling prayer notifications:', error);
    }
  }

  private async schedulePrayerNotification(prayerName: string, time: string): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    
    const now = new Date();
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);
    
    // If prayer time has passed today, schedule for tomorrow
    if (prayerTime <= now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }

    const prayerNames = {
      'fajr': 'الفجر',
      'dhuhr': 'الظهر',
      'asr': 'العصر',
      'maghrib': 'المغرب',
      'isha': 'العشاء'
    };

    const arabicName = prayerNames[prayerName as keyof typeof prayerNames] || prayerName;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🕌 حان وقت صلاة ${arabicName}`,
        body: `السلام عليكم، حان الآن وقت صلاة ${arabicName}. بارك الله فيك.`,
        data: {
          type: 'prayer',
          prayerName,
          time
        },
        sound: 'default',
        vibrate: [0, 250, 250, 250],
        priority: 'max',
      },
      // expo-notifications (SDK 54) requires an explicit trigger type; the old
      // { date, repeats: true } shape throws. DAILY is what this always meant.
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prayerTime.getHours(),
        minute: prayerTime.getMinutes(),
      },
    });
  }

  // Schedule prayer reminder (5 minutes before)
  private async schedulePrayerReminder(prayerName: string, time: string): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes - 5, 0, 0); // 5 minutes before
    
    // If reminder time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const prayerNames = {
      'fajr': 'الفجر',
      'dhuhr': 'الظهر',
      'asr': 'العصر',
      'maghrib': 'المغرب',
      'isha': 'العشاء'
    };

    const arabicName = prayerNames[prayerName as keyof typeof prayerNames] || prayerName;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ تذكير: صلاة ${arabicName}`,
        body: `السلام عليكم، يحين وقت صلاة ${arabicName} خلال 5 دقائق. استعد للصلاة.`,
        data: {
          type: 'prayer_reminder',
          prayerName,
          time
        },
        sound: 'default',
        vibrate: [0, 250, 250, 250],
        priority: 'high',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
      },
    });
  }

  private async getPrayerTimes(): Promise<Record<string, string>> {
    try {
      // Get stored location or use default (Cairo)
      const savedLocation = await AsyncStorage.getItem('userLocation');
      const location = savedLocation ? JSON.parse(savedLocation) : { 
        latitude: 30.0444, 
        longitude: 31.2357, 
        city: 'Cairo' 
      };

      // For now, using static times for Cairo
      // In production, you would call a prayer times API
      return {
        fajr: '04:30',
        dhuhr: '12:15',
        asr: '15:45',
        maghrib: '18:30',
        isha: '20:00'
      };
    } catch (error) {
      console.error('Error getting prayer times:', error);
      // Fallback times
      return {
        fajr: '05:00',
        dhuhr: '12:00',
        asr: '15:30',
        maghrib: '18:00',
        isha: '19:30'
      };
    }
  }

  // Get push token
  async getPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    const storedToken = await AsyncStorage.getItem('expoPushToken');
    if (storedToken) {
      this.expoPushToken = storedToken;
      return storedToken;
    }

    return await this.registerForPushNotifications();
  }

  // Send notification to backend for push notifications
  async sendToBackend(notificationData: NotificationData, userIds?: string[]): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data,
          userIds: userIds || [], // Empty array means send to all users
        }),
      });

      if (response.ok) {
        console.log('✅ Notification sent to backend');
      } else {
        console.error('❌ Failed to send notification to backend');
      }
    } catch (error) {
      console.error('Error sending notification to backend:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Cancel prayer notifications only
  async cancelPrayerNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const prayerNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'prayer'
      );
      
      for (const notification of prayerNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      console.log('✅ Prayer notifications cancelled');
    } catch (error) {
      console.error('Error cancelling prayer notifications:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<{
    contentNotifications: boolean;
    prayerNotifications: boolean;
    pushToken: string | null;
  }> {
    try {
      const contentNotifications = await AsyncStorage.getItem('contentNotifications') !== 'false';
      const prayerNotifications = await AsyncStorage.getItem('prayerNotifications') !== 'false';
      const pushToken = await this.getPushToken();

      return {
        contentNotifications,
        prayerNotifications,
        pushToken
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        contentNotifications: true,
        prayerNotifications: true,
        pushToken: null
      };
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: {
    contentNotifications?: boolean;
    prayerNotifications?: boolean;
  }): Promise<void> {
    try {
      if (settings.contentNotifications !== undefined) {
        await AsyncStorage.setItem('contentNotifications', settings.contentNotifications.toString());
      }
      
      if (settings.prayerNotifications !== undefined) {
        await AsyncStorage.setItem('prayerNotifications', settings.prayerNotifications.toString());
        
        if (settings.prayerNotifications) {
          await this.schedulePrayerNotifications();
        } else {
          await this.cancelPrayerNotifications();
        }
      }
      
      console.log('✅ Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  /**
   * Schedule النادي lecture reminders from track weeklySlots:
   * - Morning digest (8:00 AM) with today's lectures
   * - 30 minutes before each lecture
   * - 1 minute before each lecture
   */
  async scheduleClubLectureNotifications(
    tracks?: Array<{
      title: string;
      weeklySlots?: Array<{ dayOfWeek?: number; time?: string; label?: string }>;
    }>
  ): Promise<void> {
    try {
      const enabled = (await AsyncStorage.getItem('clubLectureNotifications')) !== 'false';
      if (!enabled) {
        console.log('⏸️ Club lecture notifications disabled, skipping...');
        return;
      }

      let resolvedTracks = tracks;
      if (!resolvedTracks || resolvedTracks.length === 0) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/club/current`);
          const data = await res.json();
          resolvedTracks = data?.data?.cohort?.tracks || [];
        } catch {
          resolvedTracks = [];
        }
      }

      if (!resolvedTracks.length) {
        console.log('⏸️ No club tracks available for lecture notifications');
        return;
      }

      // Cancel previous club lecture notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of scheduled) {
        if (n.content.data?.type === 'club_lecture') {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }

      const now = new Date();
      let scheduledCount = 0;

      // Next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() + dayOffset);
        const dayOfWeek = day.getDay(); // 0=Sun

        const lecturesToday: Array<{ title: string; time: string; label: string; hours: number; minutes: number }> = [];

        for (const track of resolvedTracks) {
          for (const slot of track.weeklySlots || []) {
            if (Number(slot.dayOfWeek) !== dayOfWeek) continue;
            const time = String(slot.time || '19:00');
            const [hours, minutes] = time.split(':').map(Number);
            if (Number.isNaN(hours) || hours < 19) continue; // only after 7 PM
            lecturesToday.push({
              title: track.title,
              time,
              label: slot.label || `${track.title} ${time}`,
              hours,
              minutes: minutes || 0,
            });
          }
        }

        if (!lecturesToday.length) continue;

        lecturesToday.sort((a, b) => a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes));

        // Morning digest at 8:00 AM
        const morning = new Date(day);
        morning.setHours(8, 0, 0, 0);
        if (morning > now) {
          const list = lecturesToday
            .map((l) => `• ${l.title} — ${this.formatTime12(l.hours, l.minutes)}`)
            .join('\n');
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'صباح الخير — مواعيد النادي النهاردة',
              body: list,
              data: { type: 'club_lecture', kind: 'morning', date: day.toDateString() },
              sound: 'default',
              priority: 'high',
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: morning,
            },
          });
          scheduledCount += 1;
        }

        for (const lecture of lecturesToday) {
          const lectureAt = new Date(day);
          lectureAt.setHours(lecture.hours, lecture.minutes, 0, 0);

          const before30 = new Date(lectureAt.getTime() - 30 * 60 * 1000);
          const before1 = new Date(lectureAt.getTime() - 1 * 60 * 1000);

          if (before30 > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'تذكير خلال 30 دقيقة',
                body: `محاضرة ${lecture.title} هتبدأ الساعة ${this.formatTime12(lecture.hours, lecture.minutes)}`,
                data: {
                  type: 'club_lecture',
                  kind: 'before_30',
                  track: lecture.title,
                  time: lecture.time,
                },
                sound: 'default',
                priority: 'high',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: before30,
              },
            });
            scheduledCount += 1;
          }

          if (before1 > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'المحاضرة بعد دقيقة',
                body: `محاضرة تخصص ${lecture.title} هتبدأ دلوقتي — افتح النادي وادخل Zoom`,
                data: {
                  type: 'club_lecture',
                  kind: 'before_1',
                  track: lecture.title,
                  time: lecture.time,
                },
                sound: 'default',
                priority: 'max',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: before1,
              },
            });
            scheduledCount += 1;
          }
        }
      }

      await AsyncStorage.setItem('lastClubLectureScheduleDate', now.toDateString());
      console.log(`✅ Club lecture notifications scheduled (${scheduledCount})`);
    } catch (error) {
      console.error('Error scheduling club lecture notifications:', error);
    }
  }

  private formatTime12(hours: number, minutes: number): string {
    const h12 = ((hours + 11) % 12) + 1;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  }
}

export default NotificationService.getInstance();
