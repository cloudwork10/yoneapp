import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../../config/api';
import { useUser } from '../../contexts/UserContext';
import { makeAuthenticatedRequest } from '../../utils/tokenRefresh';

const { width, height } = Dimensions.get('window');

interface Advice {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  likes: number;
  isLiked: boolean;
  duration: string;
  thumbnail: string;
  isRecorded: boolean;
  audioUrl?: string;
}

export default function AdvicesScreen() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [audioStates, setAudioStates] = useState<{[key: string]: {
    isPlaying: boolean;
    position: number;
    duration: number;
    sound: Audio.Sound | null;
  }}>({});

  // Fetch advices from API
  const fetchAdvices = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Clear existing data first to force refresh
      console.log('💡 Clearing existing advices data...');
      setAdvices([]);
      setLoading(true);
      setError('');
      
      console.log('💡 Fetching advices from API...');
      const timestamp = Date.now();
      const apiUrl = `${API_BASE_URL}/api/public/content/advices?t=${timestamp}`;
      console.log('💡 API URL:', apiUrl);
      const response = await fetch(apiUrl);
      
      console.log('💡 Response status:', response.status);
      console.log('💡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('💡 Full API response:', JSON.stringify(data, null, 2));
        const fetchedAdvices = data.data.advices || [];
        
        console.log('💡 Fetched advices count:', fetchedAdvices.length);
        console.log('💡 Fetched advices details:', fetchedAdvices.map((a: any) => ({
          _id: a._id,
          title: a.title,
          content: a.content,
          category: a.category,
          author: a.author,
          thumbnail: a.thumbnail,
          isActive: a.isActive,
          createdAt: a.createdAt
        })));
        
        console.log('💡 Raw advices data:', fetchedAdvices.map((a: any) => ({ 
          id: a._id, 
          title: a.title, 
          content: a.content,
          category: a.category,
          thumbnail: a.thumbnail,
          author: a.author 
        })));
        
        // Transform data to match frontend interface
        const transformedAdvices = fetchedAdvices
          .filter((advice: any) => advice.title && advice.title.trim() !== '') // Filter out empty titles
          .map((advice: any) => ({
            id: advice._id,
            title: advice.title || 'نصيحة مفيدة',
            category: advice.category || 'motivation',
            content: advice.content || 'نصيحة مفيدة ومهمة لتحسين حياتك المهنية والشخصية.',
            author: advice.author || 'فريق يون',
            likes: advice.likes || 0,
            isLiked: false, // Default to false, can be enhanced with user preferences
            duration: advice.duration || '5 min read',
            thumbnail: advice.thumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            isRecorded: advice.isRecorded || false,
            audioUrl: advice.audioUrl || ''
          }));
        
        console.log('💡 Transformed advices:', transformedAdvices.map((a: any) => ({ 
          id: a.id, 
          title: a.title, 
          category: a.category,
          thumbnail: a.thumbnail,
          author: a.author 
        })));
        
        setAdvices(transformedAdvices);
        console.log('💡 Advices state updated, count:', transformedAdvices.length);
        console.log('💡 New advices data:', transformedAdvices.map((a: any) => ({ 
          id: a.id, 
          title: a.title, 
          content: a.content,
          category: a.category,
          author: a.author,
          thumbnail: a.thumbnail
        })));
        
        // Log available categories in the data
        const availableCategories = [...new Set(transformedAdvices.map((a: any) => a.category))];
        console.log('💡 Available categories in data:', availableCategories);
        
        // Reset category selection to 'all' when new data is loaded
        if (selectedCategory !== 'all') {
          console.log('💡 Resetting category selection to "all"');
          setSelectedCategory('all');
        }
        
        // Force UI update by triggering a re-render
        console.log('💡 Forcing UI update...');
        setRefreshKey(prev => prev + 1);
      } else {
        setError('Failed to load advices');
      }
    } catch (error) {
      console.error('Error fetching advices:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Check user subscription status
  const checkSubscription = async () => {
    if (!user) return;

    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/payments/subscription`);
      const data = await response.json();
      
      if (data.status === 'success' && data.data.subscription) {
        const subscription = data.data.subscription;
        const isActive = subscription.status === 'active' && new Date(subscription.endDate) > new Date();
        setHasActiveSubscription(isActive);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    }
  };

  // Initialize audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Error setting up audio mode:', error);
      }
    };
    
    setupAudio();
    
    return () => {
      // Cleanup all audio when component unmounts
      Object.values(audioStates).forEach(audioState => {
        if (audioState.sound) {
          audioState.sound.unloadAsync().catch(console.error);
        }
      });
    };
  }, []);

  // Fetch advices when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('💡 Advices screen focused, refreshing data...');
      fetchAdvices();
      checkSubscription();
    }, [])
  );

  const categories = [
    { id: 'all', name: 'All', icon: '🌟', color: '#E50914' },
    { id: 'career-shift', name: 'Career Change', icon: '🚀', color: '#FF6B35' },
    { id: 'kids', name: 'Kids & Family', icon: '👶', color: '#4ECDC4' },
    { id: 'motivation', name: 'Motivation', icon: '💪', color: '#45B7D1' },
    { id: 'success', name: 'Success Tips', icon: '🏆', color: '#96CEB4' },
    { id: 'programming', name: 'Programming', icon: '💻', color: '#9B59B6' },
    { id: 'business', name: 'Business', icon: '💼', color: '#F39C12' },
  ];

  const [advices, setAdvices] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredAdvices = selectedCategory === 'all' 
    ? advices 
    : advices.filter(advice => advice.category === selectedCategory);
    
  // Log filtering information
  console.log('💡 Category filtering - selectedCategory:', selectedCategory);
  console.log('💡 Total advices:', advices.length);
  console.log('💡 Filtered advices:', filteredAdvices.length);
  console.log('💡 Current advices in state:', advices.map((a: any) => ({ 
    id: a.id, 
    title: a.title, 
    content: a.content,
    category: a.category,
    author: a.author,
    thumbnail: a.thumbnail
  })));
  console.log('💡 Filtered advices data:', filteredAdvices.map((a: any) => ({ 
    id: a.id, 
    title: a.title, 
    content: a.content,
    category: a.category,
    author: a.author,
    thumbnail: a.thumbnail
  })));

  const handleLike = (id: string) => {
    setAdvices(prev => prev.map(advice => 
      advice.id === id 
        ? { 
            ...advice, 
            isLiked: !advice.isLiked,
            likes: advice.isLiked ? advice.likes - 1 : advice.likes + 1
          }
        : advice
    ));
  };

  const playAudio = async (audioUrl: string, adviceId: string) => {
    try {
      // Stop all other audios first
      await stopAllAudios();

      // Check if this audio is already loaded
      if (audioStates[adviceId]?.sound) {
        // Resume existing audio
        await audioStates[adviceId].sound!.playAsync();
        setAudioStates(prev => ({
          ...prev,
          [adviceId]: {
            ...prev[adviceId],
            isPlaying: true
          }
        }));
        setActiveAudioId(adviceId);
        return;
      }

      // Load new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true, 
          isLooping: false
        }
      );

      // Set up status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setAudioStates(prev => ({
            ...prev,
            [adviceId]: {
              ...prev[adviceId],
              isPlaying: status.isPlaying || false,
              position: status.positionMillis || 0,
              duration: status.durationMillis || 0
            }
          }));
        }
      });

      // Update state
      setAudioStates(prev => ({
        ...prev,
        [adviceId]: {
          isPlaying: true,
          position: 0,
          duration: 0,
          sound: sound
        }
      }));
      setActiveAudioId(adviceId);

    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopAllAudios = async () => {
    try {
      for (const [adviceId, audioState] of Object.entries(audioStates)) {
        if (audioState.sound) {
          await audioState.sound.unloadAsync();
        }
      }
      setAudioStates({});
      setActiveAudioId(null);
    } catch (error) {
      console.error('Error stopping all audios:', error);
    }
  };

  const pauseAudio = async (adviceId: string) => {
    try {
      if (audioStates[adviceId]?.sound) {
        await audioStates[adviceId].sound!.pauseAsync();
        setAudioStates(prev => ({
          ...prev,
          [adviceId]: {
            ...prev[adviceId],
            isPlaying: false
          }
        }));
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const stopAudio = async (adviceId: string) => {
    try {
      if (audioStates[adviceId]?.sound) {
        await audioStates[adviceId].sound!.unloadAsync();
        setAudioStates(prev => {
          const newState = { ...prev };
          delete newState[adviceId];
          return newState;
        });
        if (activeAudioId === adviceId) {
          setActiveAudioId(null);
        }
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };


  const renderAdviceCard = (advice: Advice, index: number) => {
    // First 2 advices are free, rest require subscription
    const isFreeAdvice = index < 2;
    const isLocked = !hasActiveSubscription && !isFreeAdvice;
    
    const handleAdvicePress = () => {
      if (isLocked) {
        Alert.alert(
          '🔒 Premium Content',
          'This advice is part of our premium content. Subscribe now to unlock all advices and get unlimited access!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Subscribe Now', onPress: () => router.push('/subscription') }
          ]
        );
      } else {
        // Handle advice opening logic here
        console.log('Opening advice:', advice.title);
      }
    };
    
    return (
    <TouchableOpacity 
      key={`advice-${advice.id}`} 
      style={[styles.adviceCard, isLocked && styles.lockedCard]}
      onPress={handleAdvicePress}
    >
      <ImageBackground
        source={{ uri: advice.thumbnail }}
        style={styles.adviceThumbnail}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.adviceGradient}
        >
          <View style={styles.adviceHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>
                {categories.find(cat => cat.id === advice.category)?.icon}
              </Text>
              <Text style={styles.categoryText}>
                {categories.find(cat => cat.id === advice.category)?.name}
              </Text>
            </View>
            
            {advice.isRecorded && (
              <View style={styles.recordedBadge}>
                <Text style={styles.recordedIcon}>🎙️</Text>
              </View>
            )}
            
            {isLocked && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>🔒</Text>
              </View>
            )}
          </View>
          
           <View style={styles.adviceContent}>
             <Text style={styles.adviceTitle} numberOfLines={2}>
               {advice.title}
             </Text>
             <Text style={styles.adviceAuthor}>by {advice.author}</Text>
           </View>
         </LinearGradient>
       </ImageBackground>
       
       {/* Audio Player Section */}
       {advice.isRecorded && advice.audioUrl && (
         <View style={styles.audioPlayerSection}>
           <View style={styles.audioPlayer}>
             <TouchableOpacity 
               style={styles.audioPlayButton}
               onPress={() => {
                 if (activeAudioId === advice.id) {
                   if (audioStates[advice.id]?.isPlaying) {
                     pauseAudio(advice.id);
                   } else {
                     playAudio(advice.audioUrl!, advice.id);
                   }
                 } else {
                   playAudio(advice.audioUrl!, advice.id);
                 }
               }}
             >
               <Text style={styles.audioPlayIcon}>
                 {activeAudioId === advice.id && audioStates[advice.id]?.isPlaying ? '⏸️' : '▶️'}
               </Text>
             </TouchableOpacity>
             
             <View style={styles.audioInfo}>
               <View style={styles.audioProgressBar}>
                 <View 
                   style={[
                     styles.audioProgress, 
                     { 
                       width: activeAudioId === advice.id && audioStates[advice.id]?.duration > 0 
                         ? `${(audioStates[advice.id].position / audioStates[advice.id].duration) * 100}%` 
                         : '0%' 
                     }
                   ]} 
                 />
               </View>
               <View style={styles.audioTime}>
                 <Text style={styles.audioTimeText}>
                   {activeAudioId === advice.id && audioStates[advice.id]
                     ? `${Math.floor(audioStates[advice.id].position / 1000 / 60)}:${Math.floor((audioStates[advice.id].position / 1000) % 60).toString().padStart(2, '0')}`
                     : '0:00'
                   }
                 </Text>
                 <Text style={styles.audioTimeText}>
                   {activeAudioId === advice.id && audioStates[advice.id]?.duration > 0
                     ? `${Math.floor(audioStates[advice.id].duration / 1000 / 60)}:${Math.floor((audioStates[advice.id].duration / 1000) % 60).toString().padStart(2, '0')}`
                     : advice.duration
                   }
                 </Text>
               </View>
             </View>
             
             <TouchableOpacity 
               style={styles.audioVolumeButton}
               onPress={() => {
                 if (activeAudioId === advice.id) {
                   stopAudio(advice.id);
                 }
               }}
             >
               <Text style={styles.audioVolumeIcon}>🔊</Text>
             </TouchableOpacity>
           </View>
         </View>
       )}
      
       <View style={styles.adviceFooter}>
         <View style={styles.adviceMeta}>
           <Text style={styles.duration}>{advice.duration}</Text>
           <TouchableOpacity 
             style={styles.likeButton}
             onPress={() => handleLike(advice.id)}
           >
             <Text style={styles.likeIcon}>
               {advice.isLiked ? '❤️' : '🤍'}
             </Text>
             <Text style={styles.likeCount}>{advice.likes}</Text>
           </TouchableOpacity>
         </View>
       </View>
    </TouchableOpacity>
  );

}

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                console.log('💡 Pull to refresh triggered');
                setRefreshKey(prev => prev + 1);
                fetchAdvices();
              }}
              tintColor="#FFFFFF"
              colors={['#E50914']}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>Advice Center</Text>
                <Text style={styles.subtitle}>Expert guidance for life and career development</Text>
              </View>
              <TouchableOpacity 
                style={styles.refreshHeaderButton} 
                onPress={() => {
                  console.log('💡 Manual refresh triggered');
                  setRefreshKey(prev => prev + 1);
                  fetchAdvices();
                }}
              >
                <Text style={styles.refreshHeaderButtonText}>🔄</Text>
              </TouchableOpacity>
            </View>
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
                key={`advice-category-${category.id}`}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => {
                  console.log('💡 Category selected:', category.id);
                  setSelectedCategory(category.id);
                }}
              >
                <Text style={styles.categoryButtonIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Simple Loading State */}
          {loading && (
            <View style={styles.simpleLoadingContainer}>
              <Text style={styles.simpleLoadingText}>Loading advices...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => {
                setRefreshKey(prev => prev + 1);
                fetchAdvices();
              }}>
                <Text style={styles.retryButtonText}>🔄 Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAdvices.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💡</Text>
              <Text style={styles.emptyTitle}>No advice available</Text>
              <Text style={styles.emptyText}>New advice will be added soon</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={() => {
                setRefreshKey(prev => prev + 1);
                fetchAdvices();
              }}>
                <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Advice Cards */}
          {!loading && !error && filteredAdvices.length > 0 && (
            <View style={styles.advicesContainer} key={refreshKey}>
              {(() => {
                console.log('💡 Rendering advices in UI:', filteredAdvices.length);
                console.log('💡 Advices data:', filteredAdvices.map((a: any) => ({ 
                  id: a.id, 
                  title: a.title, 
                  content: a.content,
                  category: a.category,
                  thumbnail: a.thumbnail,
                  author: a.author 
                })));
                
                return filteredAdvices.map((advice, index) => renderAdviceCard(advice, index));
              })()}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  refreshHeaderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  refreshHeaderButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderColor: 'rgba(229, 9, 20, 0.5)',
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#E50914',
    fontWeight: '600',
  },
  advicesContainer: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 100,
  },
  adviceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  adviceThumbnail: {
    height: 200,
    width: '100%',
  },
  adviceGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  adviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recordedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordedIcon: {
    fontSize: 12,
  },
  adviceContent: {
    marginTop: 'auto',
  },
  adviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 26,
  },
  adviceAuthor: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  audioPlayerSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  audioPlayButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  audioPlayIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  audioInfo: {
    flex: 1,
  },
  audioProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  audioProgress: {
    height: '100%',
    width: '30%',
    backgroundColor: '#E50914',
    borderRadius: 3,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  audioTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  audioTimeText: {
    fontSize: 13,
    color: '#CCCCCC',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  audioVolumeButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  audioVolumeIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  adviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  adviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  duration: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIcon: {
    fontSize: 16,
  },
  likeCount: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  premiumBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lockedCard: {
    opacity: 0.7,
  },
  // Loading, Error, and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    marginHorizontal: 20,
  },
  loadingText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    marginHorizontal: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  errorText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    marginHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  // Skeleton Styles
  // Simple Loading Styles
  simpleLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  simpleLoadingText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
  },
});