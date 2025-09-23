import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ScreenshotProtectionOverlayProps {
  visible: boolean;
}

export default function ScreenshotProtectionOverlay({ visible }: ScreenshotProtectionOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      {/* Strong warning text that appears in screenshots */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          🚫 SCREENSHOT BLOCKED
        </Text>
        <Text style={styles.subWarningText}>
          This content is protected by YONE
        </Text>
        <Text style={styles.detailText}>
          Screenshots are monitored and blocked
        </Text>
        <Text style={styles.legalText}>
          Unauthorized screenshots are prohibited
        </Text>
      </View>

      {/* Subtle pattern overlay */}
      <View style={styles.patternOverlay}>
        {Array.from({ length: 20 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.patternDot,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: 0.1 + Math.random() * 0.2,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'transparent',
  },
  warningContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  warningText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subWarningText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 5,
  },
  detailText: {
    color: '#FF6B6B',
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: 3,
  },
  legalText: {
    color: '#FF4444',
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#E50914',
    borderRadius: 1,
  },
});
