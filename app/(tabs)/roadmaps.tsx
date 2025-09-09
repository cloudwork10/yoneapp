import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ImageBackground,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RoadmapsScreen() {
  const router = useRouter();
  
  const roadmaps = [
    { 
      id: 1, 
      title: 'Frontend Developer', 
      description: 'Master HTML, CSS, JavaScript, React, and modern frontend technologies',
      progress: 65,
      totalSteps: 20,
      completedSteps: 13,
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FF6B6B',
      icon: '🎨',
      duration: '6 months',
      level: 'Beginner to Advanced'
    },
    { 
      id: 2, 
      title: 'Backend Developer', 
      description: 'Learn Node.js, databases, APIs, and server-side development',
      progress: 40,
      totalSteps: 25,
      completedSteps: 10,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#4ECDC4',
      icon: '⚙️',
      duration: '8 months',
      level: 'Intermediate'
    },
    { 
      id: 3, 
      title: 'Full Stack Developer', 
      description: 'Complete end-to-end development with frontend and backend skills',
      progress: 30,
      totalSteps: 35,
      completedSteps: 10,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#45B7D1',
      icon: '🚀',
      duration: '12 months',
      level: 'Advanced'
    },
    { 
      id: 4, 
      title: 'Mobile Developer', 
      description: 'Build iOS and Android apps with React Native and Flutter',
      progress: 80,
      totalSteps: 15,
      completedSteps: 12,
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#96CEB4',
      icon: '📱',
      duration: '4 months',
      level: 'Beginner'
    },
    { 
      id: 5, 
      title: 'DevOps Engineer', 
      description: 'Master cloud platforms, CI/CD, and infrastructure automation',
      progress: 20,
      totalSteps: 30,
      completedSteps: 6,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FFEAA7',
      icon: '☁️',
      duration: '10 months',
      level: 'Expert'
    },
    { 
      id: 6, 
      title: 'Data Scientist', 
      description: 'Learn Python, machine learning, and data analysis',
      progress: 15,
      totalSteps: 28,
      completedSteps: 4,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#DDA0DD',
      icon: '📊',
      duration: '9 months',
      level: 'Advanced'
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Learning Roadmaps</Text>
            <Text style={styles.subtitle}>Choose your path to success</Text>
          </View>

          {/* Featured Roadmap */}
          <View style={styles.featuredSection}>
            <Text style={styles.featuredTitle}>Featured Roadmap</Text>
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => router.push(`/roadmap-details?roadmapId=${roadmaps[0].id}`)}
            >
              <ImageBackground
                source={{ uri: roadmaps[0].image }}
                style={styles.featuredImage}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>FEATURED</Text>
                    </View>
                    <Text style={styles.featuredTitleText}>{roadmaps[0].title}</Text>
                    <Text style={styles.featuredDescription}>{roadmaps[0].description}</Text>
                    <View style={styles.featuredMeta}>
                      <View style={styles.featuredMetaItem}>
                        <Text style={styles.featuredMetaIcon}>{roadmaps[0].icon}</Text>
                        <Text style={styles.featuredMetaText}>{roadmaps[0].level}</Text>
                      </View>
                      <View style={styles.featuredMetaItem}>
                        <Text style={styles.featuredMetaIcon}>⏱️</Text>
                        <Text style={styles.featuredMetaText}>{roadmaps[0].duration}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* All Roadmaps */}
          <View style={styles.roadmapsSection}>
            <Text style={styles.sectionTitle}>All Roadmaps</Text>
            <View style={styles.roadmapsContainer}>
              {roadmaps.map((roadmap) => (
                <TouchableOpacity 
                  key={roadmap.id} 
                  style={styles.roadmapCard}
                  onPress={() => router.push(`/roadmap-details?roadmapId=${roadmap.id}`)}
                >
                  <View style={styles.roadmapImageContainer}>
                    <ImageBackground
                      source={{ uri: roadmap.image }}
                      style={styles.roadmapImage}
                      resizeMode="cover"
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                        style={styles.roadmapImageGradient}
                      >
                        <View style={styles.roadmapIcon}>
                          <Text style={styles.roadmapIconText}>{roadmap.icon}</Text>
                        </View>
                        <View style={styles.roadmapProgressContainer}>
                          <Text style={styles.roadmapProgressText}>{roadmap.progress}%</Text>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </View>
                  
                  <View style={styles.roadmapContent}>
                    <View style={styles.roadmapHeader}>
                      <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
                      <View style={[styles.roadmapLevelBadge, { backgroundColor: roadmap.color }]}>
                        <Text style={styles.roadmapLevelText}>{roadmap.level}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.roadmapDescription}>{roadmap.description}</Text>
                    
                    <View style={styles.roadmapMeta}>
                      <View style={styles.roadmapMetaItem}>
                        <Text style={styles.roadmapMetaIcon}>⏱️</Text>
                        <Text style={styles.roadmapMetaText}>{roadmap.duration}</Text>
                      </View>
                      <View style={styles.roadmapMetaItem}>
                        <Text style={styles.roadmapMetaIcon}>📚</Text>
                        <Text style={styles.roadmapMetaText}>{roadmap.totalSteps} steps</Text>
                      </View>
                    </View>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${roadmap.progress}%`, backgroundColor: roadmap.color }
                          ]} 
                        />
                      </View>
                      <Text style={styles.stepsText}>
                        {roadmap.completedSteps} of {roadmap.totalSteps} completed
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
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
    padding: 20,
  },
  // Header Styles
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  // Featured Section
  featuredSection: {
    marginBottom: 30,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  featuredCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuredImage: {
    flex: 1,
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredContent: {
    gap: 8,
  },
  featuredBadge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuredTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaIcon: {
    fontSize: 14,
  },
  featuredMetaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  // Roadmaps Section
  roadmapsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  roadmapsContainer: {
    gap: 16,
  },
  roadmapCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  roadmapImageContainer: {
    height: 120,
  },
  roadmapImage: {
    flex: 1,
  },
  roadmapImageGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  roadmapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadmapIconText: {
    fontSize: 20,
  },
  roadmapProgressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roadmapProgressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roadmapContent: {
    padding: 16,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  roadmapLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roadmapLevelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  roadmapDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  roadmapMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  roadmapMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roadmapMetaIcon: {
    fontSize: 12,
  },
  roadmapMetaText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepsText: {
    fontSize: 11,
    color: '#999999',
  },
});
