import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import RealScreenshotBlocker from '../services/RealScreenshotBlocker';

interface ScreenshotTestButtonProps {
  style?: any;
}

export default function ScreenshotTestButton({ style }: ScreenshotTestButtonProps) {
  const handleTestScreenshot = () => {
    Alert.alert(
      '🔒 Netflix-Style Screenshot Protection Test',
      'This will simulate a screenshot detection to test the Netflix-style protection system. A black screen will appear for 5 seconds.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Test Now',
          style: 'default',
          onPress: () => {
            RealScreenshotBlocker.simulateScreenshotDetection();
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
      <Text style={styles.buttonText}>🔒 Test Netflix-Style Protection</Text>
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
