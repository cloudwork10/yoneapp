import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<{[key: string]: {
    isPlaying: boolean;
    position: number;
    duration: number;
    sound: Audio.Sound | null;
  }}>({});

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

  const categories = [
    { id: 'all', name: 'All', icon: '🌟', color: '#E50914' },
    { id: 'career-shift', name: 'Career Shift', icon: '🚀', color: '#FF6B35' },
    { id: 'kids', name: 'Kids & Family', icon: '👶', color: '#4ECDC4' },
    { id: 'motivation', name: 'Motivation', icon: '💪', color: '#45B7D1' },
    { id: 'success', name: 'Success Tips', icon: '🏆', color: '#96CEB4' },
  ];

  const [advices, setAdvices] = useState<Advice[]>([
    {
      id: '1',
      title: 'How to Successfully Change Your Career at 30',
      category: 'career-shift',
      content: 'Changing careers at 30 can be daunting but incredibly rewarding. Here are proven strategies to make a smooth transition...',
      author: 'Sarah Johnson',
      likes: 1247,
      isLiked: false,
      duration: '8 min read',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isRecorded: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: '2',
      title: 'Balancing Work and Kids: A Parent\'s Guide',
      category: 'kids',
      content: 'Being a working parent is challenging. Learn how to create harmony between your career and family life...',
      author: 'Michael Chen',
      likes: 892,
      isLiked: true,
      duration: '6 min read',
      thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isRecorded: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: '3',
      title: 'From Corporate to Entrepreneurship: My Journey',
      category: 'career-shift',
      content: 'Leaving a stable corporate job to start your own business requires courage and planning. Here\'s how I did it...',
      author: 'Emma Rodriguez',
      likes: 2156,
      isLiked: false,
      duration: '12 min read',
      thumbnail: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isRecorded: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: '4',
      title: 'Teaching Kids About Money and Success',
      category: 'kids',
      content: 'Financial literacy starts young. Discover age-appropriate ways to teach your children about money...',
      author: 'David Park',
      likes: 743,
      isLiked: false,
      duration: '9 min read',
      thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isRecorded: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: '5',
      title: 'Building Confidence for Career Transitions',
      category: 'motivation',
      content: 'Confidence is key when making career changes. Learn techniques to build and maintain self-confidence...',
      author: 'Lisa Thompson',
      likes: 1534,
      isLiked: true,
      duration: '7 min read',
      thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isRecorded: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: '6',
      title: 'Creating Quality Time with Your Children',
      category: 'kids',
      content: 'Quality over quantity. Learn how to make the most of the time you spend with your kids...',
      author: 'Jennifer Lee',
      likes: 1089,
      isLiked: false,
      duration: '5 min read',
      thumbnail: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isRecorded: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: '7',
      title: 'Raising Confident and Independent Kids',
      category: 'kids',
      content: 'Help your children develop confidence and independence from an early age with these proven strategies...',
      author: 'Maria Garcia',
      likes: 1456,
      isLiked: true,
      duration: '10 min read',
      thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isRecorded: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    }
  ]);

  const filteredAdvices = selectedCategory === 'all' 
    ? advices 
    : advices.filter(advice => advice.category === selectedCategory);

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


  const renderAdviceCard = (advice: Advice) => (
    <TouchableOpacity key={advice.id} style={styles.adviceCard}>
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
          </View>
          
           <View style={styles.adviceContent}>
             <Text style={styles.adviceTitle} numberOfLines={2}>
               {advice.title}
             </Text>
             <Text style={styles.adviceAuthor}>By {advice.author}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Advice Hub</Text>
            <Text style={styles.subtitle}>Expert guidance for life transitions</Text>
            
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
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
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

          {/* Advice Cards */}
          <View style={styles.advicesContainer}>
            {filteredAdvices.map(renderAdviceCard)}
          </View>
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
});