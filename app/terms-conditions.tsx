import { LinearGradient } from 'expo-linear-gradient';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from '../components/FixedBackBar';
import { CONTACT_EMAIL, PRIVACY_POLICY_URL, TERMS_URL } from '../config/legal';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body:
      'By using the ELNADY mobile application, you agree to these Terms & Conditions. ' +
      'If you do not agree, please do not use the app.',
  },
  {
    title: '2. The Service',
    body:
      'ELNADY provides:\n\n' +
      '• Educational courses and learning content\n' +
      '• Tech news and reels\n' +
      '• Job board with in-app applications\n' +
      '• Community / club features\n' +
      '• User accounts and admin tools',
  },
  {
    title: '3. Your Account',
    body:
      '• You must provide accurate registration information\n' +
      '• You are responsible for your password and account activity\n' +
      '• Do not share your account with others\n' +
      '• We may suspend or delete accounts that violate these terms',
  },
  {
    title: '4. Content & Intellectual Property',
    body:
      'ELNADY content (text, video, images, logos, software) is owned by ELNADY or licensed to us. ' +
      'You may not copy, resell, or redistribute it without written permission. ' +
      'Some videos may be hosted on third-party platforms (YouTube, Vimeo) subject to their terms.',
  },
  {
    title: '5. User-Generated Content',
    body:
      'When you upload content (images, videos, CVs, job posts):\n\n' +
      '• You confirm you have the right to publish it\n' +
      '• You must not upload illegal, abusive, or infringing content\n' +
      '• You grant ELNADY a license to store and display it to operate the service\n' +
      '• We may remove content that violates these terms',
  },
  {
    title: '6. Jobs & Applications',
    body:
      '• Job applications are processed in-app\n' +
      '• Job posters see applicants and CVs for their own listings only\n' +
      '• ELNADY is a technical platform and does not guarantee hiring outcomes\n' +
      '• You are responsible for the accuracy of your CV and application data',
  },
  {
    title: '7. Prohibited Uses',
    body:
      'You may not use ELNADY for:\n\n' +
      '• Illegal activity or fraud\n' +
      '• Harassment, hate speech, or abuse\n' +
      '• Unauthorized access or hacking attempts\n' +
      '• Misinformation or impersonation\n' +
      '• Commercial exploitation of content without permission',
  },
  {
    title: '8. Subscriptions & Payments',
    body:
      'Some features or courses may require payment. Pricing and subscription terms shown in the app apply when payments are enabled.',
  },
  {
    title: '9. Privacy Policy',
    body: `Your use is also governed by our Privacy Policy:\n${PRIVACY_POLICY_URL}`,
  },
  {
    title: '10. Termination',
    body:
      'We may modify or discontinue parts of the service for maintenance or improvement. ' +
      'We may terminate your account immediately for violations of these terms.',
  },
  {
    title: '11. Disclaimer',
    body:
      'The app is provided "as is". We do not guarantee error-free or uninterrupted service. ' +
      'Educational content is for general learning and is not professional or legal advice.',
  },
  {
    title: '12. Limitation of Liability',
    body:
      'ELNADY is not liable for indirect damages arising from use of the app, including loss of data, ' +
      'job opportunities, or profits, to the extent permitted by applicable law.',
  },
  {
    title: '13. Changes to Terms',
    body:
      'We may update these terms. The latest version is always available at our public URL below. ' +
      'Continued use after updates means you accept the revised terms. Last updated: July 2026.',
  },
  {
    title: '14. Contact',
    body: `Email: ${CONTACT_EMAIL}\nPublic terms: ${TERMS_URL}`,
  },
];

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <FixedBackBar />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Terms & Conditions</Text>
            <Text style={styles.subtitle}>Last updated: July 2026</Text>
            <TouchableOpacity
              style={styles.publicLink}
              onPress={() => Linking.openURL(TERMS_URL)}
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
