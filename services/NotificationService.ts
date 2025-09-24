import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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
      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
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
      trigger: {
        date: prayerTime,
        repeats: true,
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
        date: reminderTime,
        repeats: true,
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

      const response = await fetch('http://localhost:3000/api/admin/send-notification', {
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
}

export default NotificationService.getInstance();
