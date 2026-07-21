import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIVACY_POLICY_URL, CONTACT_EMAIL } from '../config/legal';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body:
      'We collect information you provide when you use ELNADY:\n\n' +
      '• Account data (name, email, password — stored hashed)\n' +
      '• Profile information and preferences\n' +
      '• Learning progress and course activity\n' +
      '• Job applications and CV files you upload\n' +
      '• Media you upload (images, videos, audio, PDFs)\n' +
      '• Basic device and security logs (IP, login attempts)\n' +
      '• Push notification token if you enable notifications',
  },
  {
    title: 'How We Use Your Information',
    body:
      'We use your data to:\n\n' +
      '• Create and secure your account\n' +
      '• Deliver courses, content, tech news, and reels\n' +
      '• Process in-app job applications\n' +
      '• Send optional push notifications\n' +
      '• Protect the platform from abuse\n\n' +
      'We do not sell your personal data to third parties.',
  },
  {
    title: 'Who Can See Your Data',
    body:
      '• You — your account and activity\n' +
      '• ELNADY admins — to operate and support the app\n' +
      '• Job posters — applicants and CVs for their own jobs only',
  },
  {
    title: 'Where Data Is Stored',
    body:
      '• Database: MongoDB Atlas (cloud)\n' +
      '• Uploaded files: ELNADY servers on Railway\n\n' +
      'Data may be processed on servers outside your country with appropriate safeguards.',
  },
  {
    title: 'Third-Party Infrastructure',
    body:
      'We use hosting providers to run the app:\n\n' +
      '• MongoDB Atlas (database)\n' +
      '• Railway (API and file storage)\n' +
      '• Expo (app delivery and notifications)\n\n' +
      'These providers process data on our behalf to operate the service.',
  },
  {
    title: 'Data Security',
    body:
      '• Passwords are hashed with bcrypt\n' +
      '• HTTPS for app-to-server communication\n' +
      '• JWT authentication on protected APIs\n' +
      '• Rate limiting and account lockout on failed logins',
  },
  {
    title: 'Push Notifications',
    body:
      'We may send notifications about new content, courses, or important announcements. ' +
      'You can disable them in your device settings or inside the app.',
  },
  {
    title: 'Your Rights',
    body:
      'You may request to:\n\n' +
      '• Access or correct your personal data\n' +
      '• Delete your account and related data\n' +
      '• Opt out of push notifications\n\n' +
      `Contact us at ${CONTACT_EMAIL}`,
  },
  {
    title: "Children's Privacy",
    body:
      'ELNADY is not intended for children under 13. We do not knowingly collect data from children under 13. ' +
      'If we learn that we have, we will delete it promptly.',
  },
  {
    title: 'Policy Updates',
    body:
      'We may update this Privacy Policy. The latest version is always available at our public URL below. ' +
      'Last updated: July 2026.',
  },
  {
    title: 'Contact Us',
    body:
      `Email: ${CONTACT_EMAIL}\n` +
      'Public policy: ' +
      PRIVACY_POLICY_URL,
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>Last updated: July 2026</Text>
            <TouchableOpacity
              style={styles.publicLink}
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            >
              <Text style={styles.publicLinkText}>🌐 Open public page (for app stores)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {SECTIONS.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionText}>{section.body}</Text>
              </View>
            ))}
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
    marginBottom: 12,
  },
  publicLink: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  publicLinkText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E50914',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#E8E8E8',
    lineHeight: 24,
    fontWeight: '400',
  },
});
