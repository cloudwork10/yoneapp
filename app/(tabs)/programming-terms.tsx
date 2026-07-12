import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../../config/api';

interface Term {
  id: string;
  term: string;
  definition: string;
  category: string;
  audioUrl: string;
  duration: string;
}

interface Language {
  id: string;
  name: string;
  icon: string;
  color: string;
  terms: Term[];
}

export default function ProgrammingTermsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<{[key: string]: {
    isPlaying: boolean;
    position: number;
    duration: number;
    sound: Audio.Sound | null;
    intervalId?: number;
  }}>({});
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbTerms, setDbTerms] = useState<any[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true); // Enable audio with local sounds

  // Fetch programming terms from database
  const fetchTerms = async () => {
    try {
      setLoading(true);
      console.log('⚡ Fetching programming terms from database...');
      
      const response = await fetch(`${API_BASE_URL}/api/public/programming-terms`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('⚡ Terms fetched:', data.data.count, 'terms');
        const terms = data.data.terms || [];
        console.log('⚡ Raw terms data:', terms.map((t: any) => ({ id: t._id, term: t.term, audioUrl: t.audioUrl })));
        setDbTerms(terms);
        
        // Process terms and group by language
        const processedLanguages = processTermsIntoLanguages(terms);
        console.log('⚡ Processed languages:', processedLanguages.map(l => ({ id: l.id, name: l.name, termsCount: l.terms.length })));
        setLanguages(processedLanguages);
      } else {
        console.error('❌ Failed to fetch terms:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process database terms into language groups
  const processTermsIntoLanguages = (terms: any[]): Language[] => {
    const languageColors: {[key: string]: {icon: string, color: string}} = {
      'JavaScript': { icon: '🟨', color: '#F7DF1E' },
      'Python': { icon: '🐍', color: '#3776AB' },
      'Java': { icon: '☕', color: '#ED8B00' },
      'C++': { icon: '⚡', color: '#00599C' },
      'C#': { icon: '🔷', color: '#239120' },
      'PHP': { icon: '🐘', color: '#777BB4' },
      'Ruby': { icon: '💎', color: '#CC342D' },
      'Go': { icon: '🐹', color: '#00ADD8' }
    };

    const groupedTerms: {[key: string]: any[]} = {};
    
    // Group terms by language
    terms.forEach(term => {
      const language = term.language;
      if (!groupedTerms[language]) {
        groupedTerms[language] = [];
      }
      
      // Convert database term to UI term format
      groupedTerms[language].push({
        id: term._id,
        term: term.term,
        definition: term.definition,
        category: term.category,
        audioUrl: term.audioUrl || '',
        duration: term.duration || '0:00'
      });
    });

    // Convert to Language array
    return Object.keys(groupedTerms).map(languageName => ({
      id: languageName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: languageName,
      icon: languageColors[languageName]?.icon || '📝',
      color: languageColors[languageName]?.color || '#666666',
      terms: groupedTerms[languageName]
    }));
  };

  // Load terms on component mount
  useEffect(() => {
    fetchTerms();
  }, []);

  // Refresh terms when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('⚡ Terms screen focused, refreshing data...');
      console.log('⚡ Current languages state:', languages.length);
      console.log('⚡ Current dbTerms state:', dbTerms.length);
      fetchTerms();
      
      // Force refresh after a short delay to ensure data is updated
      setTimeout(() => {
        console.log('⚡ Force refresh after delay...');
        fetchTerms();
      }, 1000);
    }, [])
  );

  // Static fallback languages for empty state
  const staticLanguages: Language[] = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '🟨',
      color: '#F7DF1E',
      terms: [
        {
          id: 'js-var',
          term: 'Variable',
          definition: 'A container that stores data values. In JavaScript, you can declare variables using var, let, or const.',
          category: 'Basics',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        },
        {
          id: 'js-function',
          term: 'Function',
          definition: 'A reusable block of code that performs a specific task. Functions can take parameters and return values.',
          category: 'Functions',
          audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
          duration: '3:15'
        },
        {
          id: 'js-array',
          term: 'Array',
          definition: 'A data structure that stores multiple values in a single variable. Arrays are indexed starting from 0.',
          category: 'Data Structures',
          audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther60.wav',
          duration: '2:45'
        },
        {
          id: 'js-object',
          term: 'Object',
          definition: 'A collection of key-value pairs. Objects are used to represent real-world entities and their properties.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '3:20'
        },
        {
          id: 'js-async',
          term: 'Async/Await',
          definition: 'Modern JavaScript syntax for handling asynchronous operations in a more readable way than callbacks.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '4:10'
        },
        {
          id: 'js-promise',
          term: 'Promise',
          definition: 'An object representing the eventual completion or failure of an asynchronous operation.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '3:55'
        }
      ]
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      color: '#3776AB',
      terms: [
        {
          id: 'py-variable',
          term: 'Variable',
          definition: 'A name that refers to a value. In Python, variables are created when you assign a value to them.',
          category: 'Basics',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:15'
        },
        {
          id: 'py-function',
          term: 'Function',
          definition: 'A block of organized, reusable code that performs a single action. Defined using the def keyword.',
          category: 'Functions',
          audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
          duration: '3:40'
        },
        {
          id: 'py-list',
          term: 'List',
          definition: 'A collection of items in a particular order. Lists are mutable and can contain different data types.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:50'
        },
        {
          id: 'py-dict',
          term: 'Dictionary',
          definition: 'A collection of key-value pairs. Dictionaries are unordered, changeable, and indexed by keys.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '3:25'
        },
        {
          id: 'py-class',
          term: 'Class',
          definition: 'A blueprint for creating objects. Classes define attributes and methods that objects will have.',
          category: 'OOP',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '4:30'
        },
        {
          id: 'py-module',
          term: 'Module',
          definition: 'A file containing Python definitions and statements. Modules help organize code into reusable components.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '3:10'
        }
      ]
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      color: '#ED8B00',
      terms: [
        {
          id: 'java-class',
          term: 'Class',
          definition: 'A blueprint for creating objects. In Java, everything is defined within a class.',
          category: 'OOP',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        },
        {
          id: 'java-method',
          term: 'Method',
          definition: 'A block of code that performs a specific task. Methods are defined within classes.',
          category: 'Functions',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        },
        {
          id: 'java-array',
          term: 'Array',
          definition: 'A container object that holds a fixed number of values of a single type.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        },
        {
          id: 'java-interface',
          term: 'Interface',
          definition: 'A reference type that contains only constants, method signatures, and nested types.',
          category: 'OOP',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        }
      ]
    },
    {
      id: 'cpp',
      name: 'C++',
      icon: '⚡',
      color: '#00599C',
      terms: [
        {
          id: 'cpp-pointer',
          term: 'Pointer',
          definition: 'A variable that stores the memory address of another variable. Pointers are fundamental in C++.',
          category: 'Memory Management',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        },
        {
          id: 'cpp-class',
          term: 'Class',
          definition: 'A user-defined data type that encapsulates data and functions that operate on that data.',
          category: 'OOP',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        },
        {
          id: 'cpp-template',
          term: 'Template',
          definition: 'A feature that allows functions and classes to operate with generic types.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          duration: '2:30'
        }
      ]
    }
  ];

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

  const stopAllAudios = async () => {
    try {
      for (const [termId, audioState] of Object.entries(audioStates)) {
        if (audioState.sound) {
          await audioState.sound.unloadAsync();
        }
        if (audioState.intervalId) {
          clearInterval(audioState.intervalId);
        }
      }
      setAudioStates({});
      setActiveAudioId(null);
    } catch (error) {
      console.error('Error stopping all audios:', error);
    }
  };

  const playAudio = async (audioUrl: string, termId: string) => {
    if (!audioEnabled) {
      console.log('🔇 Audio is disabled');
      return;
    }
    
    try {
      // Stop all other audios first
      await stopAllAudios();

      console.log('🔊 Playing audio for term:', termId);
      console.log('🔊 Audio URL:', audioUrl);
      
      // Try to use real audio first, fallback to mock if it fails
      if (audioUrl && audioUrl.trim() !== '') {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true }
          );
          
          // Get duration from the loaded sound
          const status = await sound.getStatusAsync();
          const duration = (status as any).durationMillis || 0;
          
          console.log('🔊 Real audio loaded, duration:', duration);
          
          // Update UI to show playing state
          setAudioStates(prev => ({
            ...prev,
            [termId]: {
              isPlaying: true,
              position: 0,
              duration: duration,
              sound: sound
            }
          }));
          setActiveAudioId(termId);

          // Set up progress tracking
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
              setAudioStates(prev => ({
                ...prev,
                [termId]: {
                  ...prev[termId],
                  position: status.positionMillis || 0,
                  isPlaying: status.isPlaying || false
                }
              }));
              
              if (status.didJustFinish) {
                console.log('🔊 Audio finished for term:', termId);
                setAudioStates(prev => ({
                  ...prev,
                  [termId]: {
                    ...prev[termId],
                    isPlaying: false
                  }
                }));
                setActiveAudioId(null);
              }
            }
          });
          
          return; // Exit early if real audio loaded successfully
          
        } catch (audioError) {
          console.error('❌ Error loading real audio:', audioError);
          console.log('🔄 Falling back to mock audio...');
        }
      }
      
      // Fallback to mock audio if real audio fails or no URL provided
      console.log('⚠️ Using mock audio system');
      const mockDuration = 3000; // 3 seconds
      
      // Update UI to show playing state
      setAudioStates(prev => ({
        ...prev,
        [termId]: {
          isPlaying: true,
          position: 0,
          duration: mockDuration,
          sound: null
        }
      }));
      setActiveAudioId(termId);

      // Simulate progress updates
      let currentPosition = 0;
      const progressInterval = setInterval(() => {
        currentPosition += 100;
        setAudioStates(prev => ({
          ...prev,
          [termId]: {
            ...prev[termId],
            position: currentPosition
          }
        }));
        
        if (currentPosition >= mockDuration) {
          clearInterval(progressInterval);
          setAudioStates(prev => ({
            ...prev,
            [termId]: {
              ...prev[termId],
              isPlaying: false,
              intervalId: undefined
            }
          }));
          setActiveAudioId(null);
          console.log('🔊 Audio finished for term:', termId);
        }
      }, 100);

      // Store interval ID for cleanup
      setAudioStates(prev => ({
        ...prev,
        [termId]: {
          ...prev[termId],
          intervalId: progressInterval
        }
      }));

    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioStates(prev => ({
        ...prev,
        [termId]: {
          ...prev[termId],
          isPlaying: false
        }
      }));
      setActiveAudioId(null);
    }
  };

  const pauseAudio = async (termId: string) => {
    try {
      console.log('⏸️ Pausing audio for term:', termId);
      
      const audioState = audioStates[termId];
      if (audioState?.sound) {
        // Pause real audio
        await audioState.sound.pauseAsync();
      } else if (audioState?.intervalId) {
        // Clear mock audio interval
        clearInterval(audioState.intervalId);
      }
      
      setAudioStates(prev => ({
        ...prev,
        [termId]: {
          ...prev[termId],
          isPlaying: false
        }
      }));
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const resumeAudio = async (termId: string) => {
    try {
      console.log('▶️ Resuming audio for term:', termId);
      
      const audioState = audioStates[termId];
      if (audioState?.sound) {
        // Resume real audio
        await audioState.sound.playAsync();
      } else if (audioState?.intervalId) {
        // Resume mock audio (restart interval)
        const remainingTime = audioState.duration - audioState.position;
        if (remainingTime > 0) {
          const progressInterval = setInterval(() => {
            setAudioStates(prev => {
              const current = prev[termId];
              if (current) {
                const newPosition = current.position + 100;
                if (newPosition >= current.duration) {
                  clearInterval(progressInterval);
                  return {
                    ...prev,
                    [termId]: {
                      ...current,
                      isPlaying: false,
                      intervalId: undefined
                    }
                  };
                }
                return {
                  ...prev,
                  [termId]: {
                    ...current,
                    position: newPosition
                  }
                };
              }
              return prev;
            });
          }, 100);
          
          setAudioStates(prev => ({
            ...prev,
            [termId]: {
              ...prev[termId],
              intervalId: progressInterval
            }
          }));
        }
      }
      
      setAudioStates(prev => ({
        ...prev,
        [termId]: {
          ...prev[termId],
          isPlaying: true
        }
      }));
      setActiveAudioId(termId);
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  };

  const stopAudio = async (termId: string) => {
    try {
      console.log('⏹️ Stopping audio for term:', termId);
      
      const audioState = audioStates[termId];
      if (audioState?.sound) {
        // Stop and unload real audio
        await audioState.sound.stopAsync();
        await audioState.sound.unloadAsync();
      } else if (audioState?.intervalId) {
        // Clear mock audio interval
        clearInterval(audioState.intervalId);
      }
      
      setAudioStates(prev => {
        const newState = { ...prev };
        delete newState[termId];
        return newState;
      });
      if (activeAudioId === termId) {
        setActiveAudioId(null);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.id === selectedLanguage);
  };

  const getFilteredTerms = () => {
    if (!selectedLanguage) return [];
    
    const currentLang = getCurrentLanguage();
    if (!currentLang) return [];
    
    console.log('⚡ Current language terms:', currentLang.terms.length);
    console.log('⚡ Terms data:', currentLang.terms.map(t => ({ id: t.id, term: t.term, audioUrl: t.audioUrl })));
    
    if (!searchQuery) return currentLang.terms;
    
    return currentLang.terms.filter(term => 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getTermsByCategory = () => {
    const terms = getFilteredTerms();
    const categories: {[key: string]: Term[]} = {};
    
    terms.forEach(term => {
      if (!categories[term.category]) {
        categories[term.category] = [];
      }
      categories[term.category].push(term);
    });
    
    return categories;
  };

  const renderTermCard = (term: Term) => (
    <View key={`term-${term.id}`} style={styles.termCard}>
      <View style={styles.termHeader}>
        <View style={styles.termTitleContainer}>
          <Text style={styles.termName}>{term.term}</Text>
          <Text style={styles.termCategory}>{term.category}</Text>
        </View>
      </View>
      
      <Text style={styles.termDefinition}>{term.definition}</Text>
      
       {/* Audio Player Section */}
       <View style={styles.audioPlayerSection}>
         <View style={[styles.audioPlayer, !audioEnabled && styles.audioPlayerDisabled]}>
           <TouchableOpacity 
             style={[styles.audioPlayButton, !audioEnabled && styles.audioPlayButtonDisabled]}
             onPress={() => {
               if (activeAudioId === term.id) {
                 if (audioStates[term.id]?.isPlaying) {
                   pauseAudio(term.id);
                 } else {
                   resumeAudio(term.id);
                 }
               } else {
                 playAudio(term.audioUrl, term.id);
               }
             }}
           >
             <Text style={styles.audioPlayIcon}>
               {!audioEnabled ? '🔇' : (activeAudioId === term.id && audioStates[term.id]?.isPlaying ? '⏸️' : '▶️')}
             </Text>
           </TouchableOpacity>
          
          <View style={styles.audioInfo}>
            <View style={styles.audioProgressBar}>
              <View 
                style={[
                  styles.audioProgress, 
                  { 
                    width: activeAudioId === term.id && audioStates[term.id]?.duration > 0 
                      ? `${(audioStates[term.id].position / audioStates[term.id].duration) * 100}%` 
                      : '0%' 
                  }
                ]} 
              />
            </View>
            <View style={styles.audioTime}>
              <Text style={styles.audioTimeText}>
                {activeAudioId === term.id && audioStates[term.id]?.position
                  ? `${Math.floor(audioStates[term.id].position / 1000 / 60)}:${Math.floor((audioStates[term.id].position / 1000) % 60).toString().padStart(2, '0')}`
                  : '0:00'
                }
              </Text>
              <Text style={styles.audioTimeText}>
                {activeAudioId === term.id && audioStates[term.id]?.duration > 0
                  ? `${Math.floor(audioStates[term.id].duration / 1000 / 60)}:${Math.floor((audioStates[term.id].duration / 1000) % 60).toString().padStart(2, '0')}`
                  : term.duration || '2:30'
                }
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.audioStopButton}
            onPress={() => {
              if (activeAudioId === term.id) {
                stopAudio(term.id);
              }
            }}
          >
            <Text style={styles.audioStopIcon}>⏹️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Programming Terms</Text>
            <Text style={styles.subtitle}>Learn the language of coding</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>⚡ Loading Programming Terms...</Text>
              <Text style={styles.loadingSubtext}>Fetching terms from database</Text>
            </View>
          ) : !selectedLanguage ? (
            <View style={styles.languagesContainer}>
              <Text style={styles.sectionTitle}>Choose a Programming Language</Text>
              {languages.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>📝 No programming terms found</Text>
                  <Text style={styles.emptyStateSubtext}>Add some terms from the dashboard to see them here</Text>
                </View>
              ) : (
                <View style={styles.languagesGrid}>
                  {languages.map((language) => (
                  <TouchableOpacity
                    key={`language-${language.id}`}
                    style={[styles.languageCard, { borderColor: language.color }]}
                    onPress={() => setSelectedLanguage(language.id)}
                  >
                    <Text style={styles.languageIcon}>{language.icon}</Text>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.termCount}>{language.terms.length} terms</Text>
                  </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={styles.backContainer}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setSelectedLanguage(null)}
                >
                  <Text style={styles.backIcon}>←</Text>
                  <Text style={styles.backText}>Back to Languages</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.languageHeader}>
                <Text style={styles.languageIcon}>{getCurrentLanguage()?.icon}</Text>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageTitle}>{getCurrentLanguage()?.name}</Text>
                  <Text style={styles.languageSubtitle}>Programming Terms</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.audioToggleButton, audioEnabled && styles.audioToggleButtonActive]}
                  onPress={() => setAudioEnabled(!audioEnabled)}
                >
                  <Text style={styles.audioToggleIcon}>
                    {audioEnabled ? '🔊' : '🔇'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!audioEnabled && (
                <View style={styles.audioDisabledNotice}>
                  <Text style={styles.audioDisabledText}>
                    🔊 Audio is disabled. Tap the 🔊 button above to enable audio playback.
                  </Text>
                </View>
              )}

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search terms..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.termsContainer}>
                {(() => {
                  const termsByCategory = getTermsByCategory();
                  console.log('⚡ Rendering terms by category:', Object.keys(termsByCategory));
                  console.log('⚡ Total terms to render:', Object.values(termsByCategory).flat().length);
                  
                  return Object.entries(termsByCategory).map(([category, terms]) => (
                    <View key={category} style={styles.categorySection}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      {terms.map(renderTermCard)}
                    </View>
                  ));
                })()}
              </View>
            </>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  
  // Languages Selection
  languagesContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  languagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  languageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  termCount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  
  // Back Button
  backContainer: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  backIcon: {
    fontSize: 18,
    color: '#E50914',
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  
  // Language Header
   languageHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: 'rgba(255, 255, 255, 0.1)',
     borderRadius: 16,
     padding: 20,
     marginBottom: 25,
   },
   languageInfo: {
     flex: 1,
   },
   languageTitle: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#FFFFFF',
     marginBottom: 5,
   },
   languageSubtitle: {
     fontSize: 16,
     color: '#CCCCCC',
   },
   audioToggleButton: {
     backgroundColor: 'rgba(255, 255, 255, 0.1)',
     borderRadius: 25,
     width: 50,
     height: 50,
     justifyContent: 'center',
     alignItems: 'center',
     borderWidth: 2,
     borderColor: 'rgba(255, 255, 255, 0.2)',
   },
   audioToggleButtonActive: {
     backgroundColor: 'rgba(229, 9, 20, 0.2)',
     borderColor: 'rgba(229, 9, 20, 0.5)',
   },
  audioToggleIcon: {
    fontSize: 20,
  },
  audioDisabledNotice: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  audioDisabledText: {
    color: '#FFC107',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Search
  searchContainer: {
    marginBottom: 25,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Terms
  termsContainer: {
    gap: 20,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  termCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  termTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  termName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  termCategory: {
    fontSize: 12,
    color: '#CCCCCC',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  termDefinition: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 20,
  },
  
  // Audio Player Section
  audioPlayerSection: {
    marginTop: 15,
  },
  audioPlayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  audioPlayerDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.6,
  },
  audioPlayButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  audioPlayButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  audioPlayIcon: {
    fontSize: 24,
  },
  audioInfo: {
    flex: 1,
    gap: 10,
  },
  audioProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
  },
  audioProgress: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  audioTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioTimeText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  audioStopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  audioStopIcon: {
    fontSize: 16,
  },
  // Loading States
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
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
});
