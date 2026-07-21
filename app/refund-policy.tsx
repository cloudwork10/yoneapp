import { LinearGradient } from 'expo-linear-gradient';
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
import FixedBackBar from '../components/FixedBackBar';
import { CONTACT_EMAIL, REFUND_POLICY_URL } from '../config/legal';

const SECTIONS = [
  {
    title: 'Free Content',
    body:
      'ELNADY offers free features (courses, news, jobs, and more) at no charge. ' +
      'Creating an account and using free features does not require payment, so refunds do not apply to unpaid use.',
  },
  {
    title: 'Paid Subscriptions & Courses',
    body:
      'When paid plans or courses are enabled:\n\n' +
      '• Price and duration are shown clearly before payment\n' +
      '• Access is activated after successful payment\n' +
      '• You may request a refund within 7 days if you have not substantially used the paid content (less than ~20% of lessons/features)\n' +
      '• After 7 days or heavy use, refunds are only considered for proven technical errors (e.g. double charge, access not granted)',
  },
  {
    title: 'How to Request a Refund',
    body:
      `1. Email ${CONTACT_EMAIL}\n` +
      '2. Include: account name, email, payment date, and reason\n' +
      '3. Attach payment receipt if available\n' +
      '4. We respond within 3–5 business days\n\n' +
      'Approved refunds are returned to the original payment method within 7–14 days, depending on the bank or payment provider.',
  },
  {
    title: 'Payment Processing',
    body:
      'In-app payments are processed through secure payment gateways (e.g. Paymob or app stores). ' +
      'ELNADY does not store your full card details — they are handled by the payment provider.',
  },
  {
    title: 'App Store / Google Play',
    body:
      'Purchases through Apple or Google follow their refund policies:\n\n' +
      '• Apple: reportaproblem.apple.com\n' +
      '• Google Play: play.google.com/store/account\n\n' +
      'ELNADY cannot override store refund decisions, but we can help with your request.',
  },
  {
    title: 'Non-Refundable Cases',
    body:
      '• Terms of service violations or account abuse\n' +
      '• Substantial use of paid content\n' +
      '• Requests after 7 days (except proven technical errors)\n' +
      '• Temporary free-service downtime (we fix issues without monetary compensation for free tiers)',
  },
  {
    title: 'Policy Updates',
    body:
      'We may update this policy when new paid plans launch. The latest version is always on our public URL below. Last updated: July 2026.',
  },
  {
    title: 'Contact',
    body: `Refund & billing: ${CONTACT_EMAIL}\nPublic policy: ${REFUND_POLICY_URL}`,
  },
];

export default function RefundPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <FixedBackBar />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Refund Policy</Text>
            <Text style={styles.subtitle}>Last updated: July 2026</Text>
            <TouchableOpacity
              style={styles.publicLink}
              onPress={() => Linking.openURL(REFUND_POLICY_URL)}
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
