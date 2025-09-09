import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    Modal,
    PanResponder,
    PanResponderGestureState,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const seekAnim = useRef(new Animated.Value(0)).current;
  const volumeAnim = useRef(new Animated.Value(1)).current;
  const brightnessAnim = useRef(new Animated.Value(1)).current;
  const doubleTapAnim = useRef(new Animated.Value(0)).current;
  const fullscreenAnim = useRef(new Animated.Value(0)).current;

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
    if (isFullscreen) {
      // Exit fullscreen
      Animated.timing(fullscreenAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowFullscreenModal(false);
        setIsFullscreen(false);
        setIsLandscape(false);
      });
    } else {
      // Enter fullscreen
      setShowFullscreenModal(true);
      setIsFullscreen(true);
      setIsLandscape(true);
      
      Animated.timing(fullscreenAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const exitFullscreen = () => {
    Animated.timing(fullscreenAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowFullscreenModal(false);
      setIsFullscreen(false);
      setIsLandscape(false);
    });
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

        {/* Video Section - Below Hero Image */}
        <View style={styles.videoSection}>
          <Text style={styles.videoSectionTitle}>Watch Introduction</Text>
          <TouchableOpacity 
            style={styles.videoContainer}
            onPress={toggleFullscreen}
            activeOpacity={0.9}
          >
            <Video
              ref={videoRef}
              source={{ uri: roadmap.videoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
              volume={1.0}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
            
            {/* Play Button Overlay */}
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <Text style={styles.playText}>Tap to play</Text>
            </View>
          </TouchableOpacity>
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

      {/* Safari-like Fullscreen Video Modal */}
      <Modal
        visible={showFullscreenModal}
        transparent={false}
        animationType="slide"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={exitFullscreen}
      >
        <View style={styles.safariFullscreenContainer}>
          <StatusBar hidden={true} />
          
          {/* Safari-like Video Player */}
          <View style={styles.safariVideoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: roadmap.videoUrl }}
              style={styles.safariVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              isLooping={false}
              volume={1.0}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              useNativeControls={true}
            />
          </View>
          
          {/* Safari-like Controls */}
          <View style={styles.safariControls}>
            {/* Top Bar */}
            <View style={styles.safariTopBar}>
              <TouchableOpacity 
                style={styles.safariBackButton}
                onPress={exitFullscreen}
              >
                <Text style={styles.safariBackText}>Done</Text>
              </TouchableOpacity>
              <Text style={styles.safariTitle}>{roadmap.title}</Text>
              <View style={styles.safariSpacer} />
            </View>
          </View>
        </View>
      </Modal>
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
  // Fullscreen Modal Styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenDoubleTapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 1,
  },
  fullscreenDoubleTapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 1,
  },
  fullscreenDoubleTapIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  fullscreenVolumeIndicator: {
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
  fullscreenBrightnessIndicator: {
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
  fullscreenSeekPreview: {
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
  fullscreenControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  fullscreenTopControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  fullscreenExitButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCenterControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenBigPlayButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fullscreenBottomControls: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  fullscreenProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  fullscreenAdvancedControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  // Simple Video Styles - Like iPhone Safari
  simpleVideoContainer: {
    flex: 1,
    marginTop: 60,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  simpleVideo: {
    width: '100%',
    height: '100%',
  },
  simplePlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  simplePlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  simplePlayIcon: {
    color: '#000000',
    fontSize: 30,
    marginLeft: 4,
  },
  simplePlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Simple Fullscreen Styles
  simpleFullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleFullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  simpleExitButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  simpleExitText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Video Section Styles
  videoSection: {
    padding: 20,
    backgroundColor: '#000000',
  },
  videoSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  videoContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playIcon: {
    color: '#000000',
    fontSize: 24,
    marginLeft: 3,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Safari-like Fullscreen Styles
  safariFullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safariVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safariVideo: {
    width: '100%',
    height: '100%',
  },
  safariControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
  },
  safariTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  safariBackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  safariBackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  safariTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  safariSpacer: {
    width: 60,
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
