import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import { RoadmapCardSkeleton } from '../../components/SkeletonLoader';
import API_BASE_URL from '../../config/api';

const { width } = Dimensions.get('window');

interface Roadmap {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  icon?: string;
  difficulty?: string;
  duration?: string;
  color?: string;
  steps?: any[];
}

export default function RoadmapsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const categories = [
    { id: 'All', name: 'All', icon: '🌟' },
    { id: 'Frontend', name: 'Frontend', icon: '💻' },
    { id: 'Backend', name: 'Backend', icon: '⚙️' },
    { id: 'Full Stack', name: 'Full Stack', icon: '🔄' },
    { id: 'Mobile', name: 'Mobile', icon: '📱' },
    { id: 'DevOps', name: 'DevOps', icon: '🔧' },
    { id: 'Data Science', name: 'Data Science', icon: '📊' },
    { id: 'AI/ML', name: 'AI/ML', icon: '🤖' },
  ];

  // Refresh roadmaps when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Roadmaps screen focused, refreshing data...');
      fetchRoadmaps();
    }, [])
  );

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      console.log('🗺️ Fetching roadmaps...');
      
      // Show loading for at least 1.5 seconds for better UX
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/api/public/roadmaps`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Roadmaps received:', data);
        console.log('📊 Roadmaps count:', data.data.roadmaps?.length || 0);
        console.log('🔍 First roadmap:', data.data.roadmaps?.[0]);
        
        // Ensure minimum loading time for better UX
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);
        
        setTimeout(() => {
          setRoadmaps(data.data.roadmaps || []);
          setLoading(false);
        }, remainingTime);
      } else {
        console.error('❌ Failed to fetch roadmaps:', response.status);
        // Fallback data
        setTimeout(() => {
          setRoadmaps([]);
          setLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error fetching roadmaps:', error);
      // Fallback data
      setTimeout(() => {
        setRoadmaps([]);
        setLoading(false);
      }, 1500);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoadmaps();
    setRefreshing(false);
  };

  // Fallback roadmaps data
  const fallbackRoadmaps = [
    { 
      id: 1, 
      title: 'Frontend Developer', 
      description: 'Master HTML, CSS, JavaScript, React, and modern frontend technologies',
      totalSteps: 20,
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FF6B6B',
      icon: '🎨',
      duration: '6 months',
      level: 'Beginner to Advanced',
      category: 'programming'
    },
    { 
      id: 2, 
      title: 'Backend Developer', 
      description: 'Learn Node.js, databases, APIs, and server-side development',
      totalSteps: 25,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#4ECDC4',
      icon: '⚙️',
      duration: '8 months',
      level: 'Intermediate',
      category: 'programming'
    },
    { 
      id: 3, 
      title: 'Full Stack Developer', 
      description: 'Complete end-to-end development with frontend and backend skills',
      totalSteps: 35,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#45B7D1',
      icon: '🚀',
      duration: '12 months',
      level: 'Advanced',
      category: 'programming'
    },
    { 
      id: 4, 
      title: 'Mobile Developer', 
      description: 'Build iOS and Android apps with React Native and Flutter',
      totalSteps: 15,
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#96CEB4',
      icon: '📱',
      duration: '4 months',
      level: 'Beginner',
      category: 'programming'
    },
    { 
      id: 5, 
      title: 'DevOps Engineer', 
      description: 'Master cloud platforms, CI/CD, and infrastructure automation',
      totalSteps: 30,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FFEAA7',
      icon: '☁️',
      duration: '10 months',
      level: 'Expert',
      category: 'programming'
    },
    { 
      id: 6, 
      title: 'Data Scientist', 
      description: 'Learn Python, machine learning, and data analysis',
      totalSteps: 28,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#DDA0DD',
      icon: '📊',
      duration: '9 months',
      level: 'Advanced',
      category: 'programming'
    },
    { 
      id: 7, 
      title: 'UI/UX Designer', 
      description: 'Master user interface and user experience design principles',
      totalSteps: 18,
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FF9F43',
      icon: '🎨',
      duration: '5 months',
      level: 'Beginner to Advanced',
      category: 'design'
    },
    { 
      id: 8, 
      title: 'Graphic Designer', 
      description: 'Learn Adobe Creative Suite and visual design fundamentals',
      totalSteps: 16,
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#6C5CE7',
      icon: '🖼️',
      duration: '4 months',
      level: 'Beginner',
      category: 'design'
    },
    { 
      id: 9, 
      title: 'Digital Marketing', 
      description: 'Master SEO, social media, and online advertising strategies',
      totalSteps: 22,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#00B894',
      icon: '📈',
      duration: '6 months',
      level: 'Intermediate',
      category: 'marketing'
    },
    { 
      id: 10, 
      title: 'Content Marketing', 
      description: 'Learn content strategy, copywriting, and brand storytelling',
      totalSteps: 14,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#E17055',
      icon: '✍️',
      duration: '3 months',
      level: 'Beginner',
      category: 'marketing'
    },
    { 
      id: 11, 
      title: 'Freelance Web Developer', 
      description: 'Build a successful freelance web development business',
      totalSteps: 20,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#A29BFE',
      icon: '💼',
      duration: '7 months',
      level: 'Intermediate',
      category: 'freelancing'
    },
    { 
      id: 12, 
      title: 'Freelance Designer', 
      description: 'Start and grow your freelance design business',
      totalSteps: 17,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FD79A8',
      icon: '🎨',
      duration: '5 months',
      level: 'Beginner',
      category: 'freelancing'
    },
    { 
      id: 13, 
      title: 'Career Starter', 
      description: 'Essential skills to kickstart your professional career',
      totalSteps: 12,
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FDCB6E',
      icon: '🚀',
      duration: '2 months',
      level: 'Beginner',
      category: 'career'
    },
  ];

  // Filter roadmaps based on search and category
  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         roadmap.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || roadmap.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  console.log('🔍 Filtered roadmaps:', filteredRoadmaps.length, 'out of', roadmaps.length);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading roadmaps...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#9B59B6']}
              tintColor="#9B59B6"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Learning Roadmaps</Text>
            <Text style={styles.subtitle}>Choose your path to success</Text>
          </View>

          {/* Empty State */}
          {roadmaps.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No roadmaps found</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new learning paths</Text>
            </View>
          )}

          {/* Featured Roadmap */}
          {roadmaps.length > 0 && (
            <View style={styles.featuredSection}>
              <Text style={styles.featuredTitle}>Featured Roadmap</Text>
              <TouchableOpacity 
                style={styles.featuredCard}
                onPress={() => router.push(`/roadmap-details?roadmapId=${roadmaps[0]._id || roadmaps[0].id}`)}
            >
              <ImageBackground
                source={{ 
                  uri: roadmaps[0].image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                }}
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
                        <Text style={styles.featuredMetaIcon}>{roadmaps[0].icon || '🗺️'}</Text>
                        <Text style={styles.featuredMetaText}>{roadmaps[0].difficulty || 'Beginner'}</Text>
                      </View>
                      <View style={styles.featuredMetaItem}>
                        <Text style={styles.featuredMetaIcon}>⏱️</Text>
                        <Text style={styles.featuredMetaText}>{roadmaps[0].duration || '6 months'}</Text>
                      </View>
                      <View style={styles.featuredMetaItem}>
                        <Text style={styles.featuredMetaIcon}>📊</Text>
                        <Text style={styles.featuredMetaText}>{roadmaps[0].steps?.length || 0} steps</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>
          )}

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search roadmaps..."
                placeholderTextColor="#666666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScrollView}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={`roadmap-category-${category.id}`}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.name && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* All Roadmaps */}
          <View style={styles.roadmapsSection}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Roadmaps' : `${selectedCategory} Roadmaps`}
            </Text>
            <View style={styles.roadmapsContainer}>
              {loading ? (
                <>
                  <LoadingScreen 
                    message="جاري تحميل خرائط الطريق..." 
                    type="content"
                    color="#9B59B6"
                  />
                  {Array.from({ length: 3 }, (_, index) => (
                    <RoadmapCardSkeleton key={`skeleton-${index}`} />
                  ))}
                </>
              ) : (
                filteredRoadmaps.map((roadmap, index) => (
                <TouchableOpacity 
                  key={roadmap._id || roadmap.id || `roadmap-${index}`} 
                  style={styles.roadmapCard}
                  onPress={() => router.push(`/roadmap-details?roadmapId=${roadmap._id || roadmap.id}`)}
                >
                  <View style={styles.roadmapImageContainer}>
                    <ImageBackground
                      source={{ 
                        uri: roadmap.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
                      }}
                      style={styles.roadmapImage}
                      resizeMode="cover"
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                        style={styles.roadmapImageGradient}
                      >
                        <View style={styles.roadmapIcon}>
                          <Text style={styles.roadmapIconText}>{roadmap.icon || '🗺️'}</Text>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </View>
                  
                  <View style={styles.roadmapContent}>
                    <View style={styles.roadmapHeader}>
                      <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
                      <View style={[styles.roadmapLevelBadge, { backgroundColor: roadmap.color || '#9B59B6' }]}>
                        <Text style={styles.roadmapLevelText}>{roadmap.difficulty || 'Beginner'}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.roadmapDescription}>{roadmap.description}</Text>
                    
                    <View style={styles.roadmapMeta}>
                      <View style={styles.roadmapMetaItem}>
                        <Text style={styles.roadmapMetaIcon}>⏱️</Text>
                        <Text style={styles.roadmapMetaText}>{roadmap.duration || '6 months'}</Text>
                      </View>
                      <View style={styles.roadmapMetaItem}>
                        <Text style={styles.roadmapMetaIcon}>📚</Text>
                        <Text style={styles.roadmapMetaText}>{roadmap.steps?.length || 0} steps</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                ))
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
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
  // Search Section
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#CCCCCC',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Categories Section
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesScrollView: {
    marginTop: 10,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
