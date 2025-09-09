import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ImageBackground,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function RoadmapDetailsScreen() {
  const router = useRouter();
  const { roadmapId } = useLocalSearchParams();

  // Sample roadmap data
  const roadmap = {
    id: roadmapId || '1',
    title: 'React Native Developer Roadmap',
    description: 'Complete guide to become a React Native developer from beginner to expert',
    duration: '2 hours',
    level: 'Beginner to Advanced',
    backgroundImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    steps: [
      {
        id: '1',
        title: 'Learn JavaScript Fundamentals',
        description: 'Master the basics of JavaScript including variables, functions, objects, and ES6+ features',
        duration: '2 weeks',
        completed: false,
        topics: ['Variables & Data Types', 'Functions & Scope', 'Objects & Arrays', 'ES6+ Features']
      },
      {
        id: '2',
        title: 'Understand React Basics',
        description: 'Learn React concepts like components, props, state, and lifecycle methods',
        duration: '3 weeks',
        completed: false,
        topics: ['Components & JSX', 'Props & State', 'Event Handling', 'Lifecycle Methods']
      },
      {
        id: '3',
        title: 'React Native Fundamentals',
        description: 'Get started with React Native development environment and basic components',
        duration: '2 weeks',
        completed: false,
        topics: ['Development Environment', 'Core Components', 'Styling', 'Navigation']
      },
      {
        id: '4',
        title: 'State Management',
        description: 'Learn how to manage application state effectively',
        duration: '3 weeks',
        completed: false,
        topics: ['Context API', 'Redux', 'Zustand', 'Local State']
      },
      {
        id: '5',
        title: 'API Integration',
        description: 'Connect your app to backend services and handle data',
        duration: '2 weeks',
        completed: false,
        topics: ['REST APIs', 'GraphQL', 'Authentication', 'Error Handling']
      },
      {
        id: '6',
        title: 'Testing',
        description: 'Write tests to ensure your app works correctly',
        duration: '2 weeks',
        completed: false,
        topics: ['Unit Tests', 'Integration Tests', 'E2E Tests', 'Testing Tools']
      },
      {
        id: '7',
        title: 'Performance Optimization',
        description: 'Make your app fast and efficient',
        duration: '2 weeks',
        completed: false,
        topics: ['Performance Monitoring', 'Memory Management', 'Bundle Optimization', 'Lazy Loading']
      },
      {
        id: '8',
        title: 'Deployment',
        description: 'Publish your app to app stores',
        duration: '2 weeks',
        completed: false,
        topics: ['App Store', 'Google Play', 'Code Signing', 'Release Management']
      }
    ]
  };

  const toggleStepCompletion = (stepId: string) => {
    // In a real app, you would update the completion status
    console.log(`Toggle step ${stepId} completion`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Udemy Style */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: roadmap.backgroundImage }}
            style={styles.heroBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
              style={styles.heroGradient}
            >
              {/* Header Bar */}
              <View style={styles.headerBar}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>📤</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>❤️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hero Content */}
              <View style={styles.heroContent}>
                <View style={styles.badgeContainer}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>ROADMAP</Text>
                  </View>
                </View>
                
                <Text style={styles.heroTitle}>{roadmap.title}</Text>
                <Text style={styles.heroDescription}>{roadmap.description}</Text>
                
                <View style={styles.heroMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⭐</Text>
                    <Text style={styles.metaText}>4.8 (2,847 ratings)</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>👥</Text>
                    <Text style={styles.metaText}>15,234 students</Text>
                  </View>
                </View>

                <View style={styles.heroStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>8</Text>
                    <Text style={styles.statLabel}>Modules</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>2h</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>Beginner</Text>
                    <Text style={styles.statLabel}>Level</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Course Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What you'll learn</Text>
            <Text style={styles.sectionSubtitle}>Master these key concepts</Text>
          </View>

          <View style={styles.learningPoints}>
            <View style={styles.learningPoint}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Build complete React Native applications</Text>
            </View>
            <View style={styles.learningPoint}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Master state management with Redux</Text>
            </View>
            <View style={styles.learningPoint}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Integrate APIs and handle data</Text>
            </View>
            <View style={styles.learningPoint}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Deploy apps to app stores</Text>
            </View>
          </View>
        </View>

        {/* Curriculum Section */}
        <View style={styles.curriculumSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Curriculum</Text>
            <Text style={styles.sectionSubtitle}>8 modules • 2 hours total</Text>
          </View>

          {roadmap.steps.map((step, index) => (
            <View key={step.id} style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <View style={styles.moduleNumber}>
                  <Text style={styles.moduleNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{step.title}</Text>
                  <Text style={styles.moduleDescription}>{step.description}</Text>
                  <View style={styles.moduleMeta}>
                    <Text style={styles.moduleDuration}>⏱️ {step.duration}</Text>
                    <Text style={styles.moduleLessons}>📚 {step.topics.length} lessons</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.expandButton}>
                  <Text style={styles.expandIcon}>▼</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.lessonsList}>
                {step.topics.map((topic, topicIndex) => (
                  <View key={topicIndex} style={styles.lessonItem}>
                    <View style={styles.lessonIcon}>
                      <Text style={styles.lessonIconText}>▶</Text>
                    </View>
                    <Text style={styles.lessonTitle}>{topic}</Text>
                    <Text style={styles.lessonDuration}>5:30</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Instructor Section */}
        <View style={styles.instructorSection}>
          <Text style={styles.sectionTitle}>Your Instructor</Text>
          <View style={styles.instructorCard}>
            <View style={styles.instructorAvatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>John Developer</Text>
              <Text style={styles.instructorTitle}>Senior React Native Developer</Text>
              <Text style={styles.instructorBio}>
                With 8+ years of experience in mobile development, John has built apps used by millions of users worldwide.
              </Text>
              <View style={styles.instructorStats}>
                <View style={styles.instructorStat}>
                  <Text style={styles.instructorStatNumber}>4.8</Text>
                  <Text style={styles.instructorStatLabel}>Instructor Rating</Text>
                </View>
                <View style={styles.instructorStat}>
                  <Text style={styles.instructorStatNumber}>15,234</Text>
                  <Text style={styles.instructorStatLabel}>Students</Text>
                </View>
                <View style={styles.instructorStat}>
                  <Text style={styles.instructorStatNumber}>8</Text>
                  <Text style={styles.instructorStatLabel}>Courses</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Ready to start your journey?</Text>
            <Text style={styles.ctaDescription}>
              Join thousands of students who have already mastered React Native development
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Start Learning Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  // Hero Section - Udemy Style
  heroSection: {
    height: height * 0.7,
    position: 'relative',
  },
  heroBackground: {
    flex: 1,
    resizeMode: 'cover',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  badgeContainer: {
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#A435F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 20,
    opacity: 0.9,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  // Content Sections
  contentSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  curriculumSection: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  instructorSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  ctaSection: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1D1F',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6A6F73',
  },
  // Learning Points
  learningPoints: {
    gap: 12,
  },
  learningPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  learningIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  learningText: {
    fontSize: 16,
    color: '#1C1D1F',
    lineHeight: 24,
    flex: 1,
  },
  // Module Cards
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D7DC',
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A435F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1D1F',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#6A6F73',
    lineHeight: 20,
    marginBottom: 8,
  },
  moduleMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  moduleDuration: {
    fontSize: 12,
    color: '#6A6F73',
  },
  moduleLessons: {
    fontSize: 12,
    color: '#6A6F73',
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 12,
    color: '#6A6F73',
  },
  // Lessons List
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: '#D1D7DC',
    padding: 16,
    paddingTop: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  lessonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F7F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonIconText: {
    fontSize: 10,
    color: '#6A6F73',
  },
  lessonTitle: {
    fontSize: 14,
    color: '#1C1D1F',
    flex: 1,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6A6F73',
  },
  // Instructor Section
  instructorCard: {
    flexDirection: 'row',
    gap: 16,
  },
  instructorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A435F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1D1F',
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 16,
    color: '#6A6F73',
    marginBottom: 12,
  },
  instructorBio: {
    fontSize: 14,
    color: '#1C1D1F',
    lineHeight: 20,
    marginBottom: 16,
  },
  instructorStats: {
    flexDirection: 'row',
    gap: 20,
  },
  instructorStat: {
    alignItems: 'center',
  },
  instructorStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1D1F',
    marginBottom: 2,
  },
  instructorStatLabel: {
    fontSize: 12,
    color: '#6A6F73',
  },
  // CTA Section
  ctaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D7DC',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    color: '#6A6F73',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#A435F0',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});