import { useFocusEffect } from '@react-navigation/native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

// Sample episodes data
const episodes = [
  {
    id: 1,
    title: "بداية الرحلة البرمجية",
    description: "كيف بدأت رحلتي في عالم البرمجة والتحديات التي واجهتها",
    duration: "15:30",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    category: "البدايات",
    views: 1250,
    likes: 89
  },
  {
    id: 2,
    title: "أخطاء المبرمج المبتدئ",
    description: "الأخطاء الشائعة التي يرتكبها المبرمجون المبتدئون وكيفية تجنبها",
    duration: "18:45",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    category: "التعلم",
    views: 2100,
    likes: 156
  },
  {
    id: 3,
    title: "فن حل المشاكل البرمجية",
    description: "كيفية التفكير كالمبرمجين المحترفين في حل المشاكل المعقدة",
    duration: "22:15",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    category: "المهارات",
    views: 3200,
    likes: 234
  },
  {
    id: 4,
    title: "البرمجة كفن وإبداع",
    description: "كيف تصبح البرمجة أكثر من مجرد كتابة كود، بل فن وإبداع حقيقي",
    duration: "19:20",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    category: "الفلسفة",
    views: 1800,
    likes: 142
  },
  {
    id: 5,
    title: "مستقبل البرمجة والذكاء الاصطناعي",
    description: "كيف سيغير الذكاء الاصطناعي من مستقبل البرمجة والمبرمجين",
    duration: "25:10",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    category: "المستقبل",
    views: 4500,
    likes: 378
  },
  {
    id: 6,
    title: "ثقافة المبرمجين حول العالم",
    description: "كيف تختلف ثقافة البرمجة بين الدول والثقافات المختلفة",
    duration: "20:35",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    category: "الثقافة",
    views: 2800,
    likes: 201
  },
  {
    id: 7,
    title: "التوازن بين العمل والحياة",
    description: "كيف يحقق المبرمج التوازن بين العمل المكثف والحياة الشخصية",
    duration: "17:50",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    category: "الحياة",
    views: 1900,
    likes: 167
  },
  {
    id: 8,
    title: "البرمجة والتعلم المستمر",
    description: "لماذا يجب على المبرمج أن يتعلم باستمرار وكيفية ذلك",
    duration: "21:25",
    thumbnail: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    category: "التطوير",
    views: 2600,
    likes: 198
  },
  {
    id: 9,
    title: "البرمجة والتأثير الاجتماعي",
    description: "كيف يمكن للبرمجة أن تحدث تغييراً إيجابياً في المجتمع",
    duration: "23:40",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    category: "التأثير",
    views: 3400,
    likes: 289
  },
  {
    id: 10,
    title: "رؤية مستقبلية للبرمجة",
    description: "توقعاتي ورؤيتي لمستقبل البرمجة والتكنولوجيا في السنوات القادمة",
    duration: "26:15",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    category: "الرؤية",
    views: 5200,
    likes: 445
  }
];

