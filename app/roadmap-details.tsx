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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: roadmap.backgroundImage }}
            style={styles.heroBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            >
              {/* Back Button */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              {/* Roadmap Info - Better positioned */}
              <View style={styles.roadmapInfoFixed}>
                <Text style={styles.roadmapTitleFixed}>{roadmap.title}</Text>
                <Text style={styles.roadmapDescriptionFixed}>{roadmap.description}</Text>
                <View style={styles.roadmapMetaFixed}>
                  <View style={styles.metaItemFixed}>
                    <Text style={styles.metaIconFixed}>⏱️</Text>
                    <Text style={styles.metaTextFixed}>{roadmap.duration}</Text>
                  </View>
                  <View style={styles.metaItemFixed}>
                    <Text style={styles.metaIconFixed}>📊</Text>
                    <Text style={styles.metaTextFixed}>{roadmap.level}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Learning Path Steps */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Learning Path</Text>
          <Text style={styles.sectionSubtitle}>
            Follow these steps to master {roadmap.title}
          </Text>

          {roadmap.steps.map((step, index) => (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <TouchableOpacity
                  style={styles.stepCompletionButton}
                  onPress={() => toggleStepCompletion(step.id)}
                >
                  <Text style={styles.stepCompletionIcon}>○</Text>
                </TouchableOpacity>
                <Text style={styles.stepTitle}>{`${index + 1}. ${step.title}`}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
              <View style={styles.stepMeta}>
                <Text style={styles.stepDuration}>⏱️ {step.duration}</Text>
              </View>
              <View style={styles.topicsContainer}>
                {step.topics.map((topic, topicIndex) => (
                  <Text key={topicIndex} style={styles.topicText}>
                    • {topic}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Prerequisites Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Prerequisites</Text>
          <Text style={styles.sectionSubtitle}>
            What you should know before starting
          </Text>
          <View style={styles.prerequisitesCard}>
            <View style={styles.prerequisiteItem}>
              <Text style={styles.prerequisiteIcon}>📚</Text>
              <Text style={styles.prerequisiteText}>Basic programming knowledge</Text>
            </View>
            <View style={styles.prerequisiteItem}>
              <Text style={styles.prerequisiteIcon}>💻</Text>
              <Text style={styles.prerequisiteText}>Computer with internet connection</Text>
            </View>
            <View style={styles.prerequisiteItem}>
              <Text style={styles.prerequisiteIcon}>⏰</Text>
              <Text style={styles.prerequisiteText}>2-3 hours per week commitment</Text>
            </View>
            <View style={styles.prerequisiteItem}>
              <Text style={styles.prerequisiteIcon}>🎯</Text>
              <Text style={styles.prerequisiteText}>Motivation to learn and practice</Text>
            </View>
          </View>
        </View>

        {/* What You'll Learn Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <Text style={styles.sectionSubtitle}>
            Key skills and knowledge you'll gain
          </Text>
          <View style={styles.learningCard}>
            <View style={styles.learningItem}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Master the fundamentals and advanced concepts</Text>
            </View>
            <View style={styles.learningItem}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Build real-world projects and applications</Text>
            </View>
            <View style={styles.learningItem}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Understand best practices and industry standards</Text>
            </View>
            <View style={styles.learningItem}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Develop problem-solving and critical thinking skills</Text>
            </View>
            <View style={styles.learningItem}>
              <Text style={styles.learningIcon}>✅</Text>
              <Text style={styles.learningText}>Create a portfolio of completed projects</Text>
            </View>
          </View>
        </View>

        {/* Resources Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <Text style={styles.sectionSubtitle}>
            Helpful tools and materials to support your learning
          </Text>
          <View style={styles.resourcesCard}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>📖</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Documentation</Text>
                <Text style={styles.resourceDescription}>Official guides and references</Text>
              </View>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>🎥</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Video Tutorials</Text>
                <Text style={styles.resourceDescription}>Step-by-step video guides</Text>
              </View>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>💬</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Community Support</Text>
                <Text style={styles.resourceDescription}>Get help from other learners</Text>
              </View>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>🛠️</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Tools & Software</Text>
                <Text style={styles.resourceDescription}>Essential development tools</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Learning Tips</Text>
          <Text style={styles.sectionSubtitle}>
            Make the most of your learning journey
          </Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>1</Text>
              <Text style={styles.tipText}>Practice regularly - consistency is key to mastering any skill</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>2</Text>
              <Text style={styles.tipText}>Build projects as you learn - hands-on experience is invaluable</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>3</Text>
              <Text style={styles.tipText}>Join communities - connect with other learners and professionals</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>4</Text>
              <Text style={styles.tipText}>Don't rush - take time to understand concepts thoroughly</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.6,
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  roadmapInfo: {
    paddingBottom: 20,
  },
  roadmapTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  roadmapDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 15,
  },
  roadmapMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Fixed positioning for better layout
  roadmapInfoFixed: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    paddingBottom: 20,
  },
  roadmapTitleFixed: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  roadmapDescriptionFixed: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  roadmapMetaFixed: {
    flexDirection: 'row',
    gap: 25,
  },
  metaItemFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  metaIconFixed: {
    fontSize: 18,
  },
  metaTextFixed: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 22,
  },
  stepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCompletionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCompletionIcon: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 40,
  },
  stepMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 40,
  },
  stepDuration: {
    fontSize: 12,
    color: '#E50914',
    fontWeight: '600',
  },
  topicsContainer: {
    marginLeft: 40,
  },
  topicText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
    lineHeight: 18,
  },
  // Details Sections
  detailsSection: {
    padding: 20,
    paddingTop: 0,
  },
  // Prerequisites Section
  prerequisitesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  prerequisiteIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  prerequisiteText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
  // Learning Section
  learningCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  learningIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
    width: 20,
  },
  learningText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
  // Resources Section
  resourcesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resourceIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 40,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  // Tips Section
  tipsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tipNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
});