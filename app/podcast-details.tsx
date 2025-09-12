import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PodcastEpisode {
  id: string;
  title: string;
  duration: string;
  url: string;
  thumbnail: string;
  description: string;
  isCompleted: boolean;
  category: string;
}

export default function PodcastDetailsScreen() {
  const { podcastId } = useLocalSearchParams();
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<PodcastEpisode | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Full Episode': true,
  });

  // Sample podcast data
  const podcast = {
    id: podcastId || '1',
    title: 'Programming & Technology Podcast',
    instructor: 'Ahmed Mohamed',
    rating: 4.8,
    students: 15420,
    duration: '12 hours',
    level: 'All Levels',
    language: 'English',
    description: 'A comprehensive podcast covering the latest technologies and programming with guests from top developers in the region.',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    introVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    episodes: [
      {
        id: '2',
        title: 'Full Episode',
        duration: '45:20',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        description: 'Complete episode about programming and technology - Learn advanced concepts and best practices',
        isCompleted: false,
        category: 'Full Episode'
      }
    ]
  };

  const handleEpisodePress = (episode: PodcastEpisode) => {
    setSelectedVideo(episode);
    setShowVideoModal(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };



  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSubscribe = () => {
    setIsSubscribed(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📖' },
    { id: 'episodes', label: 'Episodes', icon: '🎧' },
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'host', label: 'Host', icon: '👨‍💼' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Video Background */}
        <View style={styles.heroSection}>
          <View style={styles.heroVideoContainer}>
            <Video
              source={{ uri: podcast.introVideo }}
              style={styles.heroVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isIntroPlaying}
              isLooping={true}
              isMuted={isMuted}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
              style={styles.heroGradient}
            >
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              
              {/* Sound Control */}
              <TouchableOpacity
                style={styles.soundButton}
                onPress={toggleMute}
              >
                <Text style={styles.soundIcon}>
                  {isMuted ? '🔇' : '🔊'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.heroContent}>
                <Text style={styles.podcastTitle}>{podcast.title}</Text>
                <Text style={styles.podcastInstructor}>By {podcast.instructor}</Text>
                
                <View style={styles.podcastMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⭐</Text>
                    <Text style={styles.metaText}>{podcast.rating}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>👥</Text>
                    <Text style={styles.metaText}>{podcast.students.toLocaleString()}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱️</Text>
                    <Text style={styles.metaText}>{podcast.duration}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {['overview', 'episodes', 'host'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.tabButtonActive
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About the Podcast</Text>
              <Text style={styles.overviewText}>{podcast.description}</Text>
            </View>
            
            <View style={styles.podcastHighlights}>
              <Text style={styles.highlightsTitle}>What You'll Learn:</Text>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightIcon}>🚀</Text>
                <Text style={styles.highlightText}>Modern programming languages and frameworks</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightIcon}>💡</Text>
                <Text style={styles.highlightText}>Best practices from industry experts</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightIcon}>🔧</Text>
                <Text style={styles.highlightText}>Real-world project development techniques</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightIcon}>📱</Text>
                <Text style={styles.highlightText}>Mobile and web application development</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightIcon}>🤖</Text>
                <Text style={styles.highlightText}>AI and machine learning integration</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightIcon}>💼</Text>
                <Text style={styles.highlightText}>Career development and industry insights</Text>
              </View>
            </View>

            <View style={styles.podcastFormat}>
              <Text style={styles.formatTitle}>Podcast Format:</Text>
              <View style={styles.formatItem}>
                <Text style={styles.formatIcon}>🎙️</Text>
                <View style={styles.formatContent}>
                  <Text style={styles.formatLabel}>Interview Style</Text>
                  <Text style={styles.formatDescription}>Deep conversations with successful developers and tech leaders</Text>
                </View>
              </View>
              <View style={styles.formatItem}>
                <Text style={styles.formatIcon}>💬</Text>
                <View style={styles.formatContent}>
                  <Text style={styles.formatLabel}>Q&A Sessions</Text>
                  <Text style={styles.formatDescription}>Answering listener questions and solving coding challenges</Text>
                </View>
              </View>
              <View style={styles.formatItem}>
                <Text style={styles.formatIcon}>📚</Text>
                <View style={styles.formatContent}>
                  <Text style={styles.formatLabel}>Educational Series</Text>
                  <Text style={styles.formatDescription}>Step-by-step tutorials and concept explanations</Text>
                </View>
              </View>
            </View>

            <View style={styles.podcastBenefits}>
              <Text style={styles.benefitsTitle}>Why Listen to This Podcast:</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitNumber}>01</Text>
                <Text style={styles.benefitText}>Stay updated with the latest technology trends and industry news</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitNumber}>02</Text>
                <Text style={styles.benefitText}>Learn from experienced developers who share their real-world insights</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitNumber}>03</Text>
                <Text style={styles.benefitText}>Get practical tips and tricks that you can apply immediately</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitNumber}>04</Text>
                <Text style={styles.benefitText}>Build your network by learning about industry professionals</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'episodes' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎧 Podcast Episodes</Text>
              <Text style={styles.sectionSubtitle}>Listen and learn anytime</Text>
            </View>

            <View style={styles.podcastEpisodesContainer}>
              {podcast.episodes.map((episode, index) => (
                <TouchableOpacity
                  key={episode.id}
                  style={[
                    styles.episodeCardModern,
                    index === 0 && styles.episodeCardFirst
                  ]}
                  onPress={() => handleEpisodePress(episode)}
                >
                  <LinearGradient
                    colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
                    style={styles.episodeCardGradient}
                  >
                    <View style={styles.episodeCardHeader}>
                      <View style={styles.episodeCardHeaderLeft}>
                        <View style={styles.episodeCardIcon}>
                          <Text style={styles.episodeCardEmoji}>
                            {episode.category === 'Introduction' ? '🎬' : '🎵'}
                          </Text>
                        </View>
                        <View style={styles.episodeCardInfo}>
                          <Text style={styles.episodeCardTitle}>{episode.title}</Text>
                          <Text style={styles.episodeCardSubtitle}>
                            {episode.category === 'Introduction' ? 'Welcome Episode' : 'Complete Content'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.episodeCardStatus}>
                        {episode.isCompleted ? (
                          <View style={styles.episodeCompletedBadge}>
                            <Text style={styles.episodeCompletedIcon}>✓</Text>
                          </View>
                        ) : (
                          <View style={styles.episodePendingBadge}>
                            <Text style={styles.episodePendingIcon}>○</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.episodeCardBody}>
                      <ImageBackground
                        source={{ uri: episode.thumbnail }}
                        style={styles.episodeCardThumbnailLarge}
                        resizeMode="cover"
                      >
                        <LinearGradient
                          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                          style={styles.episodeCardThumbnailGradient}
                        >
                          <View style={styles.episodeCardPlayButton}>
                            <View style={styles.episodeCardPlayButtonInner}>
                              <Text style={styles.episodeCardPlayIcon}>▶</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </ImageBackground>
                      
                      <View style={styles.episodeCardFooter}>
                        <View style={styles.episodeCardDuration}>
                          <View style={styles.episodeDurationIcon}>
                            <Text style={styles.episodeDurationEmoji}>⏱️</Text>
                          </View>
                          <Text style={styles.episodeDurationText}>{episode.duration}</Text>
                        </View>
                        
                        <View style={styles.episodeCardType}>
                          <Text style={styles.episodeTypeText}>
                            {episode.category === 'Introduction' ? 'INTRO' : 'FULL EPISODE'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


        {activeTab === 'host' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👨‍💼 Host</Text>
              <Text style={styles.sectionSubtitle}>Meet the podcast host</Text>
            </View>

            <View style={styles.hostCard}>
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarText}>AM</Text>
              </View>
              <Text style={styles.hostName}>Ahmed Mohamed</Text>
              <Text style={styles.hostTitle}>Developer & Podcast Host</Text>
              <Text style={styles.hostBio}>
                Developer with 10 years of experience in app and web development. 
                Founder of the Programming & Technology Podcast and author of several programming books.
              </Text>
              
              <View style={styles.hostStats}>
                <View style={styles.hostStat}>
                  <Text style={styles.hostStatNumber}>50+</Text>
                  <Text style={styles.hostStatLabel}>Episodes</Text>
                </View>
                <View style={styles.hostStat}>
                  <Text style={styles.hostStatNumber}>15K+</Text>
                  <Text style={styles.hostStatLabel}>Listeners</Text>
                </View>
                <View style={styles.hostStat}>
                  <Text style={styles.hostStatNumber}>4.9</Text>
                  <Text style={styles.hostStatLabel}>Rating</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        </View>
      </ScrollView>

      {/* Audio Player Modal */}
      <Modal
        visible={showAudioModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowAudioModal(false)}
      >
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalContainer}>
          <View style={styles.audioHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAudioModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.audioTitle}>{selectedEpisode?.title}</Text>
            <Text style={styles.audioSubtitle}>Programming & Technology Podcast</Text>
          </View>
          
          <View style={styles.audioContainer}>
            <ImageBackground
              source={{ uri: selectedEpisode?.thumbnail }}
              style={styles.audioImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={styles.audioGradient}
              >
                <TouchableOpacity style={styles.playButton}>
                  <Text style={styles.playButtonText}>▶</Text>
                </TouchableOpacity>
              </LinearGradient>
            </ImageBackground>
          </View>
          
          <View style={styles.audioInfo}>
            <Text style={styles.audioDescription}>{selectedEpisode?.description}</Text>
            
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlButtonText}>⏮️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlButtonText}>⏯️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlButtonText}>⏭️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.audioActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>❤️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        </Modal>

        {/* Video Modal */}
        <Modal
          visible={showVideoModal}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={styles.videoModal}>
            <LinearGradient
              colors={['#000000', '#1a1a1a', '#000000']}
              style={styles.videoModalGradient}
            >
              <View style={styles.videoHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowVideoModal(false)}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
                <View style={styles.videoHeaderContent}>
                  <Text style={styles.videoModalTitle}>{selectedVideo?.title}</Text>
                  <Text style={styles.videoModalSubtitle}>Podcast Episode</Text>
                </View>
                <TouchableOpacity style={styles.shareVideoButton}>
                  <Text style={styles.shareVideoIcon}>📤</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.videoContainer}>
                {selectedVideo && (
                  <Video
                    source={{ uri: selectedVideo.url }}
                    style={styles.videoPlayer}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={true}
                    isLooping={false}
                    useNativeControls={true}
                  />
                )}
              </View>
              
              <View style={styles.videoInfo}>
                <View style={styles.videoInfoHeader}>
                  <Text style={styles.videoInfoTitle}>About This Episode</Text>
                  <View style={styles.videoInfoMeta}>
                    <Text style={styles.videoInfoDuration}>⏱️ {selectedVideo?.duration}</Text>
                    <Text style={styles.videoInfoType}>🎧 Podcast Episode</Text>
                  </View>
                </View>
                <Text style={styles.videoModalDescription}>{selectedVideo?.description}</Text>
                
                <View style={styles.videoActions}>
                  <TouchableOpacity style={styles.videoActionButton}>
                    <Text style={styles.videoActionIcon}>👍</Text>
                    <Text style={styles.videoActionText}>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.videoActionButton}>
                    <Text style={styles.videoActionIcon}>💬</Text>
                    <Text style={styles.videoActionText}>Comment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.videoActionButton}>
                    <Text style={styles.videoActionIcon}>📤</Text>
                    <Text style={styles.videoActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Modal>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainScroll: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.6,
    paddingTop: 50,
  },
  heroVideoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  heroContent: {
    paddingBottom: 0,
  },
  podcastTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  podcastInstructor: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  podcastMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  metaText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  overviewSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  overviewText: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 25,
  },
  podcastHighlights: {
    marginBottom: 25,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 15,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  highlightText: {
    fontSize: 15,
    color: '#CCCCCC',
    flex: 1,
    lineHeight: 22,
  },
  podcastFormat: {
    marginBottom: 25,
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 15,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 15,
  },
  formatIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  formatContent: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  formatDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  podcastBenefits: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  benefitNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
    width: 35,
    marginRight: 15,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 15,
    color: '#CCCCCC',
    flex: 1,
    lineHeight: 22,
  },
  tabsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 9, 20, 0.2)',
    marginTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#E50914',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#E50914',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 5,
  },
  overviewCards: {
    gap: 15,
  },
  overviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  episodesList: {
    marginTop: 15,
  },
  episodeCategorySection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 0,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.1)',
    overflow: 'hidden',
  },
  episodeCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    paddingBottom: 12,
    paddingHorizontal: 15,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 9, 20, 0.2)',
  },
  episodeCategoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
    flex: 1,
  },
  episodeCategoryCount: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#E50914',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '600',
    marginRight: 10,
  },
  expandIcon: {
    fontSize: 16,
    color: '#E50914',
    fontWeight: 'bold',
  },
  episodeHeadline: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 15,
    marginBottom: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 9, 20, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#E50914',
  },
  lastEpisodeHeadline: {
    borderBottomWidth: 0,
  },
  episodeHeadlineLeft: {
    marginRight: 15,
  },
  episodeHeadlineThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  episodeHeadlineImage: {
    width: '100%',
    height: '100%',
  },
  episodeHeadlineGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeHeadlinePlayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  episodeHeadlinePlayIcon: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  episodeHeadlineDuration: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  episodeHeadlineDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  episodeHeadlineContent: {
    flex: 1,
  },
  episodeHeadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  episodeHeadlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  episodeHeadlineCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeHeadlineCompletedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  episodeHeadlineDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  episodeHeadlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeHeadlineMetaText: {
    color: '#999999',
    fontSize: 12,
    marginRight: 8,
  },
  categoryChallenge: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginHorizontal: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 10,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeDifficulty: {
    fontSize: 12,
    color: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeTime: {
    fontSize: 12,
    color: '#999999',
  },
  graduationProject: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  projectIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E50914',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  projectIcon: {
    fontSize: 30,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  projectSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  projectDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 20,
  },
  projectFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  projectTimeline: {
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timelineWeek: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    width: 80,
  },
  timelineTask: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  projectMetaItem: {
    alignItems: 'center',
  },
  projectMetaIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  projectMetaText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  projectButton: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  projectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hostCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  hostAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  hostAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  hostName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  hostTitle: {
    fontSize: 16,
    color: '#E50914',
    marginBottom: 15,
  },
  hostBio: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  hostStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  hostStat: {
    alignItems: 'center',
  },
  hostStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  hostStatLabel: {
    fontSize: 12,
    color: '#999999',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  audioHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    position: 'absolute',
    top: -30,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  audioSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  audioContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  audioImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  audioGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#000000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  audioInfo: {
    alignItems: 'center',
  },
  audioDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 20,
  },
  audioActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
  },
  
  // New Podcast Episode Styles
  podcastEpisodesContainer: {
    paddingHorizontal: 0,
  },
  podcastEpisodeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  podcastEpisodeCardFirst: {
    marginTop: 10,
  },
  podcastEpisodeCardInner: {
    flexDirection: 'row',
    padding: 0,
  },
  podcastEpisodeThumbnail: {
    width: 120,
    height: 140,
    position: 'relative',
  },
  podcastEpisodeImage: {
    width: '100%',
    height: '100%',
  },
  podcastEpisodeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  podcastPlayButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastPlayIcon: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 2,
  },
  podcastEpisodeTypeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  podcastTypeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  podcastEpisodeContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  podcastEpisodeHeader: {
    marginBottom: 12,
  },
  podcastEpisodeTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  podcastEpisodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
    lineHeight: 24,
  },
  podcastEpisodeStatus: {
    marginTop: 2,
  },
  podcastEpisodeCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastEpisodeCompletedIcon: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  podcastEpisodePending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: 'transparent',
  },
  podcastEpisodeDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  podcastEpisodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  podcastEpisodeDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastDurationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  podcastDurationEmoji: {
    fontSize: 10,
  },
  podcastDurationText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  podcastEpisodeCategory: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  podcastCategoryText: {
    fontSize: 11,
    color: '#E50914',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Modern Episode Card Styles
  episodeCardModern: {
    marginBottom: 20,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  episodeCardFirst: {
    marginTop: 0,
  },
  episodeCardGradient: {
    padding: 0,
  },
  episodeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  episodeCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  episodeCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  episodeCardEmoji: {
    fontSize: 24,
  },
  episodeCardInfo: {
    flex: 1,
  },
  episodeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  episodeCardSubtitle: {
    fontSize: 14,
    color: '#E50914',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  episodeCardStatus: {
    marginLeft: 10,
  },
  episodeCompletedBadge: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  episodeCompletedIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  episodePendingBadge: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  episodePendingIcon: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  episodeCardBody: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  episodeCardThumbnailLarge: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  episodeCardThumbnail: {
    width: 100,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
  },
  episodeCardThumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeCardPlayButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  episodeCardPlayButtonInner: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeCardPlayIcon: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 2,
  },
  episodeCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  episodeCardDescription: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'left',
  },
  episodeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  episodeCardDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeDurationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(229, 9, 20, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  episodeDurationEmoji: {
    fontSize: 12,
  },
  episodeDurationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  episodeCardType: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.5)',
  },
  episodeTypeText: {
    fontSize: 11,
    color: '#E50914',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Video Modal Styles
  videoModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoModalGradient: {
    flex: 1,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  videoHeaderContent: {
    flex: 1,
    marginHorizontal: 15,
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  videoModalSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  shareVideoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareVideoIcon: {
    fontSize: 18,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: width,
    height: height * 0.4,
  },
  videoInfo: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  videoInfoHeader: {
    marginBottom: 15,
  },
  videoInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  videoInfoMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  videoInfoDuration: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  videoInfoType: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  videoModalDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  videoActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoActionIcon: {
    fontSize: 20,
  },
  videoActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 5,
    textAlign: 'center',
  },
  
  // Sound Control Button
  soundButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  soundIcon: {
    fontSize: 16,
    color: '#fff',
  },
});