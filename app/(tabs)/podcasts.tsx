import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../../config/api';
import { useUser } from '../../contexts/UserContext';
import { makeAuthenticatedRequest } from '../../utils/tokenRefresh';

const { width, height } = Dimensions.get('window');

interface Podcast {
  _id?: string;
  id?: string;
  title: string;
  host: string;
  category: string;
  thumbnail?: string;
  rating?: number;
  listeners?: number;
  isPremium?: boolean;
}

export default function PodcastsScreen() {
  const { user } = useUser();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const categories = ['All', 'Technology', 'Programming', 'Business', 'Design', 'Career'];

  useEffect(() => {
    fetchPodcasts();
    checkSubscription();
  }, []);

  useEffect(() => {
    filterPodcasts();
  }, [searchQuery, selectedCategory, podcasts]);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      console.log('🎧 Fetching podcasts from API...');
      const response = await fetch(`${API_BASE_URL}/api/public/podcasts`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Podcasts fetched:', data.data.podcasts.length);
        setPodcasts(data.data.podcasts || []);
      } else {
        console.error('Failed to fetch podcasts:', response.status);
        setPodcasts([]);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/payments/subscription`);
      if (response.ok) {
        const data = await response.json();
        setHasActiveSubscription(data.data?.isActive || false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const filterPodcasts = () => {
    let filtered = podcasts;

    if (searchQuery) {
      filtered = filtered.filter(podcast =>
        podcast.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.host?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(podcast => podcast.category === selectedCategory);
    }

    setFilteredPodcasts(filtered);
  };

  const onRefresh = () => {
    fetchPodcasts();
    checkSubscription();
  };

  const handlePodcastPress = (podcast: Podcast) => {
    if (podcast.isPremium && !hasActiveSubscription) {
      Alert.alert(
        'Premium Content',
        'This podcast is available for premium subscribers only. Upgrade to access all content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') }
        ]
      );
      return;
    }

    router.push({
      pathname: '/podcast-details',
      params: { podcastId: podcast._id || podcast.id }
    });
  };

  const renderPodcast = ({ item: podcast }: { item: Podcast }) => {
    const isLocked = podcast.isPremium && !hasActiveSubscription;
    
    return (
      <TouchableOpacity 
        style={[styles.podcastCard, isLocked && styles.lockedCard]}
        onPress={() => handlePodcastPress(podcast)}
      >
        <View style={styles.podcastThumbnail}>
          {podcast.thumbnail ? (
            <ImageBackground
              source={{ uri: podcast.thumbnail }}
              style={styles.thumbnailImage}
              imageStyle={styles.thumbnailImageStyle}
            />
          ) : (
            <View style={styles.defaultThumbnail}>
              <Text style={styles.defaultThumbnailText}>🎧</Text>
            </View>
          )}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>
        
        <View style={styles.podcastInfo}>
          <Text style={styles.podcastTitle} numberOfLines={2}>
            {podcast.title}
          </Text>
          <Text style={styles.podcastHost} numberOfLines={1}>
            {podcast.host}
          </Text>
          <View style={styles.podcastStats}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statText}>{podcast.rating || 'N/A'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statText}>{podcast.listeners || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statText}>{podcast.category}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={true}
      scrollEventThrottle={16}
      decelerationRate="fast"
    >
      {/* Hero Section with Microphone Background */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.heroBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
            style={styles.heroGradient}
          >
            <SafeAreaView style={styles.heroSafeArea}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Listen & Learn</Text>
                <Text style={styles.heroSubtitle}>Discover expert insights through video podcasts</Text>
                
                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>200+</Text>
                    <Text style={styles.heroStatLabel}>Podcasts</Text>
                  </View>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>25K+</Text>
                    <Text style={styles.heroStatLabel}>Listeners</Text>
                  </View>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>4.9</Text>
                    <Text style={styles.heroStatLabel}>Rating</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Search and Filter Section */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
        style={styles.searchSectionGradient}
      >
        <View style={styles.searchSection}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search podcasts..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Text style={styles.searchIcon}>🔍</Text>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredPodcasts.length} podcast{filteredPodcasts.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Refresh Button */}
      {!loading && (
        <View style={styles.refreshContainer}>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Podcasts List */}
      <View style={styles.podcastsContainer}>
        {loading ? (
          <View style={styles.simpleLoadingContainer}>
            <Text style={styles.simpleLoadingText}>Loading podcasts...</Text>
          </View>
        ) : filteredPodcasts.length > 0 ? (
          filteredPodcasts.map((podcast) => (
            <View key={`podcast-${podcast._id || podcast.id}`}>
              {renderPodcast({ item: podcast })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No podcasts found</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Hero Section Styles
  heroSection: {
    height: 550,
    position: 'relative',
  },
  heroBackground: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  // Search Section Styles
  searchSectionGradient: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchSection: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 18,
    color: '#CCCCCC',
    marginLeft: 10,
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  categoryButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    alignItems: 'center',
  },
  resultsText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  // Podcasts List Styles
  podcastsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  podcastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockedCard: {
    opacity: 0.7,
  },
  podcastThumbnail: {
    height: 200,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailImageStyle: {
    resizeMode: 'cover',
  },
  defaultThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultThumbnailText: {
    fontSize: 48,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 32,
    color: '#E50914',
  },
  podcastInfo: {
    padding: 15,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  podcastHost: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  podcastStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  statText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  // Loading and Empty States
  simpleLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  simpleLoadingText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 20,
  },
  refreshContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  refreshButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
