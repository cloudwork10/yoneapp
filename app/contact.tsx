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

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'General Inquiry'}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:contact@yoneapp.com?subject=${encodeURIComponent(subject || 'Contact from YONE App')}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Could not open email application');
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = '+201234567890';
    const message = 'Hello, I need help with YONE app';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  const openTelegram = () => {
    const telegramUrl = 'https://t.me/yoneapp_support';
    Linking.openURL(telegramUrl).catch(() => {
      Alert.alert('Error', 'Could not open Telegram');
    });
  };

  const openDiscord = () => {
    const discordUrl = 'https://discord.gg/yoneapp';
    Linking.openURL(discordUrl).catch(() => {
      Alert.alert('Error', 'Could not open Discord');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Contact Us</Text>
            <Text style={styles.subtitle}>We're here to help you</Text>
          </View>

          {/* Contact Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 Quick Contact</Text>
            
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

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✉️ Send us a Message</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your Name *"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Your Email *"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Subject (optional)"
              placeholderTextColor="#666"
              value={subject}
              onChangeText={setSubject}
            />
            
            <TextInput
              style={styles.messageInput}
              placeholder="Your Message *"
              placeholderTextColor="#666"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>📤 Send Message</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Contact Information</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📧</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>contact@yoneapp.com</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🌐</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Website</Text>
                <Text style={styles.infoValue}>www.yoneapp.com</Text>
              </View>
            </View>

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
                <Text style={styles.infoValue}>Monday - Friday, 9 AM - 6 PM</Text>
              </View>
            </View>
          </View>

          {/* FAQ */}
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

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Thank you for using YONE! 🚀
            </Text>
            <Text style={styles.footerSubtext}>
              We appreciate your feedback and suggestions
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
  input: {
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
