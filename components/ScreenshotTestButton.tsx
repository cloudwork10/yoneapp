import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import UltimateScreenshotProtection from '../services/UltimateScreenshotProtection';

interface ScreenshotTestButtonProps {
  style?: any;
}

export default function ScreenshotTestButton({ style }: ScreenshotTestButtonProps) {
  const handleTestScreenshot = () => {
    Alert.alert(
      '🧪 Test Screenshot Protection',
      'This will simulate a screenshot detection to test the protection system.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Test Now',
          style: 'default',
          onPress: () => {
            UltimateScreenshotProtection.simulateScreenshotDetection();
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleTestScreenshot}
    >
      <Text style={styles.buttonText}>🧪 Test Screenshot Protection</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
