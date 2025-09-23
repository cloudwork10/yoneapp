import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Terms & Conditions</Text>
            <Text style={styles.subtitle}>Last updated: January 2025</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.sectionText}>
                By accessing and using the YONE mobile application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Use License</Text>
              <Text style={styles.sectionText}>
                Permission is granted to temporarily download one copy of YONE for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                {'\n\n'}• Modify or copy the materials
                {'\n'}• Use the materials for any commercial purpose or for any public display
                {'\n'}• Attempt to reverse engineer any software contained in the application
                {'\n'}• Remove any copyright or other proprietary notations from the materials
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.sectionText}>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Content and Intellectual Property</Text>
              <Text style={styles.sectionText}>
                All content, including but not limited to text, graphics, logos, images, audio clips, video, and software, is the property of YONE or its content suppliers and is protected by copyright laws. You may not reproduce, distribute, or create derivative works from any content without express written permission.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
              <Text style={styles.sectionText}>
                You may not use our service:
                {'\n\n'}• For any unlawful purpose or to solicit others to perform unlawful acts
                {'\n'}• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
                {'\n'}• To infringe upon or violate our intellectual property rights or the intellectual property rights of others
                {'\n'}• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
                {'\n'}• To submit false or misleading information
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
              <Text style={styles.sectionText}>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Termination</Text>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Disclaimer</Text>
              <Text style={styles.sectionText}>
                The information on this application is provided on an "as is" basis. To the fullest extent permitted by law, YONE excludes all representations, warranties, conditions and terms relating to our application and the use of this application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
              <Text style={styles.sectionText}>
                In no event shall YONE, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Governing Law</Text>
              <Text style={styles.sectionText}>
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which YONE operates, without regard to its conflict of law provisions.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
              <Text style={styles.sectionText}>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Contact Information</Text>
              <Text style={styles.sectionText}>
                If you have any questions about these Terms & Conditions, please contact us at:
                {'\n\n'}Email: legal@yoneapp.com
                {'\n'}Website: www.yoneapp.com
              </Text>
            </View>
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
