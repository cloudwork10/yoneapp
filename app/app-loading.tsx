import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AppLoadingScreen() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const soundWaveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startLoadingAnimation();
    playWelcomeSound();
    checkAuthAndRedirect();
  }, []);

  const startLoadingAnimation = () => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Loading dots animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation for content
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sound wave animation (triggered with sound)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(soundWaveAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(soundWaveAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 500); // Start after logo appears
  };

  const playWelcomeSound = async () => {
    try {
      console.log('🔊 Triggering welcome feedback...');
      
      // Primary feedback: Haptic (always works)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('✅ Welcome haptic feedback triggered');
      
      // Secondary feedback: Multiple short haptic pulses for "sound" effect
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            console.log('✅ Welcome pulse feedback completed');
          }, 100);
        } catch (hapticError) {
          console.log('⚠️ Additional haptic feedback failed');
        }
      }, 150);

      // Optional: Try system beep as bonus if available
      setTimeout(async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });

          // Try a very simple, reliable sound approach
          const { sound } = await Audio.Sound.createAsync(
            { uri: 'https://www.soundjay.com/misc/beep-07.wav' },
            { shouldPlay: true, volume: 0.4, rate: 1.5 }
          );

          // Auto cleanup after 2 seconds
          setTimeout(() => {
            sound.unloadAsync().catch(() => {});
          }, 2000);
          
          console.log('✅ Bonus welcome beep attempted');
        } catch (audioError) {
          // Silently fail - haptic feedback is the main experience
          console.log('⚠️ Audio bonus failed (expected), haptic feedback was primary');
        }
      }, 300);
      
    } catch (error) {
      console.error('❌ Error with welcome feedback:', error);
      console.log('⚠️ Welcome feedback failed, continuing with visual feedback only');
    }
  };

  const checkAuthAndRedirect = async () => {
    try {
      // Minimum loading time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 2500));

      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      console.log('🔐 App Loading: Checking auth status...');
      console.log('🔐 Token exists:', !!token);
      console.log('🔐 User data exists:', !!userData);
      
      if (!token || !userData) {
        console.log('🔐 No auth found, redirecting to login...');
        router.replace('/login');
        return;
      }

      // Verify token with server
      try {
        const response = await fetch('http://192.168.100.42:3000/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Auth valid, redirecting to app...');
          router.replace('/(tabs)');
        } else {
          console.log('🔐 Token invalid, redirecting to login...');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          router.replace('/login');
        }
      } catch (error) {
        console.error('🔐 Error verifying token:', error);
        router.replace('/login');
      }
    } catch (error) {
      console.error('🔐 Error in auth check:', error);
      router.replace('/login');
    }
  };

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: floatTranslate }
            ],
          },
        ]}
      >
        {/* App Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { rotate: logoRotate },
                { scale: pulseAnim }
              ],
            },
          ]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>Y</Text>
          </View>
        </Animated.View>

        {/* Sound Waves */}
        <View style={styles.soundWavesContainer}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.soundWave,
                {
                  opacity: soundWaveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      scaleY: soundWaveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5 + index * 0.2],
                      }),
                    },
                  ],
                },
                { marginLeft: index * 8 }
              ]}
            />
          ))}
        </View>

        {/* App Name */}
        <Text style={styles.appName}>YONE</Text>
        <Text style={styles.appSubtitle}>Your Learning Companion</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 1, 0.3, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 0.3, 1],
                  }),
                },
              ]}
            />
          </View>

          <Text style={styles.loadingText}>✨ Welcome to YONE...</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  soundWavesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginBottom: 20,
  },
  soundWave: {
    width: 4,
    height: 20,
    backgroundColor: '#E50914',
    borderRadius: 2,
    marginHorizontal: 2,
    shadowColor: '#E50914',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 3,
    textShadowColor: 'rgba(229, 9, 20, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 60,
    fontWeight: '300',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E50914',
    marginHorizontal: 6,
    shadowColor: '#E50914',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: width * 0.7,
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
    shadowColor: '#E50914',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  versionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '300',
    position: 'absolute',
    bottom: -100,
  },
});
