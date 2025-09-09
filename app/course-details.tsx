import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Alert,
  ImageBackground,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: string;
  duration: string;
  level: string;
  description: string;
  whatYouWillLearn: string[];
  curriculum: {
    section: string;
    lectures: {
      title: string;
      duration: string;
      type: 'video' | 'reading' | 'quiz';
      isCompleted: boolean;
    }[];
  }[];
}

export default function CourseDetailsScreen() {
  const { courseId } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [enrolled, setEnrolled] = useState(false);

  // Sample course data - in real app, fetch from API
  const course: Course = {
    id: courseId as string || '1',
    title: 'Complete React Native Development Course',
    instructor: 'John Doe',
    rating: 4.8,
    students: 1250,
    price: 'Free',
    duration: '12 hours',
    level: 'Beginner to Advanced',
    description: 'Learn React Native from scratch and build real-world mobile applications. This comprehensive course covers everything from basic concepts to advanced topics like navigation, state management, and app deployment.',
    whatYouWillLearn: [
      'Build cross-platform mobile apps with React Native',
      'Master React Native navigation and routing',
      'Implement state management with Redux',
      'Integrate APIs and handle data fetching',
      'Deploy apps to App Store and Google Play',
      'Use React Native best practices and patterns'
    ],
    curriculum: [
      {
        section: 'Getting Started',
        lectures: [
          { title: 'Introduction to React Native', duration: '15 min', type: 'video', isCompleted: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { title: 'Setting up Development Environment', duration: '20 min', type: 'video', isCompleted: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { title: 'Your First React Native App', duration: '25 min', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { title: 'Understanding React Native Architecture', duration: '18 min', type: 'reading', isCompleted: false }
        ]
      },
      {
        section: 'Core Concepts',
        lectures: [
          { title: 'Components and Props', duration: '22 min', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { title: 'State and Lifecycle', duration: '28 min', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { title: 'Handling User Input', duration: '20 min', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
          { title: 'Styling and Layout', duration: '30 min', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
          { title: 'Quiz: Core Concepts', duration: '10 min', type: 'quiz', isCompleted: false }
        ]
      },
      {
        section: 'Navigation and Routing',
        lectures: [
          { title: 'React Navigation Setup', duration: '25 min', type: 'video', isCompleted: false },
          { title: 'Stack Navigation', duration: '30 min', type: 'video', isCompleted: false },
          { title: 'Tab Navigation', duration: '20 min', type: 'video', isCompleted: false },
          { title: 'Drawer Navigation', duration: '25 min', type: 'video', isCompleted: false }
        ]
      },
      {
        section: 'Advanced Topics',
        lectures: [
          { title: 'State Management with Redux', duration: '45 min', type: 'video', isCompleted: false },
          { title: 'API Integration', duration: '35 min', type: 'video', isCompleted: false },
          { title: 'Push Notifications', duration: '30 min', type: 'video', isCompleted: false },
          { title: 'App Deployment', duration: '40 min', type: 'video', isCompleted: false }
        ]
      }
    ]
  };

  const handleEnroll = () => {
    if (enrolled) {
      Alert.alert('Already Enrolled', 'You are already enrolled in this course!');
    } else {
      setEnrolled(true);
      Alert.alert('Success!', 'You have been enrolled in this course!');
    }
  };

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: width - 150, y: height - 250 });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.ValueXY({ x: width - 120, y: height - 200 })).current;
  
  // Creative animation values
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const morphAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const handlePlayVideo = (lecture: any) => {
    setSelectedVideo(lecture);
    setIsPlaying(true);
    setCurrentTime(0);
    setShowControls(true);
    
    // Start creative animations with multiple effects
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(tiltAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(particleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(colorAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
    ]).start();
    
    startPulseAnimation();
    startCreativeAnimations();
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
      // Position more centered
      setFloatingPosition({ x: width / 2 - 75, y: height / 2 - 75 });
      // Animate to floating position
      Animated.spring(floatingAnim, {
        toValue: { x: width / 2 - 75, y: height / 2 - 75 },
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

  const startCreativeAnimations = () => {
    // Morphing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(morphAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(morphAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
      ])
    ).start();

    // Wave animation
    Animated.loop(
      Animated.timing(waveAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();

    // Glow pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    // Color cycling
    Animated.loop(
      Animated.timing(colorAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
    ).start();
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
            source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
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
      // Completely different fullscreen mode - immersive cinema experience
      return (
        <Animated.View 
          style={[
            styles.cinemaModeContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim }
              ]
            }
          ]}
        >
        {/* Video Player - Fallback for now */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.cinemaVideo}
          resizeMode="cover"
        />

          {/* Cinema-style overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.3)']}
            style={styles.cinemaOverlay}
          >
            {/* Top Cinema Bar */}
            <Animated.View 
              style={[
                styles.cinemaTopBar,
                {
                  transform: [
                    { translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-60, 0]
                    })}
                  ]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.cinemaCloseButton} 
                onPress={handleCloseVideo}
              >
                <Text style={styles.cinemaCloseIcon}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.cinemaInfo}>
                <Text style={styles.cinemaTitle}>{selectedVideo.title}</Text>
                <Text style={styles.cinemaSubtitle}>{course.title}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.cinemaExitButton}
                onPress={handleFullscreenToggle}
              >
                <Text style={styles.cinemaExitIcon}>⤓</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Center Play/Pause Area */}
            <TouchableOpacity 
              style={styles.cinemaCenterArea}
              onPress={handlePlayPause}
              activeOpacity={1}
            >
              {!isPlaying && (
                <Animated.View 
                  style={[
                    styles.cinemaPlayButton,
                    {
                      transform: [
                        { scale: pulseAnim }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.cinemaPlayIcon}>▶</Text>
                </Animated.View>
              )}
            </TouchableOpacity>

            {/* Bottom Cinema Controls */}
            <Animated.View 
              style={[
                styles.cinemaBottomBar,
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
              {/* Progress Bar */}
              <View style={styles.cinemaProgressContainer}>
                <Text style={styles.cinemaTimeText}>
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity 
                  style={styles.cinemaProgressBar}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    const progress = locationX / (width - 100);
                    const newTime = progress * duration;
                    setCurrentTime(newTime);
                  }}
                >
                  <View style={[styles.cinemaProgressFill, { width: `${(currentTime / duration) * 100}%` }]} />
                  <View style={styles.cinemaProgressThumb} />
                </TouchableOpacity>
                <Text style={styles.cinemaTimeText}>
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>

              {/* Control Buttons */}
              <View style={styles.cinemaControlsRow}>
                <TouchableOpacity 
                  style={styles.cinemaControlButton}
                  onPress={() => setCurrentTime(Math.max(0, currentTime - 10))}
                >
                  <Text style={styles.cinemaControlIcon}>⏪</Text>
                  <Text style={styles.cinemaControlText}>10s</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cinemaControlButton}
                  onPress={handlePlayPause}
                >
                  <Text style={styles.cinemaControlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cinemaControlButton}
                  onPress={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                >
                  <Text style={styles.cinemaControlIcon}>⏩</Text>
                  <Text style={styles.cinemaControlText}>10s</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.cinemaLoadingContainer}>
                <Animated.View 
                  style={[
                    styles.cinemaLoadingSpinner,
                    {
                      transform: [
                        { rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })}
                      ]
                    }
                  ]}
                />
                <Text style={styles.cinemaLoadingText}>Loading...</Text>
              </View>
            )}

            {/* Error Message */}
            {hasError && (
              <View style={styles.cinemaErrorContainer}>
                <Text style={styles.cinemaErrorIcon}>⚠️</Text>
                <Text style={styles.cinemaErrorText}>Video failed to load</Text>
                <TouchableOpacity 
                  style={styles.cinemaRetryButton}
                  onPress={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                >
                  <Text style={styles.cinemaRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      );
    }

    // Creative small inline mode with real video
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
              },
              {
                rotateX: tiltAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg']
                })
              },
              {
                rotateY: tiltAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '3deg']
                })
              }
            ]
          }
        ]}
      >
        {/* Creative Particle Effects */}
        <Animated.View 
          style={[
            styles.particleContainer,
            {
              opacity: particleAnim,
              transform: [
                {
                  scale: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2]
                  })
                }
              ]
            }
          ]}
        >
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  transform: [
                    {
                      rotate: particleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${360 + i * 45}deg`]
                      })
                    },
                    {
                      scale: particleAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1, 0.8]
                      })
                    }
                  ]
                }
              ]}
            />
          ))}
        </Animated.View>
        {/* Video Player - Fallback for now */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.smallVideoBackground}
          resizeMode="cover"
        />

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
            {/* Glow Effect */}
            <Animated.View 
              style={[
                styles.playButtonGlow,
                {
                  opacity: glowAnim,
                  transform: [
                    { scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.3]
                    })}
                  ]
                }
              ]}
            />
            
            {/* Morphing Play Button */}
            <Animated.View 
              style={[
                styles.smallPlayButton,
                {
                  transform: [
                    { scale: pulseAnim },
                    {
                      rotate: morphAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ],
                  borderRadius: morphAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [35, 20, 35]
                  })
                }
              ]}
            >
              <Text style={styles.smallPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </Animated.View>
            
            {/* Wave Effect */}
            <Animated.View 
              style={[
                styles.waveEffect,
                {
                  transform: [
                    {
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5]
                      })
                    }
                  ],
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 0.4, 0]
                  })
                }
              ]}
            />
          </TouchableOpacity>

          {/* Small Video Bottom Controls */}
          <View style={styles.smallVideoBottom}>
            <View style={styles.smallProgressContainer}>
              <TouchableOpacity 
                style={styles.smallProgressBar}
                onPress={(event) => {
                  const { locationX } = event.nativeEvent;
                  const progress = locationX / (width - 40);
                  const newTime = progress * duration;
                  setCurrentTime(newTime);
                }}
              >
                <View style={[styles.smallProgressFill, { width: `${(currentTime / duration) * 100}%` }]} />
              </TouchableOpacity>
              <Text style={styles.smallTimeText}>
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.smallLoadingContainer}>
              <Animated.View 
                style={[
                  styles.smallLoadingSpinner,
                  {
                    transform: [
                      { rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })}
                    ]
                  }
                ]}
              />
            </View>
          )}

          {/* Error Message */}
          {hasError && (
            <View style={styles.smallErrorContainer}>
              <Text style={styles.smallErrorIcon}>⚠️</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>About This Course</Text>
        <Text style={styles.description}>{course.description}</Text>
      </View>

      <View style={styles.learnSection}>
        <Text style={styles.sectionTitle}>What You'll Learn</Text>
        {course.whatYouWillLearn.map((item, index) => (
          <View key={index} style={styles.learnItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.learnText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.instructorSection}>
        <Text style={styles.sectionTitle}>Instructor</Text>
        <View style={styles.instructorCard}>
          <View style={styles.instructorAvatar}>
            <Text style={styles.instructorInitials}>{course.instructor.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{course.instructor}</Text>
            <Text style={styles.instructorTitle}>Senior Mobile Developer</Text>
            <Text style={styles.instructorStats}>5+ years experience • 10,000+ students</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCurriculum = () => (
    <View style={styles.tabContent}>
      <View style={styles.curriculumHeader}>
        <Text style={styles.curriculumTitle}>Course Curriculum</Text>
        <Text style={styles.curriculumSubtitle}>{course.curriculum.length} sections • {course.curriculum.reduce((total, section) => total + section.lectures.length, 0)} lectures</Text>
      </View>

      {course.curriculum.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionName}>{section.section}</Text>
            <Text style={styles.sectionCount}>{section.lectures.length} lectures</Text>
          </View>
          
          {section.lectures.map((lecture, lectureIndex) => (
            <TouchableOpacity 
              key={lectureIndex} 
              style={styles.lectureItem}
              onPress={() => handlePlayVideo(lecture)}
            >
              <View style={styles.lectureIcon}>
                <Text style={styles.lectureIconText}>
                  {lecture.type === 'video' ? '▶' : lecture.type === 'reading' ? '📖' : '❓'}
                </Text>
              </View>
              <View style={styles.lectureInfo}>
                <Text style={styles.lectureTitle}>{lecture.title}</Text>
                <Text style={styles.lectureDuration}>{lecture.duration}</Text>
              </View>
              {lecture.isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.ratingNumber}>{course.rating}</Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text key={star} style={styles.star}>⭐</Text>
          ))}
        </View>
        <Text style={styles.ratingCount}>({course.students} ratings)</Text>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitials}>JS</Text>
          </View>
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>Jane Smith</Text>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={styles.star}>⭐</Text>
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reviewText}>
          "Excellent course! The instructor explains everything clearly and the projects are very practical. 
          I was able to build my first mobile app after completing this course."
        </Text>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitials}>MJ</Text>
          </View>
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>Mike Johnson</Text>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={styles.star}>⭐</Text>
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reviewText}>
          "Great content and well-structured. The instructor is knowledgeable and responsive to questions. 
          Highly recommended for anyone wanting to learn React Native."
        </Text>
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
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseInstructor}>By {course.instructor}</Text>
            
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statText}>{course.rating}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statText}>{course.students.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={styles.statText}>{course.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statText}>{course.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Course Info Bar */}
        <View style={styles.infoBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{course.price}</Text>
            {course.price !== 'Free' && <Text style={styles.originalPrice}>$99.99</Text>}
          </View>
          <TouchableOpacity style={[styles.enrollButton, enrolled && styles.enrolledButton]} onPress={handleEnroll}>
            <Text style={styles.enrollButtonText}>
              {enrolled ? 'Enrolled' : 'Enroll Now'}
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
            style={[styles.tab, selectedTab === 'curriculum' && styles.activeTab]} 
            onPress={() => setSelectedTab('curriculum')}
          >
            <Text style={[styles.tabText, selectedTab === 'curriculum' && styles.activeTabText]}>Curriculum</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]} 
            onPress={() => setSelectedTab('reviews')}
          >
            <Text style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}>Reviews</Text>
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
          {selectedTab === 'curriculum' && renderCurriculum()}
          {selectedTab === 'reviews' && renderReviews()}
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
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 30,
  },
  courseInstructor: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  courseStats: {
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  enrollButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enrolledButton: {
    backgroundColor: '#4CAF50',
  },
  enrollButtonText: {
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
  curriculumHeader: {
    marginBottom: 20,
  },
  curriculumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  curriculumSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  sectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionCount: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  lectureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lectureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lectureIconText: {
    fontSize: 12,
    color: '#E50914',
  },
  lectureInfo: {
    flex: 1,
  },
  lectureTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  lectureDuration: {
    fontSize: 12,
    color: '#999999',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E50914',
    marginRight: 10,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  // Small Inline Video Player Styles
  smallVideoContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    height: 300,
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
    width: 150,
    height: 150,
    zIndex: 2000,
    borderRadius: 75,
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
  
  // Cinema Mode Styles
  cinemaModeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
  cinemaVideo: {
    width: '100%',
    height: '100%',
  },
  cinemaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  cinemaTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cinemaCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaCloseIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cinemaInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  cinemaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cinemaSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  cinemaExitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaExitIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  cinemaCenterArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaPlayButton: {
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
  cinemaPlayIcon: {
    color: '#FFFFFF',
    fontSize: 40,
    marginLeft: 4,
  },
  cinemaBottomBar: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cinemaProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cinemaTimeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  cinemaProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginHorizontal: 15,
    position: 'relative',
  },
  cinemaProgressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  cinemaProgressThumb: {
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
  cinemaControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  cinemaControlButton: {
    alignItems: 'center',
    padding: 10,
  },
  cinemaControlIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 4,
  },
  cinemaControlText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
  cinemaLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  cinemaLoadingSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    borderTopColor: '#E50914',
  },
  cinemaLoadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 10,
  },
  cinemaErrorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
  },
  cinemaErrorIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  cinemaErrorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  cinemaRetryButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  cinemaRetryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Small Video Loading & Error Styles
  smallLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  smallLoadingSpinner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    borderTopColor: '#E50914',
  },
  smallErrorContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  smallErrorIcon: {
    fontSize: 20,
  },
  
  // Creative Animation Styles
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E50914',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  playButtonGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E50914',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  waveEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E50914',
  },
});
