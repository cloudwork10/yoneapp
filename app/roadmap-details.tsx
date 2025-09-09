import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    PanResponder,
    GestureResponderEvent,
    PanResponderGestureState,
    StatusBar
} from 'react-native';

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
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [brightness, setBrightness] = useState(1.0);
  const [showSeekPreview, setShowSeekPreview] = useState(false);
  const [seekPreviewTime, setSeekPreviewTime] = useState(0);
  const [doubleTapSeek, setDoubleTapSeek] = useState(0);
  const [showDoubleTapSeek, setShowDoubleTapSeek] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'none' | 'volume' | 'brightness' | 'seek'>('none');
  
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const seekAnim = useRef(new Animated.Value(0)).current;
  const volumeAnim = useRef(new Animated.Value(1)).current;
  const brightnessAnim = useRef(new Animated.Value(1)).current;
  const doubleTapAnim = useRef(new Animated.Value(0)).current;

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

  const handlePlaybackRateChange = async (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(rate, true);
    }
  };

  const handleDoubleTapSeek = (direction: 'left' | 'right') => {
    const seekAmount = direction === 'left' ? -10000 : 10000; // 10 seconds
    const newTime = Math.max(0, Math.min(duration, currentTime + seekAmount));
    
    setDoubleTapSeek(seekAmount);
    setShowDoubleTapSeek(true);
    
    Animated.sequence([
      Animated.timing(doubleTapAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(doubleTapAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    handleSeek(newTime);
    
    setTimeout(() => {
      setShowDoubleTapSeek(false);
    }, 1000);
  };

  const handleGestureStart = (gestureState: PanResponderGestureState) => {
    setIsDragging(true);
    setShowControls(true);
    
    // Determine gesture type based on position
    const { x0, y0 } = gestureState;
    const screenWidth = width;
    const screenHeight = height;
    
    if (x0 < screenWidth * 0.3) {
      setDragType('brightness');
    } else if (x0 > screenWidth * 0.7) {
      setDragType('volume');
    } else {
      setDragType('seek');
    }
  };

  const handleGestureMove = (gestureState: PanResponderGestureState) => {
    if (!isDragging) return;
    
    const { dy, dx } = gestureState;
    const screenHeight = height;
    const screenWidth = width;
    
    switch (dragType) {
      case 'volume':
        const newVolume = Math.max(0, Math.min(1, volume - (dy / screenHeight)));
        setVolume(newVolume);
        handleVolumeChange(newVolume);
        break;
        
      case 'brightness':
        const newBrightness = Math.max(0.1, Math.min(1, brightness - (dy / screenHeight)));
        setBrightness(newBrightness);
        break;
        
      case 'seek':
        const seekProgress = (dx / screenWidth) * duration;
        const newSeekTime = Math.max(0, Math.min(duration, currentTime + seekProgress));
        setSeekPreviewTime(newSeekTime);
        setShowSeekPreview(true);
        break;
    }
  };

  const handleGestureEnd = () => {
    setIsDragging(false);
    setDragType('none');
    setShowSeekPreview(false);
    
    if (dragType === 'seek' && showSeekPreview) {
      handleSeek(seekPreviewTime);
    }
  };

  // PanResponder for gesture controls
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => handleGestureStart(gestureState),
    onPanResponderMove: (_, gestureState) => handleGestureMove(gestureState),
    onPanResponderRelease: handleGestureEnd,
    onPanResponderTerminate: handleGestureEnd,
  });

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
                
                {/* Video Overlay with Advanced Controls */}
                <View 
                  style={styles.videoOverlay}
                  {...panResponder.panHandlers}
                >
                  {/* Double Tap Seek Areas */}
                  <TouchableOpacity 
                    style={styles.doubleTapLeft}
                    onPress={() => handleDoubleTapSeek('left')}
                    activeOpacity={1}
                  >
                    <View />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.doubleTapRight}
                    onPress={() => handleDoubleTapSeek('right')}
                    activeOpacity={1}
                  >
                    <View />
                  </TouchableOpacity>

                  {/* Double Tap Seek Indicator */}
                  {showDoubleTapSeek && (
                    <Animated.View 
                      style={[
                        styles.doubleTapIndicator,
                        {
                          left: doubleTapSeek < 0 ? 50 : width - 100,
                          opacity: doubleTapAnim,
                          transform: [{
                            scale: doubleTapAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1.2],
                            })
                          }]
                        }
                      ]}
                    >
                      <Text style={styles.doubleTapText}>
                        {doubleTapSeek < 0 ? '⏪ -10s' : '⏩ +10s'}
                      </Text>
                    </Animated.View>
                  )}

                  {/* Gesture Indicators */}
                  {isDragging && (
                    <>
                      {dragType === 'volume' && (
                        <View style={styles.volumeIndicator}>
                          <Text style={styles.indicatorIcon}>🔊</Text>
                          <Text style={styles.indicatorText}>{Math.round(volume * 100)}%</Text>
                        </View>
                      )}
                      {dragType === 'brightness' && (
                        <View style={styles.brightnessIndicator}>
                          <Text style={styles.indicatorIcon}>☀️</Text>
                          <Text style={styles.indicatorText}>{Math.round(brightness * 100)}%</Text>
                        </View>
                      )}
                      {dragType === 'seek' && showSeekPreview && (
                        <View style={styles.seekPreview}>
                          <Text style={styles.seekPreviewText}>
                            {formatTime(seekPreviewTime)}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
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

                        {/* Advanced Controls Row */}
                        <View style={styles.advancedControlsRow}>
                          {/* Playback Speed */}
                          <TouchableOpacity 
                            style={styles.speedButton}
                            onPress={() => {
                              const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                              const currentIndex = speeds.indexOf(playbackRate);
                              const nextIndex = (currentIndex + 1) % speeds.length;
                              handlePlaybackRateChange(speeds[nextIndex]);
                            }}
                          >
                            <Text style={styles.speedButtonText}>{playbackRate}x</Text>
                          </TouchableOpacity>

                          {/* Volume Control */}
                          <View style={styles.volumeContainer}>
                            <Text style={styles.volumeIcon}>
                              {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                            </Text>
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

                          {/* Settings Button */}
                          <TouchableOpacity 
                            style={styles.settingsButton}
                            onPress={() => setShowSettings(!showSettings)}
                          >
                            <Text style={styles.settingsButtonText}>⚙️</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Settings Panel */}
                        {showSettings && (
                          <View style={styles.settingsPanel}>
                            <Text style={styles.settingsTitle}>Video Settings</Text>
                            
                            {/* Playback Speed Options */}
                            <View style={styles.settingsSection}>
                              <Text style={styles.settingsLabel}>Playback Speed</Text>
                              <View style={styles.speedOptions}>
                                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                                  <TouchableOpacity
                                    key={speed}
                                    style={[
                                      styles.speedOption,
                                      playbackRate === speed && styles.speedOptionActive
                                    ]}
                                    onPress={() => handlePlaybackRateChange(speed)}
                                  >
                                    <Text style={[
                                      styles.speedOptionText,
                                      playbackRate === speed && styles.speedOptionTextActive
                                    ]}>
                                      {speed}x
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>

                            {/* Quality Options */}
                            <View style={styles.settingsSection}>
                              <Text style={styles.settingsLabel}>Quality</Text>
                              <View style={styles.qualityOptions}>
                                {['Auto', '1080p', '720p', '480p', '360p'].map((quality) => (
                                  <TouchableOpacity
                                    key={quality}
                                    style={styles.qualityOption}
                                    onPress={() => {
                                      // Handle quality change
                                      console.log(`Quality changed to: ${quality}`);
                                    }}
                                  >
                                    <Text style={styles.qualityOptionText}>{quality}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </Animated.View>
                  )}
                </View>
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
  // Advanced Controls Styles
  doubleTapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 1,
  },
  doubleTapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 1,
  },
  doubleTapIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  doubleTapText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  volumeIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -30 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  brightnessIndicator: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -30 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  indicatorIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  seekPreview: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    zIndex: 10,
  },
  seekPreviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  advancedControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  speedButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
  },
  speedButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 15,
    minWidth: 40,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
  },
  settingsPanel: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  settingsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingsSection: {
    marginBottom: 15,
  },
  settingsLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedOption: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
  },
  speedOptionActive: {
    backgroundColor: '#E50914',
  },
  speedOptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  speedOptionTextActive: {
    color: '#FFFFFF',
  },
  qualityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qualityOption: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 60,
    alignItems: 'center',
  },
  qualityOptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
