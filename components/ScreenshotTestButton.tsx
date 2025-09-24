import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface ScreenshotTestButtonProps {
  onScreenshotAttempt?: () => void;
}

export default function ScreenshotTestButton({ onScreenshotAttempt }: ScreenshotTestButtonProps) {
  const [isTesting, setIsTesting] = useState(false);

  const testScreenshotProtection = async () => {
    try {
      setIsTesting(true);
      
      // Trigger haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Show alert
      Alert.alert(
        '🔒 Screenshot Protection Test',
        'This simulates a screenshot attempt. The protection system should detect this and show a warning overlay.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsTesting(false);
              if (onScreenshotAttempt) {
                onScreenshotAttempt();
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error testing screenshot protection:', error);
      setIsTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.testButton, isTesting && styles.testButtonActive]}
        onPress={testScreenshotProtection}
        disabled={isTesting}
      >
        <Text style={styles.testButtonText}>
          {isTesting ? 'Testing...' : '🧪 Test Screenshot Protection'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.instructionText}>
        Tap to test the screenshot protection system
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  testButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  testButtonActive: {
    backgroundColor: '#B8070F',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
