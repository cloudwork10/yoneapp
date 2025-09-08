import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Podcast {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  listeners: number;
  duration: string;
  category: string;
  description: string;
  whatYouWillLearn: string[];
  episodes: {
    title: string;
    duration: string;
    type: 'intro' | 'full-episode';
    isCompleted: boolean;
    videoUrl?: string;
    description: string;
  }[];
}

export default function PodcastDetailsScreen() {
  const { podcastId } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'episodes'>('episodes');
  const [subscribed, setSubscribed] = useState(false);

  // Sample podcast data - in real app, fetch from API
  const podcast: Podcast = {
    id: podcastId as string || '1',
    title: 'The Future of AI in Mobile Development',
    instructor: 'Sarah Chen',
    rating: 4.9,
    listeners: 2500,
    duration: '45 min',
    category: 'Technology',
    description: 'Join Sarah Chen as she explores the cutting-edge world of AI integration in mobile development. This comprehensive podcast covers everything from machine learning frameworks to real-world implementation strategies that are revolutionizing the mobile app industry.',
    whatYouWillLearn: [
      'Latest AI frameworks for mobile development',
      'Machine learning model integration techniques',
      'Performance optimization for AI-powered apps',
      'Real-world case studies and success stories',
      'Future trends in mobile AI development',
      'Best practices for AI implementation'
    ],
    episodes: [
      { 
        title: 'Podcast Introduction', 
        duration: '5 min', 
        type: 'intro', 
        isCompleted: true,
        videoUrl: 'https://example.com/intro-video',
        description: 'Get introduced to the podcast and learn what to expect in this episode'
      },
      { 
        title: 'Full Episode', 
        duration: '45 min', 
        type: 'full-episode', 
        isCompleted: false,
        videoUrl: 'https://example.com/full-episode',
        description: 'Complete episode with in-depth discussion about AI in mobile development'
      }
    ]
  };

  const handleSubscribe = () => {
    if (subscribed) {
      Alert.alert('Already Subscribed', 'You are already subscribed to this podcast!');
    } else {
      setSubscribed(true);
      Alert.alert('Success!', 'You have been subscribed to this podcast!');
    }
  };

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const handlePlayVideo = (episode: any) => {
    setSelectedVideo(episode);
    setIsPlaying(true);
    setCurrentTime(0);
    setShowControls(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      // Simulate pause
      Alert.alert('Video Paused', `${selectedVideo.title} is now paused`);
    } else {
      // Simulate play
      Alert.alert('Video Playing', `${selectedVideo.title} is now playing`);
    }
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowControls(false);
  };

  const handleSeek = (position: number) => {
    setCurrentTime(position);
  };

  const renderInlineVideoPlayer = () => {
    if (!selectedVideo) return null;

    const progressPercentage = (currentTime / 100) * 100; // Simulate progress

    return (
      <View style={styles.videoPlayerContainer}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.videoPlayerBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.videoPlayerGradient}
          >
            {/* Header Controls */}
            <View style={styles.videoPlayerHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleCloseVideo}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
              <View style={styles.videoPlayerInfo}>
                <Text style={styles.videoPlayerTitle} numberOfLines={1}>{selectedVideo.title}</Text>
                <Text style={styles.videoPlayerDuration}>{selectedVideo.duration}</Text>
              </View>
              <TouchableOpacity 
                style={styles.fullscreenButton}
                onPress={() => Alert.alert('Fullscreen', 'Fullscreen mode activated')}
              >
                <Text style={styles.fullscreenIcon}>⤢</Text>
              </TouchableOpacity>
            </View>

            {/* Center Play Button */}
            <TouchableOpacity 
              style={styles.videoPlayerCenter}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <View style={styles.videoPlayButton}>
                <Text style={styles.videoPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </View>
              {!isPlaying && (
                <Text style={styles.playHint}>Tap to play</Text>
              )}
            </TouchableOpacity>

            {/* Bottom Controls */}
            <View style={styles.videoPlayerBottom}>
              <View style={styles.videoProgressContainer}>
                <TouchableOpacity 
                  style={styles.videoProgressBar}
                  onPress={() => handleSeek(25)}
                >
                  <View style={[styles.videoProgressFill, { width: `${progressPercentage}%` }]} />
                  <View style={styles.videoProgressThumb} />
                </TouchableOpacity>
                <Text style={styles.videoTimeText}>
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {selectedVideo.duration}
                </Text>
              </View>
              
              <View style={styles.videoControlsRow}>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => handleSeek(Math.max(0, currentTime - 10))}
                >
                  <Text style={styles.controlIcon}>⏪</Text>
                  <Text style={styles.controlText}>10s</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={handlePlayPause}
                >
                  <Text style={styles.controlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => handleSeek(Math.min(100, currentTime + 10))}
                >
                  <Text style={styles.controlIcon}>⏩</Text>
                  <Text style={styles.controlText}>10s</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>About This Podcast</Text>
        <Text style={styles.description}>{podcast.description}</Text>
      </View>

      <View style={styles.learnSection}>
        <Text style={styles.sectionTitle}>What You'll Learn</Text>
        {podcast.whatYouWillLearn.map((item, index) => (
          <View key={index} style={styles.learnItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.learnText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.instructorSection}>
        <Text style={styles.sectionTitle}>Host</Text>
        <View style={styles.instructorCard}>
          <View style={styles.instructorAvatar}>
            <Text style={styles.instructorInitials}>{podcast.instructor.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{podcast.instructor}</Text>
            <Text style={styles.instructorTitle}>Senior AI Developer</Text>
            <Text style={styles.instructorStats}>8+ years experience • 50,000+ listeners</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEpisodes = () => (
    <View style={styles.tabContent}>
      <View style={styles.episodesHeader}>
        <Text style={styles.episodesTitle}>Choose Your Video</Text>
        <Text style={styles.episodesSubtitle}>Pick what you want to watch</Text>
      </View>

      <View style={styles.videoSelectionContainer}>
        {podcast.episodes.map((episode, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.videoOptionCard,
              episode.type === 'full-episode' && styles.fullEpisodeCard
            ]}
            onPress={() => handlePlayVideo(episode)}
          >
            <View style={styles.videoThumbnail}>
              <LinearGradient
                colors={episode.type === 'intro' ? ['#4CAF50', '#45A049'] : ['#E50914', '#B81D13']}
                style={styles.videoThumbnailGradient}
              >
                <Text style={styles.videoThumbnailIcon}>
                  {episode.type === 'intro' ? '🎬' : '🎙️'}
                </Text>
              </LinearGradient>
              <View style={styles.playButtonOverlay}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <View style={styles.videoDurationBadge}>
                <Text style={styles.videoDurationText}>{episode.duration}</Text>
              </View>
              {episode.isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓</Text>
                </View>
              )}
            </View>
            
            <View style={styles.videoInfo}>
              <View style={styles.videoHeader}>
                <Text style={[
                  styles.videoType,
                  episode.type === 'intro' && styles.introType
                ]}>
                  {episode.type === 'intro' ? 'Quick Intro' : 'Full Episode'}
                </Text>
                {episode.type === 'full-episode' && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Best Choice</Text>
                  </View>
                )}
              </View>
              <Text style={styles.videoTitle}>{episode.title}</Text>
              <Text style={styles.videoDescription}>{episode.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Inline Video Player */}
      {renderInlineVideoPlayer()}
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={styles.heroGradient}
          />
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.podcastTitle}>{podcast.title}</Text>
            <Text style={styles.podcastInstructor}>Hosted by {podcast.instructor}</Text>
            
            <View style={styles.podcastStats}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statText}>{podcast.rating}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statText}>{podcast.listeners.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={styles.statText}>{podcast.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statText}>{podcast.category}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Podcast Info Bar */}
        <View style={styles.infoBar}>
          <View style={styles.subscribeContainer}>
            <Text style={styles.subscribeText}>
              {subscribed ? 'Subscribed' : 'Subscribe for Free'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.subscribeButton, subscribed && styles.subscribedButton]} onPress={handleSubscribe}>
            <Text style={styles.subscribeButtonText}>
              {subscribed ? 'Subscribed' : 'Subscribe Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]} 
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'episodes' && styles.activeTab]} 
            onPress={() => setSelectedTab('episodes')}
          >
            <Text style={[styles.tabText, selectedTab === 'episodes' && styles.activeTabText]}>Watch</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <ScrollView 
          style={styles.contentScroll} 
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          decelerationRate="fast"
          overScrollMode="auto"
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'episodes' && renderEpisodes()}
        </ScrollView>
      </ScrollView>
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
    backgroundColor: '#000000',
  },
  heroSection: {
    height: height * 0.35,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  podcastTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 30,
  },
  podcastInstructor: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  podcastStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  subscribeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
  },
  subscribeButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  subscribedButton: {
    backgroundColor: '#4CAF50',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E50914',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#E50914',
  },
  contentScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabContent: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 25,
  },
  learnSection: {
    marginBottom: 25,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkmark: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  learnText: {
    flex: 1,
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  instructorSection: {
    marginBottom: 25,
  },
  instructorCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  instructorInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 14,
    color: '#E50914',
    marginBottom: 4,
  },
  instructorStats: {
    fontSize: 12,
    color: '#999999',
  },
  episodesHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  episodesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  episodesSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  videoSelectionContainer: {
    gap: 20,
  },
  videoOptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fullEpisodeCard: {
    borderColor: 'rgba(229, 9, 20, 0.5)',
    backgroundColor: 'rgba(229, 9, 20, 0.05)',
  },
  videoThumbnail: {
    height: 200,
    position: 'relative',
  },
  videoThumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnailIcon: {
    fontSize: 50,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 3,
  },
  videoDurationBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: 20,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoType: {
    fontSize: 14,
    color: '#E50914',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  introType: {
    color: '#4CAF50',
  },
  recommendedBadge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  // Inline Video Player Styles
  videoPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
  videoPlayerBackground: {
    width: '100%',
    height: '100%',
  },
  videoPlayerGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  videoPlayerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  videoPlayerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoPlayerDuration: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 2,
  },
  fullscreenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  videoPlayerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  videoPlayIcon: {
    color: '#FFFFFF',
    fontSize: 40,
    marginLeft: 4,
  },
  playHint: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 15,
    opacity: 0.8,
  },
  videoPlayerBottom: {
    padding: 20,
  },
  videoProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: 15,
    position: 'relative',
  },
  videoProgressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  videoProgressThumb: {
    position: 'absolute',
    right: -6,
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E50914',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  videoTimeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 80,
  },
  videoControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  controlIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 4,
  },
  controlText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
});
