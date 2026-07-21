import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from '../components/FixedBackBar';
import { CONTACT_EMAIL } from '../config/legal';

export default function ContactScreen() {
  const openEmail = () => {
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Contact from ELNADY App')}`;
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Could not open email application');
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = '+201234567890';
    const message = 'Hello, I need help with ELNADY app';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  const openTelegram = () => {
    const telegramUrl = 'https://t.me/elnady_support';
    Linking.openURL(telegramUrl).catch(() => {
      Alert.alert('Error', 'Could not open Telegram');
    });
  };

  const openDiscord = () => {
    const discordUrl = 'https://discord.gg/elnady';
    Linking.openURL(discordUrl).catch(() => {
      Alert.alert('Error', 'Could not open Discord');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <FixedBackBar />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Contact Us</Text>
            <Text style={styles.subtitle}>We're here to help you</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 Quick Contact</Text>

            <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactEmoji}>📧</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactDescription}>{CONTACT_EMAIL}</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openWhatsApp}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactEmoji}>💬</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>WhatsApp</Text>
                <Text style={styles.contactDescription}>Chat with us directly</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openTelegram}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactEmoji}>✈️</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Telegram</Text>
                <Text style={styles.contactDescription}>Join our support channel</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openDiscord}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactEmoji}>🎮</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Discord</Text>
                <Text style={styles.contactDescription}>Join our community</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Contact Information</Text>

            <TouchableOpacity style={styles.infoItem} onPress={openEmail}>
              <Text style={styles.infoIcon}>📧</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{CONTACT_EMAIL}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Response Time</Text>
                <Text style={styles.infoValue}>24-48 hours</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🕒</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Business Hours</Text>
                <Text style={styles.infoValue}>Sat–Thu, 12 PM – 12 AM (closed Friday)</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How quickly do you respond?</Text>
              <Text style={styles.faqAnswer}>
                We typically respond to all inquiries within 24-48 hours during business days.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What's the best way to reach you?</Text>
              <Text style={styles.faqAnswer}>
                For quick questions, WhatsApp is fastest. For detailed issues, email is best.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Do you provide technical support?</Text>
              <Text style={styles.faqAnswer}>
                Yes, we provide full technical support for all app-related issues and questions.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for using ELNADY! 🚀</Text>
            <Text style={styles.footerSubtext}>We appreciate your feedback and suggestions</Text>
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
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
