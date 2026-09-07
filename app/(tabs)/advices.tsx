import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    ImageBackground,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from '../../components/FixedBackBar';
import API_BASE_URL from '../../config/api';
import { isContentLocked } from '../../utils/contentAccess';
import {
  fetchSubscriptionAccess,
  showPremiumGateAlert,
} from '../../utils/subscriptionAccess';
import { useUser } from '../../contexts/UserContext';
import { showSignInAlert } from '../../hooks/useAuthGuard';
import { makeAuthenticatedRequest } from '../../utils/tokenRefresh';
import {
  DEFAULT_ADVICE_CATEGORIES,
  adviceCategoryMeta,
  fetchPublicAdviceCategories,
  mergeAdviceCategories,
} from '../../utils/adviceCategories';

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
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All', icon: '🌟', color: '#E50914' },
    ...DEFAULT_ADVICE_CATEGORIES.map((item, index) => adviceCategoryMeta(item.id, index, item.name)),
  ]);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionAccess, setSubscriptionAccess] = useState<any>(null);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioRate, setAudioRate] = useState(1);
  const seekTrackWidth = useRef(1);
  const [audioStates, setAudioStates] = useState<{[key: string]: {
    isPlaying: boolean;
    position: number;
    duration: number;
    sound: Audio.Sound | null;
  }}>({});
  const audioStatesRef = useRef(audioStates);
  audioStatesRef.current = audioStates;

  const formatClock = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
  };

  const PLAYBACK_RATES = [1, 1.5, 2];

  // Fetch advices from API
  const fetchAdvices = async () => {
    try {
      setLoading(true);
      setError('');
      const remoteCategories = await fetchPublicAdviceCategories().catch(() => null);
      if (remoteCategories) {
        setCategories([
          { id: 'all', name: 'All', icon: '🌟', color: '#E50914' },
          ...remoteCategories.map((item, index) => adviceCategoryMeta(item.id, index, item.name)),
        ]);
      }
      
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
            author: advice.author || 'فريق النادي',
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
        const remoteCategories = await fetchPublicAdviceCategories().catch(() => null);
        const fromAdvices = [...new Set(transformedAdvices.map((a: any) => a.category).filter(Boolean))]
          .map((id) => ({ id, name: id }));
        const nextCategories = remoteCategories
          ?? mergeAdviceCategories(DEFAULT_ADVICE_CATEGORIES, fromAdvices);
        setCategories([
          { id: 'all', name: 'All', icon: '🌟', color: '#E50914' },
          ...nextCategories.map((item, index) => adviceCategoryMeta(item.id, index, item.name)),
        ]);
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

  // Check user subscription + pending request status
  const checkSubscription = async () => {
    if (!user) return;

    try {
      const access = await fetchSubscriptionAccess();
      setSubscriptionAccess(access);
      setHasActiveSubscription(access.hasActiveSubscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
      setSubscriptionAccess({ status: 'none', hasActiveSubscription: false });
    }
  };

  const stopAllAudios = async () => {
    try {
      const states = audioStatesRef.current;
      await Promise.all(
        Object.values(states).map(async (audioState) => {
          if (!audioState.sound) return;
          try {
            await audioState.sound.stopAsync();
          } catch {
            // already stopped
          }
          try {
            await audioState.sound.unloadAsync();
          } catch {
            // already unloaded
          }
        })
      );
      setAudioStates({});
      setActiveAudioId(null);
    } catch (error) {
      console.error('Error stopping all audios:', error);
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
      Object.values(audioStatesRef.current).forEach((audioState) => {
        audioState.sound?.stopAsync().catch(() => {});
        audioState.sound?.unloadAsync().catch(() => {});
      });
    };
  }, []);

  // Fetch advices when screen comes into focus; stop audio when leaving
  useFocusEffect(
    useCallback(() => {
      fetchAdvices();
      checkSubscription();
      return () => {
        Object.values(audioStatesRef.current).forEach((audioState) => {
          audioState.sound?.stopAsync().catch(() => {});
          audioState.sound?.unloadAsync().catch(() => {});
        });
        setAudioStates({});
        setActiveAudioId(null);
      };
    }, [])
  );

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
      const existing = audioStatesRef.current[adviceId]?.sound;
      if (existing) {
        const status = await existing.getStatusAsync();
        if (status.isLoaded) {
          await existing.setVolumeAsync(audioVolume);
          await existing.setRateAsync(audioRate, true);
          if (!status.isPlaying) {
            await existing.playAsync();
          }
          setAudioStates((prev) => ({
            ...prev,
            [adviceId]: { ...prev[adviceId], isPlaying: true },
          }));
          setActiveAudioId(adviceId);
          return;
        }
      }

      for (const [id, audioState] of Object.entries(audioStatesRef.current)) {
        if (id !== adviceId && audioState.sound) {
          await audioState.sound.unloadAsync();
        }
      }
      setAudioStates((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (id !== adviceId) delete next[id];
        });
        return next;
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay: true,
          isLooping: false,
          volume: audioVolume,
          rate: audioRate,
          shouldCorrectPitch: true,
        }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setAudioStates((prev) => ({
            ...prev,
            [adviceId]: {
              ...prev[adviceId],
              sound,
              isPlaying: status.isPlaying || false,
              position: status.positionMillis || 0,
              duration: status.durationMillis || 0,
            },
          }));
        }
      });

      setAudioStates((prev) => ({
        ...prev,
        [adviceId]: {
          isPlaying: true,
          position: 0,
          duration: 0,
          sound,
        },
      }));
      setActiveAudioId(adviceId);
    } catch (error) {
      console.error('Error playing audio:', error);
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

  const seekAudio = async (adviceId: string, ratio: number) => {
    try {
      const sound = audioStates[adviceId]?.sound;
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (!status.isLoaded || !status.durationMillis) return;
      await sound.setPositionAsync(status.durationMillis * Math.max(0, Math.min(1, ratio)));
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const cyclePlaybackRate = async (adviceId: string) => {
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(audioRate) + 1) % PLAYBACK_RATES.length];
    setAudioRate(next);
    try {
      const sound = audioStates[adviceId]?.sound;
      if (sound) {
        await sound.setRateAsync(next, true);
      }
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  const skipAudio = async (adviceId: string, deltaMs: number) => {
    try {
      const sound = audioStates[adviceId]?.sound;
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      const duration = status.durationMillis || 0;
      const next = Math.max(0, Math.min(duration, (status.positionMillis || 0) + deltaMs));
      await sound.setPositionAsync(next);
    } catch (error) {
      console.error('Error skipping audio:', error);
    }
  };

  const changeVolume = async (adviceId: string, delta: number) => {
    const next = Math.round(Math.max(0, Math.min(1, audioVolume + delta)) * 100) / 100;
    setAudioVolume(next);
    try {
      const sound = audioStates[adviceId]?.sound;
      if (sound) {
        await sound.setVolumeAsync(next);
      }
    } catch (error) {
      console.error('Error changing volume:', error);
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
    const isLocked = isContentLocked(advice, hasActiveSubscription);
    
    const handleAdvicePress = () => {
      if (isLocked && !user) {
        showSignInAlert('advices');
      } else if (isLocked) {
        showPremiumGateAlert(subscriptionAccess, router, 'advices');
      } else {
        // Handle advice opening logic here
        console.log('Opening advice:', advice.title);
      }
    };
    
    return (
    <View
      key={`advice-${advice.id}`}
      style={[styles.adviceCard, isLocked && styles.lockedCard]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleAdvicePress}
        disabled={!isLocked}
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
      </TouchableOpacity>

       {advice.isRecorded && advice.audioUrl ? (
         <View style={styles.audioPlayerSection}>
           <Pressable
             style={styles.seekTrack}
             onLayout={(e) => {
               seekTrackWidth.current = e.nativeEvent.layout.width;
             }}
             onPress={(e) => {
               seekAudio(
                 advice.id,
                 e.nativeEvent.locationX / Math.max(1, seekTrackWidth.current)
               );
             }}
           >
             <View style={styles.seekTrackLine}>
               <View
                 style={[
                   styles.seekFill,
                   {
                     width:
                       activeAudioId === advice.id && audioStates[advice.id]?.duration > 0
                         ? `${(audioStates[advice.id].position / audioStates[advice.id].duration) * 100}%`
                         : '0%',
                   },
                 ]}
               />
               <View
                 style={[
                   styles.seekThumb,
                   {
                     left:
                       activeAudioId === advice.id && audioStates[advice.id]?.duration > 0
                         ? `${(audioStates[advice.id].position / audioStates[advice.id].duration) * 100}%`
                         : '0%',
                   },
                 ]}
               />
             </View>
           </Pressable>
           <View style={styles.audioTime}>
             <Text style={styles.audioTimeText}>
               {activeAudioId === advice.id && audioStates[advice.id]
                 ? formatClock(audioStates[advice.id].position)
                 : '0:00'}
             </Text>
             <Text style={styles.audioTimeText}>
               {activeAudioId === advice.id && audioStates[advice.id]?.duration > 0
                 ? `-${formatClock(audioStates[advice.id].duration - audioStates[advice.id].position)}`
                 : advice.duration}
             </Text>
           </View>

           <View style={styles.audioTransport}>
             <TouchableOpacity
               style={styles.audioSideHit}
               onPress={() => cyclePlaybackRate(advice.id)}
               hitSlop={8}
             >
               <Text style={styles.audioRateText}>{audioRate === 1 ? '1x' : `${audioRate}x`}</Text>
             </TouchableOpacity>

             <TouchableOpacity
               style={styles.audioSideHit}
               onPress={() => skipAudio(advice.id, -10000)}
               hitSlop={8}
             >
               <MaterialIcons name="replay-10" size={34} color="#FFFFFF" />
             </TouchableOpacity>

             <Pressable
               style={styles.audioPlayButton}
               onPress={() => {
                 if (activeAudioId === advice.id && audioStates[advice.id]?.isPlaying) {
                   pauseAudio(advice.id);
                 } else {
                   playAudio(advice.audioUrl!, advice.id);
                 }
               }}
             >
               <View pointerEvents="none">
                 <Ionicons
                   name={activeAudioId === advice.id && audioStates[advice.id]?.isPlaying ? 'pause' : 'play'}
                   size={22}
                   color="#FFFFFF"
                   style={activeAudioId === advice.id && audioStates[advice.id]?.isPlaying ? undefined : { marginLeft: 2 }}
                 />
               </View>
             </Pressable>

             <TouchableOpacity
               style={styles.audioSideHit}
               onPress={() => skipAudio(advice.id, 10000)}
               hitSlop={8}
             >
               <MaterialIcons name="forward-10" size={34} color="#FFFFFF" />
             </TouchableOpacity>

             <TouchableOpacity
               style={styles.audioSideHit}
               onPress={() => changeVolume(advice.id, audioVolume > 0 ? -1 : 1)}
               hitSlop={8}
             >
               <Ionicons
                 name={audioVolume === 0 ? 'volume-mute' : 'volume-medium'}
                 size={22}
                 color="#FFFFFF"
               />
             </TouchableOpacity>
           </View>
         </View>
       ) : null}
      
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
    </View>
  );

}

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <FixedBackBar returnToLastTab />
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
    backgroundColor: '#000000',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#111111',
  },
  audioPlayButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekTrack: {
    height: 22,
    justifyContent: 'center',
  },
  seekTrackLine: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    justifyContent: 'center',
  },
  seekFill: {
    height: 4,
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  seekThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E50914',
    marginLeft: -6,
    top: -4,
  },
  audioTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  audioTimeText: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  audioTransport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  audioSideHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioRateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  adviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
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