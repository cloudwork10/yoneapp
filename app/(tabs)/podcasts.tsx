import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

const { width, height } = Dimensions.get('window');

export default function PodcastsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Technology', 'Business', 'Science', 'Health', 'Education', 'Entertainment'];

  const podcasts = [
    { 
      id: '1', 
      title: 'The Future of AI in Mobile Development', 
      duration: '45 min', 
      category: 'Technology',
      instructor: 'Sarah Chen',
      rating: 4.9,
      students: 2500,
      thumbnail: '🎙️'
    },
    { 
      id: '2', 
      title: 'Building Scalable React Native Apps', 
      duration: '52 min', 
      category: 'Technology',
      instructor: 'Mike Johnson',
      rating: 4.8,
      students: 1800,
      thumbnail: '🎙️'
    },
    { 
      id: '3', 
      title: 'JavaScript Performance Optimization', 
      duration: '38 min', 
      category: 'Technology',
      instructor: 'Alex Rodriguez',
      rating: 4.7,
      students: 3200,
      thumbnail: '🎙️'
    },
    { 
      id: '4', 
      title: 'Node.js Best Practices', 
      duration: '41 min', 
      category: 'Technology',
      instructor: 'Emma Wilson',
      rating: 4.9,
      students: 2100,
      thumbnail: '🎙️'
    },
    { 
      id: '5', 
      title: 'Database Design Patterns', 
      duration: '35 min', 
      category: 'Technology',
      instructor: 'David Kim',
      rating: 4.6,
      students: 1500,
      thumbnail: '🎙️'
    },
    { 
      id: '6', 
      title: 'UI/UX Design Trends 2024', 
      duration: '48 min', 
      category: 'Design',
      instructor: 'Lisa Park',
      rating: 4.8,
      students: 2800,
      thumbnail: '🎙️'
    },
    { 
      id: '7', 
      title: 'Startup Success Stories', 
      duration: '55 min', 
      category: 'Business',
      instructor: 'Tom Anderson',
      rating: 4.7,
      students: 1900,
      thumbnail: '🎙️'
    },
    { 
      id: '8', 
      title: 'Machine Learning Fundamentals', 
      duration: '42 min', 
      category: 'Science',
      instructor: 'Dr. Maria Garcia',
      rating: 4.9,
      students: 3600,
      thumbnail: '🎙️'
    }
  ];

  const filteredPodcasts = podcasts.filter(podcast => {
    const matchesSearch = podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         podcast.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || podcast.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePodcastPress = (podcastId: string) => {
    router.push({
      pathname: '/podcast-details',
      params: { podcastId }
    });
  };

  const renderPodcast = ({ item: podcast }) => (
    <TouchableOpacity 
      style={styles.podcastCard}
      onPress={() => handlePodcastPress(podcast.id)}
    >
      <View style={styles.podcastThumbnail}>
        <LinearGradient
          colors={['#E50914', '#B81D13']}
          style={styles.thumbnailGradient}
        >
          <Text style={styles.thumbnailIcon}>{podcast.thumbnail}</Text>
        </LinearGradient>
        <View style={styles.playButtonOverlay}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{podcast.duration}</Text>
        </View>
      </View>
      
      <View style={styles.podcastInfo}>
        <Text style={styles.podcastTitle} numberOfLines={2}>{podcast.title}</Text>
        <Text style={styles.podcastInstructor}>By {podcast.instructor}</Text>
        
        <View style={styles.podcastStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statText}>{podcast.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statText}>{podcast.students.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statText}>{podcast.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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

      {/* Podcasts List */}
      <View style={styles.podcastsContainer}>
        {filteredPodcasts.map((podcast) => (
          <View key={podcast.id}>
            {renderPodcast({ item: podcast })}
          </View>
        ))}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  heroContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    textAlign: 'center',
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Search Section Styles
  searchSectionGradient: {
    paddingVertical: 20,
    marginTop: -40,
  },
  searchSection: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: -10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 18,
    color: '#E50914',
    marginLeft: 10,
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesContent: {
    paddingHorizontal: 5,
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
    paddingTop: 10,
    paddingBottom: 100,
  },
  podcastCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
    overflow: 'hidden',
  },
  podcastThumbnail: {
    height: 200,
    position: 'relative',
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 60,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  podcastInfo: {
    padding: 20,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  podcastInstructor: {
    fontSize: 14,
    color: '#E50914',
    marginBottom: 12,
  },
  podcastStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
