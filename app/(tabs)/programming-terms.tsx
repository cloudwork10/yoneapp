import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Term {
  id: string;
  term: string;
  definition: string;
  category: string;
  audioUrl: string;
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
  }}>({});

  const languages: Language[] = [
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
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'js-function',
          term: 'Function',
          definition: 'A reusable block of code that performs a specific task. Functions can take parameters and return values.',
          category: 'Functions',
          audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav'
        },
        {
          id: 'js-array',
          term: 'Array',
          definition: 'A data structure that stores multiple values in a single variable. Arrays are indexed starting from 0.',
          category: 'Data Structures',
          audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther60.wav'
        },
        {
          id: 'js-object',
          term: 'Object',
          definition: 'A collection of key-value pairs. Objects are used to represent real-world entities and their properties.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'js-async',
          term: 'Async/Await',
          definition: 'Modern JavaScript syntax for handling asynchronous operations in a more readable way than callbacks.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'js-promise',
          term: 'Promise',
          definition: 'An object representing the eventual completion or failure of an asynchronous operation.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
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
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'py-function',
          term: 'Function',
          definition: 'A block of organized, reusable code that performs a single action. Defined using the def keyword.',
          category: 'Functions',
          audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav'
        },
        {
          id: 'py-list',
          term: 'List',
          definition: 'A collection of items in a particular order. Lists are mutable and can contain different data types.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'py-dict',
          term: 'Dictionary',
          definition: 'A collection of key-value pairs. Dictionaries are unordered, changeable, and indexed by keys.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'py-class',
          term: 'Class',
          definition: 'A blueprint for creating objects. Classes define attributes and methods that objects will have.',
          category: 'OOP',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'py-module',
          term: 'Module',
          definition: 'A file containing Python definitions and statements. Modules help organize code into reusable components.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
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
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'java-method',
          term: 'Method',
          definition: 'A block of code that performs a specific task. Methods are defined within classes.',
          category: 'Functions',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'java-array',
          term: 'Array',
          definition: 'A container object that holds a fixed number of values of a single type.',
          category: 'Data Structures',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'java-interface',
          term: 'Interface',
          definition: 'A reference type that contains only constants, method signatures, and nested types.',
          category: 'OOP',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
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
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'cpp-class',
          term: 'Class',
          definition: 'A user-defined data type that encapsulates data and functions that operate on that data.',
          category: 'OOP',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
        },
        {
          id: 'cpp-template',
          term: 'Template',
          definition: 'A feature that allows functions and classes to operate with generic types.',
          category: 'Advanced',
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
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
      }
      setAudioStates({});
      setActiveAudioId(null);
    } catch (error) {
      console.error('Error stopping all audios:', error);
    }
  };

  const playAudio = async (audioUrl: string, termId: string) => {
    try {
      // Stop all other audios first
      await stopAllAudios();

      // Check if this audio is already loaded
      if (audioStates[termId]?.sound) {
        // Resume existing audio
        await audioStates[termId].sound!.playAsync();
        setAudioStates(prev => ({
          ...prev,
          [termId]: {
            ...prev[termId],
            isPlaying: true
          }
        }));
        setActiveAudioId(termId);
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
            [termId]: {
              ...prev[termId],
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
        [termId]: {
          isPlaying: true,
          position: 0,
          duration: 0,
          sound: sound
        }
      }));
      setActiveAudioId(termId);

    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const pauseAudio = async (termId: string) => {
    try {
      if (audioStates[termId]?.sound) {
        await audioStates[termId].sound!.pauseAsync();
        setAudioStates(prev => ({
          ...prev,
          [termId]: {
            ...prev[termId],
            isPlaying: false
          }
        }));
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const stopAudio = async (termId: string) => {
    try {
      if (audioStates[termId]?.sound) {
        await audioStates[termId].sound!.unloadAsync();
        setAudioStates(prev => {
          const newState = { ...prev };
          delete newState[termId];
          return newState;
        });
        if (activeAudioId === termId) {
          setActiveAudioId(null);
        }
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
    <View key={term.id} style={styles.termCard}>
      <View style={styles.termHeader}>
        <View style={styles.termTitleContainer}>
          <Text style={styles.termName}>{term.term}</Text>
          <Text style={styles.termCategory}>{term.category}</Text>
        </View>
      </View>
      
      <Text style={styles.termDefinition}>{term.definition}</Text>
      
      {/* Audio Player Section */}
      <View style={styles.audioPlayerSection}>
        <View style={styles.audioPlayer}>
          <TouchableOpacity 
            style={styles.audioPlayButton}
            onPress={() => {
              if (activeAudioId === term.id) {
                if (audioStates[term.id]?.isPlaying) {
                  pauseAudio(term.id);
                } else {
                  playAudio(term.audioUrl, term.id);
                }
              } else {
                playAudio(term.audioUrl, term.id);
              }
            }}
          >
            <Text style={styles.audioPlayIcon}>
              {activeAudioId === term.id && audioStates[term.id]?.isPlaying ? '⏸️' : '▶️'}
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
                  : '0:00'
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

          {!selectedLanguage ? (
            <View style={styles.languagesContainer}>
              <Text style={styles.sectionTitle}>Choose a Programming Language</Text>
              <View style={styles.languagesGrid}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.id}
                    style={[styles.languageCard, { borderColor: language.color }]}
                    onPress={() => setSelectedLanguage(language.id)}
                  >
                    <Text style={styles.languageIcon}>{language.icon}</Text>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.termCount}>{language.terms.length} terms</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                <View>
                  <Text style={styles.languageTitle}>{getCurrentLanguage()?.name}</Text>
                  <Text style={styles.languageSubtitle}>Programming Terms</Text>
                </View>
              </View>

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
                {Object.entries(getTermsByCategory()).map(([category, terms]) => (
                  <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    {terms.map(renderTermCard)}
                  </View>
                ))}
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
});
