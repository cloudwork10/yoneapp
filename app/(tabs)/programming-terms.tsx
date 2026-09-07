import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from '../../components/FixedBackBar';
import API_BASE_URL from '../../config/api';
import {
  DEFAULT_PROGRAMMING_LANGUAGES,
  fetchPublicProgrammingLanguages,
  mergeProgrammingLanguages,
  programmingLanguageMeta,
} from '../../utils/programmingLanguages';

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
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioRate, setAudioRate] = useState(1);
  const seekTrackWidth = useRef(1);
  const audioStatesRef = useRef(audioStates);
  audioStatesRef.current = audioStates;
  const PLAYBACK_RATES = [1, 1.5, 2];

  const formatClock = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
  };

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
        const remoteLanguages = await fetchPublicProgrammingLanguages().catch(() => null);
        const fromTerms = [...new Set(terms.map((item: any) => item.language).filter(Boolean))]
          .map((name) => ({ id: name, name }));
        const defaultNames = new Set(
          DEFAULT_PROGRAMMING_LANGUAGES.map((item) => item.name.toLowerCase())
        );
        const saved = remoteLanguages || [];
        const catalog = mergeProgrammingLanguages(
          saved.filter((item) => {
            const isDefault = defaultNames.has(item.name.toLowerCase());
            if (!isDefault) return true;
            return fromTerms.some((term) => term.name.toLowerCase() === item.name.toLowerCase());
          }),
          fromTerms
        );
        
        // Process terms and group by language
        const processedLanguages = processTermsIntoLanguages(terms, catalog);
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
  const processTermsIntoLanguages = (terms: any[], catalog: { id: string; name: string }[] = []): Language[] => {
    const groupedTerms: {[key: string]: any[]} = {};
    
    // Group terms by language
    terms.forEach(term => {
      const language = term.language;
      if (!language) return;
      const match = Object.keys(groupedTerms).find((key) => key.toLowerCase() === String(language).toLowerCase()) || language;
      if (!groupedTerms[match]) {
        groupedTerms[match] = [];
      }
      
      // Convert database term to UI term format
      groupedTerms[match].push({
        id: term._id,
        term: term.term,
        definition: term.definition,
        category: term.category,
        audioUrl: term.audioUrl || '',
        duration: term.duration || '0:00'
      });
    });

    const names = catalog.map((item) => item.name);

    return names.map((languageName, index) => {
      const groupedKey = Object.keys(groupedTerms).find(
        (key) => key.toLowerCase() === languageName.toLowerCase()
      );
      const meta = programmingLanguageMeta(languageName, index);
      return {
        id: languageName,
        name: languageName,
        icon: meta.icon,
        color: meta.color,
        terms: groupedKey ? groupedTerms[groupedKey] : [],
      };
    });
  };

  // Load terms on component mount
  useEffect(() => {
    fetchTerms();
  }, []);

  // Refresh terms when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTerms();
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
      Object.values(audioStatesRef.current).forEach((audioState) => {
        audioState.sound?.stopAsync().catch(() => {});
        audioState.sound?.unloadAsync().catch(() => {});
      });
    };
  }, []);

  const stopAllAudios = async () => {
    try {
      await Promise.all(
        Object.values(audioStatesRef.current).map(async (audioState) => {
          if (!audioState.sound) return;
          try {
            await audioState.sound.stopAsync();
          } catch {}
          try {
            await audioState.sound.unloadAsync();
          } catch {}
        })
      );
      setAudioStates({});
      setActiveAudioId(null);
    } catch (error) {
      console.error('Error stopping all audios:', error);
    }
  };

  const playAudio = async (audioUrl: string, termId: string) => {
    if (!audioEnabled || !audioUrl) return;

    try {
      const existing = audioStatesRef.current[termId]?.sound;
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
            [termId]: { ...prev[termId], isPlaying: true },
          }));
          setActiveAudioId(termId);
          return;
        }
      }

      for (const [id, audioState] of Object.entries(audioStatesRef.current)) {
        if (id !== termId && audioState.sound) {
          await audioState.sound.unloadAsync();
        }
      }
      setAudioStates((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (id !== termId) delete next[id];
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
            [termId]: {
              ...prev[termId],
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
        [termId]: {
          isPlaying: true,
          position: 0,
          duration: 0,
          sound,
        },
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
        setAudioStates((prev) => ({
          ...prev,
          [termId]: { ...prev[termId], isPlaying: false },
        }));
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const seekAudio = async (termId: string, ratio: number) => {
    try {
      const sound = audioStates[termId]?.sound;
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (!status.isLoaded || !status.durationMillis) return;
      await sound.setPositionAsync(status.durationMillis * Math.max(0, Math.min(1, ratio)));
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const cyclePlaybackRate = async (termId: string) => {
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(audioRate) + 1) % PLAYBACK_RATES.length];
    setAudioRate(next);
    try {
      const sound = audioStates[termId]?.sound;
      if (sound) {
        await sound.setRateAsync(next, true);
      }
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  const skipAudio = async (termId: string, deltaMs: number) => {
    try {
      const sound = audioStates[termId]?.sound;
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

  const changeVolume = async (termId: string, delta: number) => {
    const next = Math.round(Math.max(0, Math.min(1, audioVolume + delta)) * 100) / 100;
    setAudioVolume(next);
    try {
      const sound = audioStates[termId]?.sound;
      if (sound) {
        await sound.setVolumeAsync(next);
      }
    } catch (error) {
      console.error('Error changing volume:', error);
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

      {term.audioUrl ? (
        <View style={styles.audioPlayerSection}>
          <Pressable
            style={styles.seekTrack}
            onLayout={(e) => {
              seekTrackWidth.current = e.nativeEvent.layout.width;
            }}
            onPress={(e) => {
              seekAudio(
                term.id,
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
                      activeAudioId === term.id && audioStates[term.id]?.duration > 0
                        ? `${(audioStates[term.id].position / audioStates[term.id].duration) * 100}%`
                        : '0%',
                  },
                ]}
              />
              <View
                style={[
                  styles.seekThumb,
                  {
                    left:
                      activeAudioId === term.id && audioStates[term.id]?.duration > 0
                        ? `${(audioStates[term.id].position / audioStates[term.id].duration) * 100}%`
                        : '0%',
                  },
                ]}
              />
            </View>
          </Pressable>
          <View style={styles.audioTime}>
            <Text style={styles.audioTimeText}>
              {activeAudioId === term.id && audioStates[term.id]
                ? formatClock(audioStates[term.id].position)
                : '0:00'}
            </Text>
            <Text style={styles.audioTimeText}>
              {activeAudioId === term.id && audioStates[term.id]?.duration > 0
                ? `-${formatClock(audioStates[term.id].duration - audioStates[term.id].position)}`
                : term.duration || '0:00'}
            </Text>
          </View>

          <View style={styles.audioTransport}>
            <TouchableOpacity
              style={styles.audioSideHit}
              onPress={() => cyclePlaybackRate(term.id)}
              hitSlop={8}
            >
              <Text style={styles.audioRateText}>{audioRate === 1 ? '1x' : `${audioRate}x`}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.audioSideHit}
              onPress={() => skipAudio(term.id, -10000)}
              hitSlop={8}
            >
              <MaterialIcons name="replay-10" size={34} color="#FFFFFF" />
            </TouchableOpacity>

            <Pressable
              style={styles.audioPlayButton}
              onPress={() => {
                if (activeAudioId === term.id && audioStates[term.id]?.isPlaying) {
                  pauseAudio(term.id);
                } else {
                  playAudio(term.audioUrl, term.id);
                }
              }}
            >
              <View pointerEvents="none">
                <Ionicons
                  name={activeAudioId === term.id && audioStates[term.id]?.isPlaying ? 'pause' : 'play'}
                  size={22}
                  color="#FFFFFF"
                  style={activeAudioId === term.id && audioStates[term.id]?.isPlaying ? undefined : { marginLeft: 2 }}
                />
              </View>
            </Pressable>

            <TouchableOpacity
              style={styles.audioSideHit}
              onPress={() => skipAudio(term.id, 10000)}
              hitSlop={8}
            >
              <MaterialIcons name="forward-10" size={34} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.audioSideHit}
              onPress={() => changeVolume(term.id, audioVolume > 0 ? -1 : 1)}
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <FixedBackBar returnToLastTab />
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
                  <Text style={styles.emptyStateText}>📝 No languages yet</Text>
                  <Text style={styles.emptyStateSubtext}>Add a language from Content Management to see it here</Text>
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
  
  audioPlayerSection: {
    marginTop: 16,
    paddingTop: 14,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#222222',
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
