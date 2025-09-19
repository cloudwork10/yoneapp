import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  type?: 'general' | 'content' | 'audio' | 'video' | 'upload';
  color?: string;
}

export default function LoadingScreen({ 
  message = 'جاري التحميل...', 
  type = 'general',
  color = '#4ECDC4'
}: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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

    // Dots animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getIcon = () => {
    switch (type) {
      case 'content':
        return '📚';
      case 'audio':
        return '🎙️';
      case 'video':
        return '🎬';
      case 'upload':
        return '📤';
      default:
        return '✨';
    }
  };

  const getLoadingBars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <Animated.View
        key={index}
        style={[
          styles.loadingBar,
          {
            backgroundColor: color,
            transform: [
              {
                scaleY: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.3 + (index * 0.1), 1 + (index * 0.2)],
                }),
              },
            ],
            animationDelay: `${index * 100}ms`,
          },
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2d2d2d', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Main Loading Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: spin },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[color, `${color}80`, color]}
              style={styles.iconGradient}
            >
              <Text style={styles.loadingIcon}>{getIcon()}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Loading Bars */}
          <View style={styles.loadingBarsContainer}>
            {getLoadingBars()}
          </View>

          {/* Loading Text */}
          <Animated.View style={styles.textContainer}>
            <Text style={[styles.loadingText, { color }]}>{message}</Text>
            <Animated.View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <Animated.Text
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: dotsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: index === 0 ? [0.3, 1] : index === 1 ? [0.6, 1] : [1, 0.3],
                      }),
                      color,
                    },
                  ]}
                >
                  ●
                </Animated.Text>
              ))}
            </Animated.View>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: color,
                    width: dotsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['20%', '80%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {/* Floating Particles */}
          <View style={styles.particlesContainer}>
            {Array.from({ length: 8 }, (_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    backgroundColor: `${color}40`,
                    transform: [
                      {
                        translateY: pulseAnim.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [0, -20 - (index * 5)],
                        }),
                      },
                      {
                        translateX: Math.sin(index) * 50,
                      },
                    ],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.6, 0.2],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  loadingBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    marginBottom: 30,
    gap: 4,
  },
  loadingBar: {
    width: 6,
    borderRadius: 3,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: width * 0.7,
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  particlesContainer: {
    position: 'absolute',
    width: width,
    height: height,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: height * 0.3 + Math.random() * height * 0.4,
    left: width * 0.1 + Math.random() * width * 0.8,
  },
});
