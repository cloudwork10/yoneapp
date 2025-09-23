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

export default function RefundPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Refund Policy</Text>
            <Text style={styles.subtitle}>Last updated: January 2025</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Free Service Policy</Text>
              <Text style={styles.sectionText}>
                YONE is a completely free learning platform. We do not charge any fees for using our services, accessing content, or creating accounts. Since our service is free, there are no payments to refund.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Future Premium Features</Text>
              <Text style={styles.sectionText}>
                In the future, we may introduce premium features or subscriptions. If and when we do, this refund policy will be updated to include specific terms for paid services. We will notify users of any changes to our pricing structure.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 App Store Purchases</Text>
              <Text style={styles.sectionText}>
                If you make any in-app purchases through the App Store or Google Play Store, refunds are subject to the respective platform's refund policies:
                {'\n\n'}• Apple App Store: Contact Apple Support
                {'\n'}• Google Play Store: Contact Google Play Support
                {'\n\n'}YONE does not control these third-party refund processes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔄 Service Availability</Text>
              <Text style={styles.sectionText}>
                While we strive to maintain 100% uptime, we cannot guarantee uninterrupted service. Temporary service interruptions do not qualify for refunds since our service is free. We work diligently to resolve any technical issues promptly.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📧 Contact for Issues</Text>
              <Text style={styles.sectionText}>
                If you experience any issues with the app or have concerns about our service, please contact us at:
                {'\n\n'}Email: support@yoneapp.com
                {'\n'}We will work to resolve any problems and improve your experience.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚖️ Policy Changes</Text>
              <Text style={styles.sectionText}>
                We reserve the right to modify this refund policy at any time. Changes will be posted on this page with an updated revision date. Continued use of the service after changes constitutes acceptance of the new policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤝 User Satisfaction</Text>
              <Text style={styles.sectionText}>
                Our goal is to provide the best possible learning experience. If you're not satisfied with our service, please let us know so we can improve. We value your feedback and are committed to making YONE better for all users.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📞 Support Contact</Text>
              <Text style={styles.sectionText}>
                For any questions about this refund policy or our services, please contact us:
                {'\n\n'}Email: support@yoneapp.com
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
