import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SimpleScreenshotBlocker from '../services/SimpleScreenshotBlocker';

export default function TestScreenshotScreen() {
  const [isEnabled, setIsEnabled] = useState(SimpleScreenshotBlocker.isActive());

  const toggleProtection = () => {
    if (isEnabled) {
      SimpleScreenshotBlocker.disable();
      setIsEnabled(false);
      Alert.alert('تم إلغاء الحماية', 'يمكنك الآن أخذ لقطات شاشة');
    } else {
      SimpleScreenshotBlocker.enable();
      setIsEnabled(true);
      Alert.alert('تم تفعيل الحماية', 'لقطات الشاشة محظورة الآن');
    }
  };

  const testHaptic = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert('تم الاختبار', 'هل شعرت بالاهتزاز؟');
    } catch (error) {
      Alert.alert('خطأ', 'لا يمكن تشغيل الاهتزاز');
    }
  };

  const simulateScreenshot = () => {
    Alert.alert(
      'اختبار محاكاة',
      'جرب الآن أخذ لقطة شاشة من التطبيق. يجب أن تشعر بالاهتزاز فوراً!',
      [{ text: 'موافق' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← رجوع</Text>
          </TouchableOpacity>
          <Text style={styles.title}>اختبار منع لقطات الشاشة</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>حالة الحماية</Text>
            <View style={[styles.statusIndicator, { backgroundColor: isEnabled ? '#E50914' : '#666' }]} />
            <Text style={styles.statusText}>
              {isEnabled ? 'مفعلة' : 'معطلة'}
            </Text>
          </View>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleProtection}>
            <Text style={styles.toggleButtonText}>
              {isEnabled ? 'إلغاء الحماية' : 'تفعيل الحماية'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={testHaptic}>
            <Text style={styles.testButtonText}>🧪 اختبار الاهتزاز</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.simulateButton} onPress={simulateScreenshot}>
            <Text style={styles.simulateButtonText}>📸 جرب لقطة شاشة</Text>
          </TouchableOpacity>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>كيفية الاختبار:</Text>
            <Text style={styles.instructionText}>
              1. تأكد من تفعيل الحماية{'\n'}
              2. جرب أخذ لقطة شاشة{'\n'}
              3. يجب أن تشعر بالاهتزاز فوراً{'\n'}
              4. تحقق من الكونسول للرسائل
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#E50914',
    minWidth: '80%',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    minWidth: '80%',
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    minWidth: '80%',
    alignItems: 'center',
  },
  testButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  simulateButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 30,
    minWidth: '80%',
    alignItems: 'center',
  },
  simulateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    minWidth: '80%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});