export default function ProgrammerThoughts() {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);

  // Fetch episodes from database
  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      console.log('💭 Fetching programmer thoughts from database...');
      
      const response = await fetch('http://localhost:3000/api/public/programmer-thoughts');
      
      if (response.ok) {
        const data = await response.json();
        console.log('💭 Episodes fetched:', data.data.count, 'episodes');
        const dbEpisodes = data.data.thoughts || [];
        
        // Convert database format to UI format
        const formattedEpisodes = dbEpisodes.map(thought => ({
          id: thought._id,
          title: thought.title,
          description: thought.description,
          duration: thought.duration,
          thumbnail: thought.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
          videoUrl: thought.videoUrl,
          category: thought.category,
          views: thought.views || 0,
          likes: thought.likes || 0,
          season: thought.season || 1,
          episodeNumber: thought.episodeNumber || 1,
          keyPoints: thought.keyPoints || [],
          resources: thought.resources || [],
          tags: thought.tags || [],
          transcript: thought.transcript || '',
          isActive: thought.isActive,
          isFeatured: thought.isFeatured
        }));
        
        setEpisodes(formattedEpisodes);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(dbEpisodes.map(ep => ep.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        console.log('✅ Episodes loaded:', formattedEpisodes.length);
      } else {
        console.error('❌ Failed to fetch episodes:', response.status);
        // Fallback to static data
        setEpisodes(staticEpisodes);
      }
    } catch (error) {
      console.error('❌ Error fetching episodes:', error);
      // Fallback to static data
      setEpisodes(staticEpisodes);
    } finally {
      setLoading(false);
    }
  };

  // Static episodes as fallback
  const staticEpisodes = episodes;

  useEffect(() => {
    // Fetch episodes first
    fetchEpisodes();
    
    // Then start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh episodes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('💭 Thoughts screen focused, refreshing data...');
      fetchEpisodes();
    }, [])
  );

  const openEpisode = (episode) => {
    setSelectedEpisode(episode);
  };

  const closeEpisode = () => {
    setSelectedEpisode(null);
  };

  const renderEpisodeCard = (episode, index) => {
    const cardAnim = new Animated.Value(0);
    
    // Start animation immediately
    setTimeout(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 800,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, 0);

    return (
      <Animated.View
        key={episode.id}
        style={[
          styles.episodeCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.episodeTouchable}
          onPress={() => openEpisode(episode)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
            style={styles.episodeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Episode Number Badge */}
            <View style={styles.episodeNumberBadge}>
              <Text style={styles.episodeNumberText}>{episode.id}</Text>
            </View>

            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: episode.thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.playButtonOverlay}>
                <View style={styles.playButton}>
                  <Text style={styles.playButtonText}>▶</Text>
                </View>
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{episode.duration}</Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.episodeContent}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>{episode.category}</Text>
              </View>
              
              <Text style={styles.episodeTitle} numberOfLines={2}>
                {episode.title}
              </Text>
              
              <Text style={styles.episodeDescription} numberOfLines={3}>
                {episode.description}
              </Text>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>👁️</Text>
                  <Text style={styles.statText}>{episode.views.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>❤️</Text>
                  <Text style={styles.statText}>{episode.likes}</Text>
                </View>
              </View>
            </View>

            {/* Shine Effect */}
            <View style={styles.shineEffect} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderVideoModal = () => {
    if (!selectedEpisode) return null;

    return (
      <Modal
        visible={!!selectedEpisode}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={closeEpisode}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
          <View style={styles.modalGradient}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeEpisode}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedEpisode.title}
              </Text>
            </View>

            {/* Video Player */}
            <View style={styles.videoContainer}>
              {selectedEpisode.videoUrl.includes('youtube.com') || 
               selectedEpisode.videoUrl.includes('vimeo.com') ? (
                <WebView
                  source={{ uri: selectedEpisode.videoUrl }}
                  style={styles.webView}
                  allowsFullscreenVideo={true}
                  mediaPlaybackRequiresUserAction={false}
                />
              ) : (
                <Video
                  source={{ uri: selectedEpisode.videoUrl }}
                  style={styles.video}
                  useNativeControls={true}
                  resizeMode="contain"
                  shouldPlay={false}
                />
              )}
            </View>

            {/* Episode Info */}
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeInfoTitle}>
                {selectedEpisode.title}
              </Text>
              <Text style={styles.episodeInfoDescription}>
                {selectedEpisode.description}
              </Text>
              
              <View style={styles.episodeInfoStats}>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatIcon}>⏱️</Text>
                  <Text style={styles.infoStatText}>{selectedEpisode.duration}</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatIcon}>👁️</Text>
                  <Text style={styles.infoStatText}>{selectedEpisode.views.toLocaleString()}</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatIcon}>❤️</Text>
                  <Text style={styles.infoStatText}>{selectedEpisode.likes}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
      <View style={styles.gradient}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>برنامج خواطر مبرمج</Text>
            <Text style={styles.headerSubtitle}>10 حلقات من الخبرات والتجارب</Text>
          </View>
        </Animated.View>

        {/* Episodes Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>💭 جاري تحميل الحلقات...</Text>
              <Text style={styles.loadingSubtext}>جلب البيانات من قاعدة البيانات</Text>
            </View>
          ) : episodes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📺 لا توجد حلقات حالياً</Text>
              <Text style={styles.emptySubtext}>أضف حلقات جديدة من الداشبورد لتظهر هنا</Text>
            </View>
          ) : (
            <View style={styles.episodesGrid}>
              {episodes.map((episode, index) => renderEpisodeCard(episode, index))}
            </View>
          )}
        </ScrollView>

        {/* Video Modal */}
        {renderVideoModal()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    backgroundColor: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  episodesGrid: {
    gap: 20,
  },
  episodeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  episodeTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  episodeGradient: {
    padding: 0,
    position: 'relative',
  },
  episodeNumberBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#FF6B35',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  episodeNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  thumbnailContainer: {
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  episodeContent: {
    padding: 20,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  episodeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  episodeDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-25deg' }],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalGradient: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    backgroundColor: '#000000',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
    backgroundColor: '#000000',
  },
  episodeInfo: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  episodeInfoTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  episodeInfoDescription: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  episodeInfoStats: {
    flexDirection: 'row',
    gap: 20,
  },
  infoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoStatIcon: {
    fontSize: 18,
  },
  infoStatText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Loading and Empty States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
});
