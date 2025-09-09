import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ImageBackground,
  Dimensions,
  PanResponder,
  Animated
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function RoadmapDetailsScreen() {
  const router = useRouter();
  const { roadmapId } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Sample roadmap data
  const roadmap = {
    id: roadmapId || '1',
    title: 'React Native Developer Roadmap',
    description: 'Complete guide to become a React Native developer from beginner to expert',
    duration: '2 hours',
    level: 'Beginner to Advanced',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
        topics: ['Development Setup', 'Basic Components', 'Styling', 'Navigation']
      },
      {
        id: '4',
        title: 'State Management',
        description: 'Learn how to manage application state with Redux, Context API, and other solutions',
        duration: '3 weeks',
        completed: false,
        topics: ['Redux', 'Context API', 'Zustand', 'State Patterns']
      },
      {
        id: '5',
        title: 'Navigation & Routing',
        description: 'Implement navigation between screens using React Navigation',
        duration: '2 weeks',
        completed: false,
        topics: ['Stack Navigation', 'Tab Navigation', 'Drawer Navigation', 'Deep Linking']
      },
      {
        id: '6',
        title: 'APIs & Data Fetching',
        description: 'Learn how to fetch data from APIs and handle network requests',
        duration: '2 weeks',
        completed: false,
        topics: ['REST APIs', 'GraphQL', 'Axios', 'Error Handling']
      },
      {
        id: '7',
        title: 'Testing',
        description: 'Write tests for your React Native applications',
        duration: '2 weeks',
        completed: false,
        topics: ['Jest', 'React Native Testing Library', 'Unit Tests', 'Integration Tests']
      },
      {
        id: '8',
        title: 'Performance Optimization',
        description: 'Optimize your app performance and learn best practices',
        duration: '2 weeks',
        completed: false,
        topics: ['Performance Monitoring', 'Memory Management', 'Bundle Optimization', 'Best Practices']
      },
      {
        id: '9',
        title: 'Deployment & Publishing',
        description: 'Learn how to build and publish your app to app stores',
        duration: '2 weeks',
        completed: false,
        topics: ['App Store', 'Google Play', 'Code Signing', 'Release Management']
      }
    ]
  };

  // Video control functions
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsLoading(false);
      setHasError(false);
    } else if (status.error) {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleSeek = async (position: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(position);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(newVolume);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoPress = () => {
    if (showControls) {
      setShowControls(false);
    } else {
      showControlsTemporarily();
    }
  };

  // Auto-hide controls when playing
  useEffect(() => {
    if (isPlaying && showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, showControls]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const toggleStepCompletion = (stepId: string) => {
    // In a real app, you would update the completion status
    console.log(`Toggle step ${stepId} completion`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Video */}
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

              {/* Video Player */}
              <View style={[styles.videoContainer, isFullscreen && styles.fullscreenContainer]}>
                <Video
                  ref={videoRef}
                  source={{ uri: roadmap.videoUrl }}
                  style={styles.video}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={isPlaying}
                  isLooping={false}
                  volume={volume}
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                />
                
                {/* Video Overlay with Controls */}
                <TouchableOpacity 
                  style={styles.videoOverlay}
                  onPress={handleVideoPress}
                  activeOpacity={1}
                >
                  {/* Loading Indicator */}
                  {isLoading && (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  )}

                  {/* Error Message */}
                  {hasError && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>Error loading video</Text>
                      <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => {
                          setHasError(false);
                          setIsLoading(true);
                        }}
                      >
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Video Controls */}
                  {showControls && !isLoading && !hasError && (
                    <Animated.View style={[styles.controlsContainer, { opacity: fadeAnim }]}>
                      {/* Top Controls */}
                      <View style={styles.topControls}>
                        <TouchableOpacity 
                          style={styles.fullscreenButton}
                          onPress={toggleFullscreen}
                        >
                          <Text style={styles.controlButtonText}>
                            {isFullscreen ? '⤓' : '⤢'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Center Play Button */}
                      <View style={styles.centerControls}>
                        <TouchableOpacity 
                          style={styles.bigPlayButton}
                          onPress={togglePlayPause}
                        >
                          <Text style={styles.bigPlayButtonText}>
                            {isPlaying ? '⏸' : '▶'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Bottom Controls */}
                      <View style={styles.bottomControls}>
                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                          <View style={styles.progressBar}>
                            <View 
                              style={[
                                styles.progressFill, 
                                { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                              ]} 
                            />
                            <TouchableOpacity
                              style={[
                                styles.progressThumb,
                                { left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                              ]}
                              onPress={() => {
                                // Handle seek on thumb press
                                const newPosition = (currentTime / duration) * duration;
                                handleSeek(newPosition);
                              }}
                            />
                          </View>
                          <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>

                        {/* Volume Control */}
                        <View style={styles.volumeContainer}>
                          <Text style={styles.volumeIcon}>🔊</Text>
                          <View style={styles.volumeBar}>
                            <View 
                              style={[
                                styles.volumeFill, 
                                { width: `${volume * 100}%` }
                              ]} 
                            />
                            <TouchableOpacity
                              style={[
                                styles.volumeThumb,
                                { left: `${volume * 100}%` }
                              ]}
                              onPress={() => {
                                const newVolume = volume > 0.5 ? 0 : 1;
                                handleVolumeChange(newVolume);
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Roadmap Info */}
              <View style={styles.roadmapInfo}>
                <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
                <Text style={styles.roadmapDescription}>{roadmap.description}</Text>
                <View style={styles.roadmapMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱️</Text>
                    <Text style={styles.metaText}>{roadmap.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📊</Text>
                    <Text style={styles.metaText}>{roadmap.level}</Text>
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
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <Text style={styles.stepDuration}>⏱️ {step.duration}</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.completionButton,
                    step.completed && styles.completedButton
                  ]}
                  onPress={() => toggleStepCompletion(step.id)}
                >
                  <Text style={styles.completionButtonText}>
                    {step.completed ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Step Topics */}
              <View style={styles.topicsContainer}>
                {step.topics.map((topic, topicIndex) => (
                  <View key={topicIndex} style={styles.topicItem}>
                    <Text style={styles.topicBullet}>•</Text>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
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
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    marginTop: 60,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    margin: 0,
    borderRadius: 0,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
  },
  errorText: {
    color: '#E50914',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fullscreenButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bigPlayButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    marginLeft: 4,
  },
  bottomControls: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E50914',
    marginLeft: -8,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  volumeThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E50914',
    marginLeft: -8,
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
    marginBottom: 30,
  },
  stepCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  stepDuration: {
    fontSize: 12,
    color: '#E50914',
    fontWeight: '600',
  },
  completionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  completedButton: {
    backgroundColor: '#E50914',
  },
  completionButtonText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topicsContainer: {
    marginTop: 10,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicBullet: {
    color: '#E50914',
    fontSize: 16,
    marginRight: 10,
  },
  topicText: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 14,
  },
});
