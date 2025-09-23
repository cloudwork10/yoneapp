import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import RealScreenshotBlocker from '../services/RealScreenshotBlocker';

interface ContentProtectionTestButtonProps {
  style?: any;
}

export default function ContentProtectionTestButton({ style }: ContentProtectionTestButtonProps) {
  const handleTestProtection = () => {
    Alert.alert(
      '🔒 Test Screenshot Blocker',
      'This will simulate a screenshot detection to test the black screen protection.',
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
      onPress={handleTestProtection}
    >
      <Text style={styles.buttonText}>🔒 Test Screenshot Blocker</Text>
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
