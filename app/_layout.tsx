import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import NotificationService from '../services/NotificationService';
import { PAID_FLOW_ENABLED } from '../utils/subscriptionAccess';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function PresenceHeartbeat() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const beat = () => {
      NotificationService.sendHeartbeat();
    };

    const start = () => {
      beat();
      NotificationService.syncPushTokenToServer();
      if (interval) clearInterval(interval);
      interval = setInterval(beat, 45000);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    start();

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') start();
      else stop();
    };

    const sub = AppState.addEventListener('change', onAppState);
    return () => {
      stop();
      sub.remove();
    };
  }, [user?.id]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await NotificationService.registerForPushNotifications();
        await NotificationService.schedulePrayerNotifications();
        await NotificationService.scheduleClubLectureNotifications();
        console.log('✅ Notifications initialized');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);

      if (response.notification.request.content.data) {
        const data = response.notification.request.content.data;

        if (data.type === 'prayer') {
          router.push('/prayer-times');
        } else if (data.type === 'club_lecture') {
          router.push('/(tabs)/scholarship');
        } else if (data.type === 'course') {
          router.push('/(tabs)/courses');
        } else if (data.type === 'podcast') {
          router.push('/(tabs)/podcasts');
        } else if (
          data.type === 'subscription_approved' ||
          data.type === 'subscription_rejected' ||
          data.type === 'subscription_expired' ||
          data.type === 'subscription_remind_2d' ||
          data.type === 'subscription_remind_same_day' ||
          data.type === 'subscription_remind_lock_tonight'
        ) {
          // iOS has no purchase path (App Store 3.1.1/3.1.3) — a subscription
          // notification must not deep-link into the manual-transfer screen.
          if (PAID_FLOW_ENABLED) {
            router.push('/subscription-2');
          } else {
            router.push('/(tabs)/more');
          }
        } else if (
          data.type === 'admin_subscription_expired' ||
          data.type === 'admin_subscription_ending_tonight'
        ) {
          router.push('/active-subscribers');
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <UserProvider>
        <PresenceHeartbeat />
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 220,
              contentStyle: { backgroundColor: '#000000' },
            }}
          >
            <Stack.Screen name="app-loading" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="content-management" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="club-management" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="tech-news" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="mubasher" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="jobs" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="job-details" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="post-job" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="my-jobs" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="job-applicants" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="jobs-management" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="subscription" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="subscription-2" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="subscription-requests" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="project-submissions" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="active-subscribers" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="notification-settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="help-support" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="terms-conditions" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="refund-policy" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="privacy-policy" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="contact" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="about-us" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="programmer-thoughts" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="article-details" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="roadmap-details" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="podcast-details" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="payment" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="top-cv" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="user-profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="egyptian-baccalaureate" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="prayer-times" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}
