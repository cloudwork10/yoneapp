import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
    Animated,
    PanResponder
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: width - 120, y: height - 200 });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.ValueXY({ x: width - 120, y: height - 200 })).current;

  const handlePlayVideo = (episode: any) => {
    setSelectedVideo(episode);
    setIsPlaying(true);
    setCurrentTime(0);
    setShowControls(true);
    
    // Start creative animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();
    
    startPulseAnimation();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      // Simulate pause with creative effect
      stopPulseAnimation();
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 200, useNativeDriver: true })
      ]).start();
      Alert.alert('⏸️ Video Paused', `${selectedVideo.title} is now paused`);
    } else {
      // Simulate play with creative effect
      startPulseAnimation();
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 200, useNativeDriver: true })
      ]).start();
      Alert.alert('▶️ Video Playing', `${selectedVideo.title} is now playing`);
    }
  };

  const handleCloseVideo = () => {
    // Creative exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setSelectedVideo(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(false);
      setIsFloating(false);
      stopPulseAnimation();
    });
  };

  const handleSeek = (position: number) => {
    setCurrentTime(position);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      // Animate to fullscreen
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ]).start();
    } else {
      // Animate back to small
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true })
      ]).start();
    }
  };

  const handleFloatingToggle = () => {
    setIsFloating(!isFloating);
    if (!isFloating) {
      // Animate to floating position
      Animated.spring(floatingAnim, {
        toValue: { x: width - 120, y: height - 200 },
        useNativeDriver: true
      }).start();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  // Pan responder for floating video
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (isFloating) {
          floatingAnim.setValue({
            x: gestureState.moveX - 60,
            y: gestureState.moveY - 60
          });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isFloating) {
          // Snap to edges
          const snapX = gestureState.moveX < width / 2 ? 20 : width - 120;
          Animated.spring(floatingAnim, {
            toValue: { x: snapX, y: gestureState.moveY - 60 },
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const renderInlineVideoPlayer = () => {
    if (!selectedVideo) return null;

    const progressPercentage = (currentTime / 100) * 100; // Simulate progress

    if (isFloating) {
      // Floating mode - draggable mini player
      return (
        <Animated.View 
          style={[
            styles.floatingVideoContainer,
            {
              transform: [
                { translateX: floatingAnim.x },
                { translateY: floatingAnim.y },
                { scale: pulseAnim }
              ],
              opacity: fadeAnim
            }
          ]}
          {...panResponder.panHandlers}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
            style={styles.floatingVideoBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(229,9,20,0.9)', 'rgba(0,0,0,0.8)']}
              style={styles.floatingVideoGradient}
            >
              <TouchableOpacity 
                style={styles.floatingPlayButton}
                onPress={handlePlayPause}
                activeOpacity={0.8}
              >
                <Animated.Text 
                  style={[
                    styles.floatingPlayIcon,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  {isPlaying ? '⏸' : '▶'}
                </Animated.Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.floatingCloseButton}
                onPress={handleCloseVideo}
              >
                <Text style={styles.floatingCloseIcon}>✕</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.floatingExpandButton}
                onPress={handleFullscreenToggle}
              >
                <Text style={styles.floatingExpandIcon}>⤢</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
      );
    }

    if (isFullscreen) {
      // Fullscreen mode with creative effects
      return (
        <Animated.View 
          style={[
            styles.fullscreenVideoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { 
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
            style={styles.fullscreenVideoBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
              style={styles.fullscreenVideoGradient}
            >
              {/* Creative Particle Effect Background */}
              <View style={styles.particleContainer}>
                {[...Array(20)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.particle,
                      {
                        left: Math.random() * width,
                        top: Math.random() * height,
                        opacity: fadeAnim,
                        transform: [
                          {
                            rotate: rotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', `${360 * (i + 1)}deg`]
                            })
                          }
                        ]
                      }
                    ]}
                  />
                ))}
              </View>

              {/* Fullscreen Header */}
              <Animated.View 
                style={[
                  styles.fullscreenHeader,
                  {
                    transform: [
                      { translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 0]
                      })}
                    ]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={handleCloseVideo}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
                <View style={styles.fullscreenVideoInfo}>
                  <Text style={styles.fullscreenVideoTitle} numberOfLines={1}>{selectedVideo.title}</Text>
                  <Text style={styles.fullscreenVideoDuration}>{selectedVideo.duration}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.exitFullscreenButton}
                  onPress={handleFullscreenToggle}
                >
                  <Text style={styles.exitFullscreenIcon}>⤓</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Creative Center Play Button */}
              <TouchableOpacity 
                style={styles.fullscreenCenter}
                onPress={handlePlayPause}
                activeOpacity={0.8}
              >
                <Animated.View 
                  style={[
                    styles.fullscreenPlayButton,
                    {
                      transform: [
                        { scale: pulseAnim },
                        { 
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.fullscreenPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </Animated.View>
              </TouchableOpacity>

              {/* Fullscreen Bottom Controls */}
              <Animated.View 
                style={[
                  styles.fullscreenBottom,
                  {
                    transform: [
                      { translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0]
                      })}
                    ]
                  }
                ]}
              >
                <View style={styles.fullscreenProgressContainer}>
                  <TouchableOpacity 
                    style={styles.fullscreenProgressBar}
                    onPress={() => handleSeek(25)}
                  >
                    <View style={[styles.fullscreenProgressFill, { width: `${progressPercentage}%` }]} />
                    <View style={styles.fullscreenProgressThumb} />
                  </TouchableOpacity>
                  <Text style={styles.fullscreenTimeText}>
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {selectedVideo.duration}
                  </Text>
                </View>
                
                <View style={styles.fullscreenControlsRow}>
                  <TouchableOpacity 
                    style={styles.fullscreenControlButton}
                    onPress={() => handleSeek(Math.max(0, currentTime - 10))}
                  >
                    <Text style={styles.fullscreenControlIcon}>⏪</Text>
                    <Text style={styles.fullscreenControlText}>10s</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.fullscreenControlButton}
                    onPress={handlePlayPause}
                  >
                    <Text style={styles.fullscreenControlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.fullscreenControlButton}
                    onPress={() => handleSeek(Math.min(100, currentTime + 10))}
                  >
                    <Text style={styles.fullscreenControlIcon}>⏩</Text>
                    <Text style={styles.fullscreenControlText}>10s</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
      );
    }

    // Creative small inline mode
    return (
      <Animated.View 
        style={[
          styles.smallVideoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { 
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }
            ]
          }
        ]}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.smallVideoBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.smallVideoGradient}
          >
            {/* Small Video Header */}
            <View style={styles.smallVideoHeader}>
              <TouchableOpacity 
                style={styles.smallCloseButton} 
                onPress={handleCloseVideo}
              >
                <Text style={styles.smallCloseIcon}>✕</Text>
              </TouchableOpacity>
              <View style={styles.smallVideoInfo}>
                <Text style={styles.smallVideoTitle} numberOfLines={1}>{selectedVideo.title}</Text>
                <Text style={styles.smallVideoDuration}>{selectedVideo.duration}</Text>
              </View>
              <TouchableOpacity 
                style={styles.smallFullscreenButton}
                onPress={handleFullscreenToggle}
              >
                <Text style={styles.smallFullscreenIcon}>⤢</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.floatingToggleButton}
                onPress={handleFloatingToggle}
              >
                <Text style={styles.floatingToggleIcon}>🎈</Text>
              </TouchableOpacity>
            </View>

            {/* Creative Small Video Center Play Button */}
            <TouchableOpacity 
              style={styles.smallVideoCenter}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <Animated.View 
                style={[
                  styles.smallPlayButton,
                  {
                    transform: [
                      { scale: pulseAnim }
                    ]
                  }
                ]}
              >
                <Text style={styles.smallPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Small Video Bottom Controls */}
            <View style={styles.smallVideoBottom}>
              <View style={styles.smallProgressContainer}>
                <TouchableOpacity 
                  style={styles.smallProgressBar}
                  onPress={() => handleSeek(25)}
                >
                  <View style={[styles.smallProgressFill, { width: `${progressPercentage}%` }]} />
                </TouchableOpacity>
                <Text style={styles.smallTimeText}>
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {selectedVideo.duration}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
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
  // Small Inline Video Player Styles
  smallVideoContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    height: 200,
    zIndex: 1000,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  smallVideoBackground: {
    width: '100%',
    height: '100%',
  },
  smallVideoGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  smallVideoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 15,
  },
  smallCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCloseIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallVideoInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  smallVideoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallVideoDuration: {
    color: '#CCCCCC',
    fontSize: 10,
    marginTop: 2,
  },
  smallFullscreenButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallFullscreenIcon: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  smallVideoCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallPlayIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 2,
  },
  smallVideoBottom: {
    padding: 10,
  },
  smallProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 10,
  },
  smallProgressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  smallTimeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    minWidth: 60,
  },
  
  // Fullscreen Video Player Styles
  fullscreenVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
  fullscreenVideoBackground: {
    width: '100%',
    height: '100%',
  },
  fullscreenVideoGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  fullscreenVideoInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  fullscreenVideoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullscreenVideoDuration: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  exitFullscreenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitFullscreenIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  fullscreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenPlayButton: {
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
  fullscreenPlayIcon: {
    color: '#FFFFFF',
    fontSize: 40,
    marginLeft: 4,
  },
  fullscreenBottom: {
    padding: 20,
  },
  fullscreenProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fullscreenProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: 15,
    position: 'relative',
  },
  fullscreenProgressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  fullscreenProgressThumb: {
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
  fullscreenTimeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 80,
  },
  fullscreenControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  fullscreenControlButton: {
    alignItems: 'center',
    padding: 10,
  },
  fullscreenControlIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 4,
  },
  fullscreenControlText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Floating Video Player Styles
  floatingVideoContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    zIndex: 2000,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
  },
  floatingVideoBackground: {
    width: '100%',
    height: '100%',
  },
  floatingVideoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingPlayIcon: {
    color: '#E50914',
    fontSize: 20,
    fontWeight: 'bold',
  },
  floatingCloseButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCloseIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingExpandButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingExpandIcon: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  floatingToggleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  floatingToggleIcon: {
    fontSize: 16,
  },
  
  // Particle Effects
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E50914',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
