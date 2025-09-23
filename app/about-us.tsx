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

export default function AboutUsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>About Us</Text>
            <Text style={styles.subtitle}>Meet the YONE team</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Y</Text>
            </View>
            <Text style={styles.appName}>YONE</Text>
            <Text style={styles.appTagline}>Your Learning Companion</Text>
            <Text style={styles.appDescription}>
              Empowering developers worldwide with comprehensive learning resources, 
              expert guidance, and innovative educational tools.
            </Text>
          </View>

          {/* Our Story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 Our Story</Text>
            <Text style={styles.sectionText}>
              YONE was born from a simple yet powerful vision: to democratize programming education 
              and make quality learning resources accessible to everyone, regardless of their background 
              or experience level.
              {'\n\n'}
              Founded in 2025 by a team of passionate developers and educators, we believe that 
              with the right guidance, tools, and community support, anyone can become a successful 
              developer and contribute to the tech world.
            </Text>
          </View>

          {/* Our Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
            <Text style={styles.sectionText}>
              To provide a comprehensive, accessible, and engaging learning platform that empowers 
              individuals to master programming skills, advance their careers, and contribute to 
              the global technology community.
              {'\n\n'}
              We're committed to breaking down barriers to tech education and creating opportunities 
              for learners from all walks of life.
            </Text>
          </View>

          {/* Our Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💎 Our Values</Text>
            
            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>🎓</Text>
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Quality Education</Text>
                <Text style={styles.valueDescription}>
                  We provide high-quality, up-to-date content created by industry experts
                </Text>
              </View>
            </View>

            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>🌍</Text>
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Accessibility</Text>
                <Text style={styles.valueDescription}>
                  Making programming education accessible to everyone, everywhere
                </Text>
              </View>
            </View>

            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>🤝</Text>
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Community</Text>
                <Text style={styles.valueDescription}>
                  Building a supportive community of learners and mentors
                </Text>
              </View>
            </View>

            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>🚀</Text>
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Innovation</Text>
                <Text style={styles.valueDescription}>
                  Continuously improving and innovating our learning experience
                </Text>
              </View>
            </View>
          </View>

          {/* Team Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Our Team</Text>
            <Text style={styles.sectionText}>
              YONE is built by a diverse team of passionate individuals who share a common goal: 
              making programming education better for everyone.
              {'\n\n'}
              Our team includes:
              {'\n\n'}• Experienced software developers and engineers
              {'\n'}• Professional educators and curriculum designers
              {'\n'}• UX/UI designers focused on learning experience
              {'\n'}• Community managers and support specialists
              {'\n'}• Content creators and technical writers
            </Text>
          </View>

          {/* Technology */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Technology</Text>
            <Text style={styles.sectionText}>
              YONE is built using modern, cutting-edge technologies to ensure the best possible 
              user experience:
              {'\n\n'}• React Native for cross-platform mobile development
              {'\n'}• Node.js and Express for robust backend services
              {'\n'}• MongoDB for scalable data storage
              {'\n'}• Real-time notifications and updates
              {'\n'}• Advanced analytics and progress tracking
              {'\n'}• Secure authentication and data protection
            </Text>
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Our Achievements</Text>
            
            <View style={styles.achievementItem}>
              <Text style={styles.achievementNumber}>10K+</Text>
              <Text style={styles.achievementText}>Active Learners</Text>
            </View>

            <View style={styles.achievementItem}>
              <Text style={styles.achievementNumber}>500+</Text>
              <Text style={styles.achievementText}>Learning Resources</Text>
            </View>

            <View style={styles.achievementItem}>
              <Text style={styles.achievementNumber}>50+</Text>
              <Text style={styles.achievementText}>Expert Contributors</Text>
            </View>

            <View style={styles.achievementItem}>
              <Text style={styles.achievementNumber}>99%</Text>
              <Text style={styles.achievementText}>User Satisfaction</Text>
            </View>
          </View>

          {/* Future Vision */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔮 Our Future Vision</Text>
            <Text style={styles.sectionText}>
              We're constantly working on new features and improvements:
              {'\n\n'}• AI-powered personalized learning paths
              {'\n'}• Live coding sessions and workshops
              {'\n'}• Advanced project-based learning
              {'\n'}• Industry partnerships and certifications
              {'\n'}• Global community events and hackathons
              {'\n'}• Mobile-first learning experiences
              {'\n\n'}
              Our goal is to become the world's leading platform for programming education.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 Get in Touch</Text>
            <Text style={styles.sectionText}>
              We'd love to hear from you! Whether you have feedback, suggestions, or just want 
              to say hello, we're here to listen.
              {'\n\n'}
              Email: team@yoneapp.com
              {'\n'}Website: www.yoneapp.com
              {'\n'}Social Media: @yoneapp
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Thank you for being part of the YONE community! 🚀
            </Text>
            <Text style={styles.footerSubtext}>
              Together, we're building the future of programming education
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  appDescription: {
    fontSize: 15,
    color: '#E8E8E8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E50914',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 15,
    color: '#E8E8E8',
    lineHeight: 24,
    fontWeight: '400',
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  valueIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  valueDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  achievementItem: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  achievementNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  achievementText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
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
