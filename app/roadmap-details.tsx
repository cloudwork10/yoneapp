import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';

const { width } = Dimensions.get('window');

interface RoadmapStep {
  _id?: string;
  title: string;
  description: string;
  resources: Array<{
    _id?: string;
    title: string;
    url: string;
    type: string;
  }>;
  completed: boolean;
}

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  steps: RoadmapStep[];
  image: string;
  icon: string;
  color: string;
  isFeatured: boolean;
  createdAt: string;
}

export default function RoadmapDetailsScreen() {
  const router = useRouter();
  const { roadmapId } = useLocalSearchParams();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roadmapId) {
      fetchRoadmap();
    }
  }, [roadmapId]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching roadmap:', roadmapId);
      
      const response = await fetch(`${API_BASE_URL}/api/public/roadmaps/${roadmapId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Roadmap received:', data);
        setRoadmap(data.data.roadmap);
      } else {
        console.error('❌ Failed to fetch roadmap:', response.status);
        setError('Failed to load roadmap');
      }
    } catch (error) {
      console.error('❌ Error fetching roadmap:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4ECDC4';
      case 'intermediate': return '#45B7D1';
      case 'advanced': return '#96CEB4';
      default: return '#9B59B6';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'course': return '🎓';
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'documentation': return '📚';
      case 'tool': return '🔧';
      default: return '🔗';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9B59B6" />
            <Text style={styles.loadingText}>Loading roadmap...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !roadmap) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>😞</Text>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>
              {error || 'Roadmap not found'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchRoadmap}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButtonHeader}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Roadmap Details</Text>
          </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground
              source={{ 
                uri: roadmap.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
              }}
              style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              style={styles.heroGradient}
              >
                <View style={styles.heroContent}>
                  <View style={styles.heroIcon}>
                    <Text style={styles.heroIconText}>{roadmap.icon}</Text>
                  </View>
                  <Text style={styles.heroTitle}>{roadmap.title}</Text>
                  <Text style={styles.heroDescription}>{roadmap.description}</Text>
                  
                  <View style={styles.heroMeta}>
                    <View style={[styles.metaBadge, { backgroundColor: getDifficultyColor(roadmap.difficulty) }]}>
                      <Text style={styles.metaBadgeText}>{roadmap.difficulty}</Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>{roadmap.duration}</Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>{roadmap.category}</Text>
                    </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

          {/* Steps Section */}
        <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>Learning Steps</Text>
            
            {roadmap.steps && roadmap.steps.length > 0 ? (
              <View style={styles.stepsContainer}>
                {roadmap.steps.map((step, index) => (
                  <View key={step._id || index} style={styles.stepItem}>
                    <View style={styles.stepNumberContainer}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      {index < roadmap.steps.length - 1 && (
                        <View style={styles.stepLine} />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>
                        {step.title || `Step ${index + 1}`}
          </Text>
                      {step.description && (
                        <Text style={styles.stepDescription}>{step.description}</Text>
                      )}
                      
                      {step.resources && step.resources.length > 0 && (
                        <View style={styles.resourcesContainer}>
                          <Text style={styles.resourcesTitle}>Resources:</Text>
                          {step.resources.map((resource, resourceIndex) => (
                <TouchableOpacity
                              key={resource._id || resourceIndex}
                              style={styles.resourceItem}
                              onPress={() => {
                                if (resource.url) {
                                  Alert.alert(
                                    'Open Resource',
                                    `Open ${resource.title}?`,
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      { text: 'Open', onPress: () => {
                                        // Here you would open the URL
                                        console.log('Opening:', resource.url);
                                      }}
                                    ]
                                  );
                                }
                              }}
                            >
                              <Text style={styles.resourceIcon}>
                                {getResourceIcon(resource.type)}
                              </Text>
                              <View style={styles.resourceContent}>
                                <Text style={styles.resourceTitle}>{resource.title}</Text>
                                <Text style={styles.resourceType}>{resource.type}</Text>
                              </View>
                              {resource.url && (
                                <Text style={styles.resourceArrow}>→</Text>
                              )}
                </TouchableOpacity>
                          ))}
                        </View>
                      )}
              </View>
              </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No steps available yet</Text>
                <Text style={styles.emptyStateSubtext}>Check back later for updates</Text>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  backButtonText: {
    color: '#9B59B6',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButtonHeader: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  heroIconText: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  heroDescription: {
    fontSize: 17,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  metaBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  stepsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  stepsContainer: {
    position: 'relative',
    paddingLeft: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    position: 'relative',
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: 20,
    width: 40,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stepLine: {
    width: 2,
    height: 60,
    backgroundColor: '#FF6B6B',
    marginTop: 8,
    opacity: 0.3,
    borderRadius: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 16,
  },
  resourcesContainer: {
    marginTop: 12,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444444',
  },
  resourceIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  resourceType: {
    fontSize: 13,
    color: '#999999',
    textTransform: 'capitalize',
  },
  resourceArrow: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
  },
});