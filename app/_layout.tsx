import { UserProvider } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import NotificationService from '../services/NotificationService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize notifications
    const initializeNotifications = async () => {
      try {
        // Register for push notifications
        await NotificationService.registerForPushNotifications();
        
        // Schedule prayer notifications only once per day
        await NotificationService.schedulePrayerNotifications();
        
        console.log('✅ Notifications initialized');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    // Only initialize once when app starts
    initializeNotifications();

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      // Handle notification tap
      const data = response.notification.request.content.data;
      if (data?.type === 'new_content') {
        // Navigate to content based on type
        switch (data.contentType) {
          case 'advice':
            router.push('/advices');
            break;
          case 'podcast':
            router.push('/podcasts');
            break;
          case 'article':
            router.push('/articles');
            break;
          case 'roadmap':
            router.push('/roadmaps');
            break;
        }
      } else if (data?.type === 'prayer') {
        // Could navigate to prayer times or Islamic content
        console.log('🕌 Prayer notification tapped');
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Navigate to loading screen which will handle auth check
      router.replace('/app-loading');
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="app-loading" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="content-management" options={{ headerShown: false }} />
          <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
          <Stack.Screen name="programmer-thoughts" options={{ headerShown: false }} />
          <Stack.Screen name="article-details" options={{ headerShown: false }} />
          <Stack.Screen name="roadmap-details" options={{ headerShown: false }} />
          <Stack.Screen name="podcast-details" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="top-cv" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}