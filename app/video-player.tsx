import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface VideoData {
  id: string;
  title: string;
  type: 'course' | 'podcast';
  videoType: 'intro' | 'full-episode' | 'lecture';
  duration: string;
  instructor: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  isCompleted: boolean;
}

export default function VideoPlayerScreen() {
  const { videoId, type, videoType } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sample video data - in real app, fetch from API based on videoId
  const videoData: VideoData = {
    id: videoId as string || '1',
    title: type === 'course' 
      ? 'Complete React Native Development Course' 
      : 'The Future of AI in Mobile Development',
    type: type as 'course' | 'podcast',
    videoType: videoType as 'intro' | 'full-episode' | 'lecture',
    duration: videoType === 'intro' ? '5 min' : videoType === 'full-episode' ? '45 min' : '25 min',
    instructor: type === 'course' ? 'John Doe' : 'Sarah Chen',
    description: type === 'course' 
      ? 'Learn React Native from scratch and build real-world mobile applications. This comprehensive course covers everything from basic concepts to advanced topics.'
      : 'Join Sarah Chen as she explores the cutting-edge world of AI integration in mobile development. This comprehensive podcast covers everything from machine learning frameworks to real-world implementation strategies.',
    thumbnail: type === 'course' 
      ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      : 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    videoUrl: 'https://example.com/video',
    isCompleted: false,
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    Alert.alert(
      isPlaying ? 'Video Paused' : 'Video Playing',
      `${videoData.title} - ${isPlaying ? 'Paused' : 'Now Playing'}`
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getVideoIcon = () => {
    if (videoData.type === 'course') {
      return '📚';
    } else {
      return videoData.videoType === 'intro' ? '🎬' : '🎙️';
    }
  };

  const getVideoTypeLabel = () => {
    if (videoData.type === 'course') {
      return 'Course Lecture';
    } else {
      return videoData.videoType === 'intro' ? 'Podcast Intro' : 'Full Episode';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Video Player Area */}
        <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideo]}>
          <ImageBackground
            source={{ uri: videoData.thumbnail }}
            style={styles.videoBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.videoGradient}
            >
              {/* Top Controls */}
              <View style={styles.topControls}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTypeLabel}>{getVideoTypeLabel()}</Text>
                  <Text style={styles.videoDuration}>{videoData.duration}</Text>
                </View>
                <TouchableOpacity style={styles.fullscreenButton} onPress={handleFullscreen}>
                  <Text style={styles.fullscreenIcon}>{isFullscreen ? '⤓' : '⤢'}</Text>
                </TouchableOpacity>
              </View>

              {/* Center Play Button */}
              <View style={styles.centerControls}>
                <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                  <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '30%' }]} />
                  </View>
                  <Text style={styles.timeText}>2:15 / {videoData.duration}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Video Details */}
        <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsContent}>
            <View style={styles.videoHeader}>
              <Text style={styles.videoTitle}>{videoData.title}</Text>
              <View style={styles.videoMeta}>
                <Text style={styles.instructor}>By {videoData.instructor}</Text>
                <View style={styles.videoStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>{getVideoIcon()}</Text>
                    <Text style={styles.statText}>{getVideoTypeLabel()}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <Text style={styles.statText}>{videoData.duration}</Text>
                  </View>
                  {videoData.isCompleted && (
                    <View style={styles.statItem}>
                      <Text style={styles.statIcon}>✓</Text>
                      <Text style={styles.statText}>Completed</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About This {videoData.type === 'course' ? 'Lecture' : 'Episode'}</Text>
              <Text style={styles.description}>{videoData.description}</Text>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity style={styles.actionButton} onPress={handlePlayPause}>
                <Text style={styles.actionButtonText}>
                  {isPlaying ? 'Pause Video' : 'Play Video'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  {videoData.type === 'course' ? 'Download Lecture' : 'Download Episode'}
                </Text>
              </TouchableOpacity>
            </View>

            {videoData.type === 'course' && (
              <View style={styles.curriculumSection}>
                <Text style={styles.sectionTitle}>Course Curriculum</Text>
                <View style={styles.curriculumItem}>
                  <Text style={styles.curriculumIcon}>📚</Text>
                  <View style={styles.curriculumInfo}>
                    <Text style={styles.curriculumTitle}>Complete React Native Development</Text>
                    <Text style={styles.curriculumDuration}>12 hours • 45 lectures</Text>
                  </View>
                  <Text style={styles.curriculumStatus}>In Progress</Text>
                </View>
              </View>
            )}

            {videoData.type === 'podcast' && (
              <View style={styles.podcastSection}>
                <Text style={styles.sectionTitle}>Podcast Series</Text>
                <View style={styles.podcastItem}>
                  <Text style={styles.podcastIcon}>🎙️</Text>
                  <View style={styles.podcastInfo}>
                    <Text style={styles.podcastTitle}>AI in Mobile Development</Text>
                    <Text style={styles.podcastDuration}>8 episodes • 6 hours</Text>
                  </View>
                  <Text style={styles.podcastStatus}>Subscribed</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
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
  videoContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  fullscreenVideo: {
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  videoBackground: {
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  videoInfo: {
    alignItems: 'center',
  },
  videoTypeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  videoDuration: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  fullscreenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    marginLeft: 4,
  },
  bottomControls: {
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  detailsContent: {
    padding: 20,
  },
  videoHeader: {
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 30,
  },
  videoMeta: {
    marginBottom: 15,
  },
  instructor: {
    fontSize: 16,
    color: '#E50914',
    marginBottom: 10,
  },
  videoStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  descriptionSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  actionsSection: {
    marginBottom: 25,
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  curriculumSection: {
    marginBottom: 25,
  },
  curriculumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  curriculumIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  curriculumInfo: {
    flex: 1,
  },
  curriculumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  curriculumDuration: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  curriculumStatus: {
    fontSize: 12,
    color: '#E50914',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  podcastSection: {
    marginBottom: 25,
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  podcastIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  podcastInfo: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  podcastDuration: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  podcastStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
