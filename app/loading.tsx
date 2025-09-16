import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the loading animation sequence
    const animationSequence = Animated.sequence([
      // Logo scale in
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(1500),
    ]);

    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotate animation for loading spinner
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Progress animation
    const progressAnimation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    });

    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    animationSequence.start(() => {
      // Navigate to login after animation completes
      router.replace('/login');
    });

    pulseAnimation.start();
    rotateAnimation.start();
    progressAnimation.start();
    shimmerAnimation.start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <LinearGradient
      colors={['#0F0F23', '#1A1A2E', '#16213E', '#0F0F23']}
      style={styles.container}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(30)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: fadeAnim,
                transform: [
                  { scale: pulseAnim },
                ],
              },
            ]}
          />
        ))}
      </View>

      {/* Floating Elements */}
      <Animated.View style={[styles.floatingElement, styles.floatingElement1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingElement, styles.floatingElement2, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingElement, styles.floatingElement3, { opacity: fadeAnim }]} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: logoScaleAnim },
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>YONE</Text>
          <View style={styles.logoGlow} />
          <Animated.View 
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslateX }],
              },
            ]} 
          />
        </View>
        <Text style={styles.subtitle}>Learn. Grow. Succeed.</Text>
        <Text style={styles.tagline}>Your Learning Journey Starts Here</Text>
      </Animated.View>
      
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        {/* Loading Spinner */}
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerInner} />
        </Animated.View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: progressWidth }
              ]} 
            />
            <View style={styles.progressGlow} />
          </View>
          <Text style={styles.loadingText}>Loading your experience...</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  floatingElement1: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    top: '20%',
    left: '10%',
  },
  floatingElement2: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    top: '60%',
    right: '15%',
  },
  floatingElement3: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    bottom: '30%',
    left: '20%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(78, 205, 196, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  shimmer: {
    position: 'absolute',
    width: 50,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    zIndex: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#4ECDC4',
    marginTop: 20,
    letterSpacing: 2,
    fontWeight: '600',
    textShadowColor: 'rgba(78, 205, 196, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 1,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
    width: width * 0.8,
  },
  spinner: {
    width: 40,
    height: 40,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#4ECDC4',
    borderRightColor: '#E50914',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 15,
    letterSpacing: 1,
    opacity: 0.8,
    fontWeight: '500',
  },
});