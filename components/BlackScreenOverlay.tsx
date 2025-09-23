import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface BlackScreenOverlayProps {
  visible: boolean;
}

export default function BlackScreenOverlay({ visible }: BlackScreenOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.blackScreen,
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="none"
    >
      {/* Pure black screen - this will appear in screenshots */}
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
    backgroundColor: '#000000', // Pure black
  },
});
