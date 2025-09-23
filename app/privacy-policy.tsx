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

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>Last updated: January 2025</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔒 Information We Collect</Text>
              <Text style={styles.sectionText}>
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support:
                {'\n\n'}• Account information (name, email, password)
                {'\n'}• Profile information and preferences
                {'\n'}• Learning progress and course completion data
                {'\n'}• Device information and usage analytics
                {'\n'}• Communication data when you contact us
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 How We Use Your Information</Text>
              <Text style={styles.sectionText}>
                We use the information we collect to:
                {'\n\n'}• Provide, maintain, and improve our services
                {'\n'}• Personalize your learning experience
                {'\n'}• Track your progress and achievements
                {'\n'}• Send you notifications and updates
                {'\n'}• Respond to your comments and questions
                {'\n'}• Monitor and analyze usage patterns
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔐 Data Security</Text>
              <Text style={styles.sectionText}>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                {'\n\n'}• Encryption of data in transit and at rest
                {'\n'}• Secure authentication and authorization
                {'\n'}• Regular security audits and updates
                {'\n'}• Limited access to personal information
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍪 Cookies and Tracking</Text>
              <Text style={styles.sectionText}>
                We use cookies and similar tracking technologies to:
                {'\n\n'}• Remember your preferences and settings
                {'\n'}• Analyze how you use our app
                {'\n'}• Improve app performance and user experience
                {'\n'}• Provide personalized content and recommendations
                {'\n\n'}You can control cookie settings through your device preferences.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Analytics and Performance</Text>
              <Text style={styles.sectionText}>
                We use analytics tools to understand how our app is used and to improve performance:
                {'\n\n'}• App usage statistics and crash reports
                {'\n'}• Performance monitoring and optimization
                {'\n'}• User engagement metrics
                {'\n'}• Feature usage analytics
                {'\n\n'}This data is anonymized and used solely for improvement purposes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔔 Push Notifications</Text>
              <Text style={styles.sectionText}>
                We may send you push notifications for:
                {'\n\n'}• New content and course updates
                {'\n'}• Prayer time reminders (if enabled)
                {'\n'}• Learning progress updates
                {'\n'}• Important app announcements
                {'\n\n'}You can manage notification preferences in your device settings or within the app.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Third-Party Services</Text>
              <Text style={styles.sectionText}>
                We may use third-party services that collect information:
                {'\n\n'}• Analytics providers (Google Analytics, Firebase)
                {'\n'}• Cloud storage and database services
                {'\n'}• Authentication services
                {'\n'}• Content delivery networks
                {'\n\n'}These services have their own privacy policies and data practices.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌍 Data Location and Transfer</Text>
              <Text style={styles.sectionText}>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers, including:
                {'\n\n'}• Standard contractual clauses
                {'\n'}• Adequacy decisions by relevant authorities
                {'\n'}• Other appropriate legal mechanisms
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Your Rights</Text>
              <Text style={styles.sectionText}>
                You have the right to:
                {'\n\n'}• Access your personal information
                {'\n'}• Correct inaccurate or incomplete data
                {'\n'}• Delete your account and associated data
                {'\n'}• Object to processing of your data
                {'\n'}• Data portability
                {'\n'}• Withdraw consent at any time
                {'\n\n'}Contact us to exercise these rights.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👶 Children's Privacy</Text>
              <Text style={styles.sectionText}>
                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Policy Updates</Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📞 Contact Us</Text>
              <Text style={styles.sectionText}>
                If you have any questions about this Privacy Policy, please contact us:
                {'\n\n'}Email: privacy@yoneapp.com
                {'\n'}Website: www.yoneapp.com
                {'\n'}Response Time: Within 24-48 hours
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
