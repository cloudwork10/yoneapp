import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface VisualProtectionOverlayProps {
  visible: boolean;
}

export default function VisualProtectionOverlay({ visible }: VisualProtectionOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start(),
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
  }, [visible, fadeAnim, scaleAnim, rotateAnim]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
      {/* Main protection message */}
      <View style={styles.messageContainer}>
        <Animated.View style={[styles.iconContainer, { transform: [{ rotate }] }]}>
          <Text style={styles.protectionIcon}>🚫</Text>
        </Animated.View>
        
        <Text style={styles.mainMessage}>
          CONTENT PROTECTED
        </Text>
        <Text style={styles.subMessage}>
          Screenshots are not allowed
        </Text>
        <Text style={styles.warningText}>
          This content is protected by YONE
        </Text>
      </View>

      {/* Watermark pattern overlay */}
      <View style={styles.watermarkContainer}>
        {Array.from({ length: 20 }).map((_, index) => (
          <Text
            key={index}
            style={[
              styles.watermark,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: 0.1 + Math.random() * 0.2,
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              },
            ]}
          >
            PROTECTED
          </Text>
        ))}
      </View>

      {/* Corner warnings */}
      <View style={styles.cornerWarning}>
        <Text style={styles.cornerText}>🚫</Text>
      </View>
      <View style={[styles.cornerWarning, styles.topRight]}>
        <Text style={styles.cornerText}>🚫</Text>
      </View>
      <View style={[styles.cornerWarning, styles.bottomLeft]}>
        <Text style={styles.cornerText}>🚫</Text>
      </View>
      <View style={[styles.cornerWarning, styles.bottomRight]}>
        <Text style={styles.cornerText}>🚫</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 300,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 20,
  },
  protectionIcon: {
    fontSize: 60,
    textAlign: 'center',
  },
  mainMessage: {
    color: '#E50914',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 2,
  },
  subMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  warningText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  watermark: {
    position: 'absolute',
    color: '#E50914',
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.1,
  },
  cornerWarning: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRight: {
    top: 20,
    right: 20,
    left: 'auto',
  },
  bottomLeft: {
    bottom: 20,
    top: 'auto',
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    top: 'auto',
    left: 'auto',
  },
  cornerText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
