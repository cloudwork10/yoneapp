import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import VisualContentProtection from '../services/VisualContentProtection';

interface ContentProtectionTestButtonProps {
  style?: any;
}

export default function ContentProtectionTestButton({ style }: ContentProtectionTestButtonProps) {
  const handleTestProtection = () => {
    Alert.alert(
      '🔒 Test Visual Protection',
      'This will simulate a screenshot detection to test the visual content protection.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Test Now',
          style: 'default',
          onPress: () => {
            VisualContentProtection.simulateScreenshotDetection();
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
      <Text style={styles.buttonText}>🔒 Test Visual Protection</Text>
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
