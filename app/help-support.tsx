import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة رسالتك');
      return;
    }

    const subject = 'YONE App Support Request';
    const body = `Message: ${message}\n\nEmail: ${email || 'Not provided'}`;
    const mailtoUrl = `mailto:support@yoneapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('خطأ', 'لا يمكن فتح تطبيق البريد الإلكتروني');
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = '+201234567890'; // Replace with actual support number
    const message = 'مرحباً، أحتاج مساعدة في تطبيق YONE';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('خطأ', 'لا يمكن فتح WhatsApp');
    });
  };

  const openTelegram = () => {
    const telegramUrl = 'https://t.me/yoneapp_support';
    Linking.openURL(telegramUrl).catch(() => {
      Alert.alert('خطأ', 'لا يمكن فتح Telegram');
    });
  };

  const openDiscord = () => {
    const discordUrl = 'https://discord.gg/yoneapp';
    Linking.openURL(discordUrl).catch(() => {
      Alert.alert('خطأ', 'لا يمكن فتح Discord');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← رجوع</Text>
            </TouchableOpacity>
            <Text style={styles.title}>المساعدة والدعم</Text>
            <Text style={styles.subtitle}>نحن هنا لمساعدتك في أي وقت</Text>
          </View>

          {/* Contact Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 طرق التواصل</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={openWhatsApp}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactEmoji}>💬</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>WhatsApp</Text>
                <Text style={styles.contactDescription}>تواصل معنا مباشرة عبر WhatsApp</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openTelegram}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactEmoji}>✈️</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Telegram</Text>
                <Text style={styles.contactDescription}>انضم لقناتنا على Telegram</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openDiscord}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactEmoji}>🎮</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Discord</Text>
                <Text style={styles.contactDescription}>انضم لمجتمعنا على Discord</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Send Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✉️ أرسل لنا رسالة</Text>
            
            <TextInput
              style={styles.emailInput}
              placeholder="بريدك الإلكتروني (اختياري)"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.messageInput}
              placeholder="اكتب رسالتك هنا..."
              placeholderTextColor="#666"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>📤 إرسال الرسالة</Text>
            </TouchableOpacity>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❓ الأسئلة الشائعة</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>كيف يمكنني إضافة محتوى جديد؟</Text>
              <Text style={styles.faqAnswer}>
                يمكنك الوصول للداشبورد من خلال حساب المدير وإضافة المحتوى الجديد من هناك.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>كيف يمكنني تفعيل الإشعارات؟</Text>
              <Text style={styles.faqAnswer}>
                اذهب لإعدادات الإشعارات واضغط على "تفعيل الإشعارات" واقبل الأذونات.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>هل التطبيق مجاني؟</Text>
              <Text style={styles.faqAnswer}>
                نعم، تطبيق YONE مجاني بالكامل ولا توجد رسوم مخفية.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>كيف يمكنني الإبلاغ عن مشكلة؟</Text>
              <Text style={styles.faqAnswer}>
                يمكنك التواصل معنا عبر أي من طرق التواصل المتاحة أو إرسال رسالة مباشرة.
              </Text>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ معلومات التطبيق</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الإصدار:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>تاريخ الإصدار:</Text>
              <Text style={styles.infoValue}>يناير 2025</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>المطور:</Text>
              <Text style={styles.infoValue}>فريق YONE</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
              <Text style={styles.infoValue}>support@yoneapp.com</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              شكراً لاستخدامك تطبيق YONE! 🚀
            </Text>
            <Text style={styles.footerSubtext}>
              نحن نقدر ملاحظاتك واقتراحاتك
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  scrollView: {
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E50914',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactEmoji: {
    fontSize: 24,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  contactArrow: {
    fontSize: 20,
    color: '#E50914',
    fontWeight: 'bold',
  },
  emailInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  messageInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
    minHeight: 120,
  },
  sendButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E50914',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 18,
    color: '#E50914',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});
