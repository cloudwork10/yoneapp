import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface NetflixStyleBlackScreenProps {
  visible: boolean;
}

export default function NetflixStyleBlackScreen({ visible }: NetflixStyleBlackScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.blackScreen,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      {/* Netflix-style black screen with subtle warning */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          🚫 SCREENSHOT BLOCKED
        </Text>
        <Text style={styles.subWarningText}>
          This content is protected
        </Text>
        <Text style={styles.detailText}>
          Unauthorized screenshots are prohibited
        </Text>
      </View>

      {/* Subtle pattern overlay for additional protection */}
      <View style={styles.patternOverlay}>
        {Array.from({ length: 15 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.patternDot,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: 0.05 + Math.random() * 0.1,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blackScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: '#000000', // Pure black like Netflix
  },
  warningContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -60 }],
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 25,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 240,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  warningText: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subWarningText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 6,
    fontWeight: '500',
  },
  detailText: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    width: 3,
    height: 3,
    backgroundColor: '#E50914',
    borderRadius: 1.5,
  },
});
