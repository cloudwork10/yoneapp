import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export default function SimpleTestButton() {
  const testScreenshot = async () => {
    try {
      // اهتزاز قوي
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      Alert.alert(
        '🔒 تم اختبار النظام',
        'النظام يعمل! جرب أخذ لقطة شاشة الآن.',
        [{ text: 'موافق' }]
      );
    } catch (error) {
      console.error('خطأ في الاختبار:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={testScreenshot}>
        <Text style={styles.buttonText}>🧪 اختبار منع لقطات الشاشة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
