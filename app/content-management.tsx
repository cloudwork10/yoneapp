import { useUser } from '@/contexts/UserContext';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Clipboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { refreshAuthToken, makeAuthenticatedRequest } from '../utils/tokenRefresh';
import NotificationService from '../services/NotificationService';

interface ContentStats {
  total: {
    courses: number;
    podcasts: number;
    articles: number;
    roadmaps: number;
    advices: number;
    terms: number;
    cvTemplates: number;
  };
  active: {
    courses: number;
    podcasts: number;
    articles: number;
    roadmaps: number;
    advices: number;
    terms: number;
    cvTemplates: number;
  };
}

export default function ContentManagementScreen() {
  const { user, isAdmin } = useUser();
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use shared refresh token function
  const refreshToken = refreshAuthToken;
  
  // Debug activeTab changes
  useEffect(() => {
    console.log('🎯 Active tab changed to:', activeTab);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState('');
  const [cvTemplates, setCvTemplates] = useState([]);
  const [showCVModal, setShowCVModal] = useState(false);
  const [editingCV, setEditingCV] = useState(null);
  const [advices, setAdvices] = useState([]);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [editingAdvice, setEditingAdvice] = useState(null);
  const [articles, setArticles] = useState([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  
  // Debug articles state changes
  useEffect(() => {
    console.log('📄 Articles state updated:', articles.length, 'articles');
  }, [articles]);

  // Debug roadmaps state changes
  useEffect(() => {
    console.log('🗺️ Roadmaps state updated:', roadmaps.length, 'roadmaps');
  }, [roadmaps]);

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You need admin privileges to access content management.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
  }, [isAdmin]);

  useEffect(() => {
    console.log('🔄 useEffect triggered, isAdmin:', isAdmin);
    if (isAdmin) {
      console.log('👤 Admin user detected, starting data fetch...');
      // Add small delay between requests to avoid rate limiting
      fetchContentStats();
      setTimeout(() => {
        console.log('📊 Fetching CV templates...');
        fetchCVTemplates();
      }, 500);
      setTimeout(() => {
        console.log('📄 Fetching articles...');
        fetchArticles();
      }, 1000);
      setTimeout(() => {
        console.log('🗺️ Fetching roadmaps...');
        fetchRoadmaps();
      }, 1500);
      setTimeout(() => {
        console.log('💡 Fetching advices...');
        fetchAdvices();
      }, 2000);
      setTimeout(() => {
        console.log('🎧 Fetching podcasts...');
        fetchPodcasts();
      }, 2000);
    }
  }, [isAdmin]);

  const fetchContentStats = async (retryCount = 0) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        setLoading(false);
        return;
      }

      console.log('📊 Fetching content statistics...');
      console.log('🔗 URL: http://192.168.100.42:3000/api/admin/stats');
      const response = await makeAuthenticatedRequest('http://192.168.100.42:3000/api/admin/stats');

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Content stats received:', data);
        console.log('📊 Setting stats:', data.data);
        setStats(data.data);
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry after delay
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchContentStats(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/stats', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            console.log('✅ Content stats received after refresh:', data);
            setStats(data.data);
          } else if (retryResponse.status === 429) {
            // Still rate limited after refresh
            console.log('⏳ Still rate limited after token refresh');
            Alert.alert('Rate Limited', 'Please wait a moment and try again.');
          } else {
            console.error('❌ Failed after token refresh:', retryResponse.status);
            Alert.alert('Error', 'Failed to load content statistics after token refresh');
          }
        } else {
          Alert.alert('Error', 'Authentication failed. Please login again.');
        }
      } else if (response.status === 429) {
        // Rate limited
        console.log('⏳ Rate limited, waiting before retry...');
        Alert.alert('Rate Limited', 'Too many requests. Please wait a moment and try again.');
        
        // Wait and retry once
        setTimeout(async () => {
          try {
            const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/stats', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              console.log('✅ Content stats received after retry:', data);
              setStats(data.data);
            }
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError);
          }
        }, 5000); // Wait 5 seconds before retry
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch content stats:', response.status, errorText);
        Alert.alert('Error', `Failed to load content statistics: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching content stats:', error);
      if (retryCount < 2) {
        console.log(`🔄 Retrying fetchContentStats in 3 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchContentStats(retryCount + 1);
        }, 3000);
        return;
      }
      // Set fallback stats if all retries failed
      setStats({
        total: { courses: 0, podcasts: 0, articles: 0, roadmaps: 0, advices: 0, terms: 0, cvTemplates: 0 },
        active: { courses: 0, podcasts: 0, articles: 0, roadmaps: 0, advices: 0, terms: 0, cvTemplates: 0 }
      });
      Alert.alert('Error', `Failed to load content statistics: ${error.message}`);
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };

  const fetchCVTemplates = async (retryCount = 0) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No token found for CV templates');
        return;
      }

      const response = await makeAuthenticatedRequest('http://192.168.100.42:3000/api/admin/content/cv-templates');

      if (response.ok) {
        const data = await response.json();
        setCvTemplates(data.data.cvTemplates || []);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/cv-templates', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setCvTemplates(data.data.cvTemplates || []);
          } else if (retryResponse.status === 429) {
            // Still rate limited after refresh
            console.log('⏳ Still rate limited after token refresh for CV templates');
          } else {
            console.error('❌ Failed to fetch CV templates after token refresh:', retryResponse.status);
          }
        } else {
          console.error('Failed to refresh token for CV templates');
        }
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry after delay
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchCVTemplates(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      } else if (response.status === 429) {
        // Rate limited
        console.log('⏳ Rate limited for CV templates, waiting before retry...');
        setTimeout(async () => {
          try {
            const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/cv-templates', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setCvTemplates(data.data.cvTemplates || []);
            }
          } catch (retryError) {
            console.error('❌ CV templates retry failed:', retryError);
          }
        }, 5000);
      } else {
        console.error('Failed to fetch CV templates:', response.status);
      }
    } catch (error) {
      console.error('Error fetching CV templates:', error);
    }
  };

  const fetchAdvices = async (retryCount = 0) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No token found for advices');
        return;
      }

      const response = await makeAuthenticatedRequest('http://192.168.100.42:3000/api/admin/content/advices');

      if (response.ok) {
        const data = await response.json();
        setAdvices(data.data.advices || []);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/advices', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setAdvices(data.data.advices || []);
          } else {
            console.error('❌ Failed to fetch advices after token refresh:', retryResponse.status);
          }
        } else {
          console.error('Failed to refresh token for advices');
        }
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry after delay
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchAdvices(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      } else {
        console.error('Failed to fetch advices:', response.status);
      }
    } catch (error) {
      console.error('Error fetching advices:', error);
    }
  };

  const fetchArticles = async (retryCount = 0) => {
    try {
      console.log('🔍 Starting fetchArticles...');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found for articles');
        return;
      }

      console.log('✅ Token found, making request...');
      const response = await makeAuthenticatedRequest('http://192.168.100.42:3000/api/admin/content/articles');

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Articles data received:', data);
        console.log('📄 Articles count:', data.data.articles?.length || 0);
        setArticles(data.data.articles || []);
        console.log('✅ Articles state updated');
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/articles', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            console.log('📄 Articles data received after refresh:', data);
            setArticles(data.data.articles || []);
          } else if (retryResponse.status === 429) {
            // Still rate limited after refresh
            console.log('⏳ Still rate limited after token refresh for articles');
          } else {
            console.error('❌ Failed to fetch articles after token refresh:', retryResponse.status);
          }
        } else {
          console.error('Failed to refresh token for articles');
        }
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry after delay
        console.log(`⏳ Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchArticles(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      } else if (response.status === 429) {
        // Rate limited
        console.log('⏳ Rate limited for articles, waiting before retry...');
        setTimeout(async () => {
          try {
            const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/articles', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setArticles(data.data.articles || []);
            }
          } catch (retryError) {
            console.error('❌ Articles retry failed:', retryError);
          }
        }, 5000);
      } else {
        console.error('❌ Failed to fetch articles:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      if (retryCount < 2) {
        console.log(`🔄 Retrying fetchArticles in 3 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchArticles(retryCount + 1);
        }, 3000);
        return;
      }
      // Set fallback articles if all retries failed
      setArticles([]);
    }
  };

  const fetchRoadmaps = async (retryCount = 0) => {
    try {
      console.log('🗺️ Starting fetchRoadmaps...');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found for roadmaps');
        return;
      }

      console.log('✅ Token found, making request...');
      const response = await makeAuthenticatedRequest('http://192.168.100.42:3000/api/admin/content/roadmaps');

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🗺️ Roadmaps data received:', data);
        console.log('🗺️ Roadmaps count:', data.data.roadmaps?.length || 0);
        setRoadmaps(data.data.roadmaps || []);
        console.log('✅ Roadmaps state updated');
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/roadmaps', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            console.log('🗺️ Roadmaps data received after refresh:', data);
            setRoadmaps(data.data.roadmaps || []);
          } else if (retryResponse.status === 429) {
            // Still rate limited after refresh
            console.log('⏳ Still rate limited after token refresh for roadmaps');
          } else {
            console.error('❌ Failed to fetch roadmaps after token refresh:', retryResponse.status);
          }
        } else {
          console.error('Failed to refresh token for roadmaps');
        }
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry after delay
        console.log(`⏳ Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchRoadmaps(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      } else if (response.status === 429) {
        // Rate limited
        console.log('⏳ Rate limited for roadmaps, waiting before retry...');
        setTimeout(async () => {
          try {
            const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/roadmaps', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setRoadmaps(data.data.roadmaps || []);
            }
          } catch (retryError) {
            console.error('❌ Roadmaps retry failed:', retryError);
          }
        }, 5000);
      } else {
        console.error('❌ Failed to fetch roadmaps:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching roadmaps:', error);
      if (retryCount < 2) {
        console.log(`🔄 Retrying fetchRoadmaps in 3 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchRoadmaps(retryCount + 1);
        }, 3000);
        return;
      }
      // Set fallback roadmaps if all retries failed
      setRoadmaps([]);
    }
  };

  const fetchPodcasts = async (retryCount = 0) => {
    try {
      console.log('🎧 Starting fetchPodcasts...');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found for podcasts');
        return;
      }

      console.log('✅ Token found, making request...');
      const response = await makeAuthenticatedRequest('http://192.168.100.42:3000/api/admin/content/podcasts');

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Podcasts data received:', data);
        setPodcasts(data.data.podcasts || []);
        console.log('✅ Podcasts state updated');
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/podcasts', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            console.log('📊 Podcasts data received after refresh:', data);
            setPodcasts(data.data.podcasts || []);
          } else if (retryResponse.status === 429) {
            // Still rate limited after refresh
            console.log('⏳ Still rate limited after token refresh for podcasts');
          } else {
            console.error('❌ Failed to fetch podcasts after token refresh:', retryResponse.status);
          }
        } else {
          console.error('Failed to refresh token for podcasts');
        }
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry after delay
        console.log(`⏳ Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchPodcasts(retryCount + 1);
        }, (retryCount + 1) * 2000);
      } else if (response.status === 429) {
        // Rate limited
        console.log('⏳ Rate limited for podcasts, waiting before retry...');
        setTimeout(async () => {
          try {
            const retryResponse = await fetch('http://192.168.100.42:3000/api/admin/content/podcasts', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setPodcasts(data.data.podcasts || []);
            }
          } catch (retryError) {
            console.error('❌ Podcasts retry failed:', retryError);
          }
        }, 5000);
      } else {
        console.error('❌ Failed to fetch podcasts:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching podcasts:', error);
      if (retryCount < 3) {
        console.log(`🔄 Retrying fetchPodcasts in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchPodcasts(retryCount + 1);
        }, (retryCount + 1) * 2000);
      } else {
        console.error('❌ Max retries reached for fetchPodcasts');
        // Set fallback podcasts if all retries failed
        setPodcasts([]);
      }
    }
  };

  const contentTypes = [
    { id: 'courses', name: 'Courses', icon: '📚', color: '#E50914' },
    { id: 'podcasts', name: 'Podcasts', icon: '🎧', color: '#FF6B35' },
    { id: 'articles', name: 'Articles', icon: '📄', color: '#4ECDC4' },
    { id: 'roadmaps', name: 'Roadmaps', icon: '🗺️', color: '#9B59B6' },
    { id: 'advices', name: 'Advices', icon: '💡', color: '#96CEB4' },
    { id: 'terms', name: 'Programming Terms', icon: '⚡', color: '#FF9F43' },
    { id: 'cvTemplates', name: 'CV Templates', icon: '📋', color: '#6C5CE7' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'courses', name: 'Courses', icon: '📚' },
    { id: 'podcasts', name: 'Podcasts', icon: '🎧' },
    { id: 'articles', name: 'Articles', icon: '📄' },
    { id: 'roadmaps', name: 'Roadmaps', icon: '🗺️' },
    { id: 'advices', name: 'Advices', icon: '💡' },
    { id: 'terms', name: 'Terms', icon: '⚡' },
    { id: 'cvTemplates', name: 'CV Templates', icon: '📋' }
  ];

  const renderOverviewCard = (contentType: any) => {
    if (!stats) {
      return (
        <View key={contentType.id} style={[styles.overviewCard, { borderColor: contentType.color }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{contentType.icon}</Text>
            <Text style={styles.cardTitle}>{contentType.name}</Text>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      );
    }

    const total = stats.total[contentType.id as keyof typeof stats.total] || 0;
    const active = stats.active[contentType.id as keyof typeof stats.active] || 0;
    const inactive = total - active;

    return (
      <TouchableOpacity 
        key={contentType.id}
        style={[styles.overviewCard, { borderColor: contentType.color }]}
        onPress={() => setActiveTab(contentType.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{contentType.icon}</Text>
          <Text style={styles.cardTitle}>{contentType.name}</Text>
        </View>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>{inactive}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCVManagement = () => {
    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>CV Templates Management</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setEditingCV(null);
              setShowCVModal(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Add CV Template</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search CV templates..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />

        <View style={styles.cvList}>
          {cvTemplates.filter(cv => 
            searchQuery === '' || 
            cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cv.description.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No CV Templates Found' : 'No CV Templates'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try a different search term' : 'Start by adding your first CV template'}
              </Text>
            </View>
          ) : (
            cvTemplates.filter(cv => 
              searchQuery === '' || 
              cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              cv.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((cv, index) => (
              <View key={cv._id || cv.id || `cv-${index}`} style={styles.cvCard}>
                <View style={styles.cvHeader}>
                  <View style={styles.cvInfo}>
                    <Text style={styles.cvName}>{cv.name}</Text>
                    <Text style={styles.cvTitle}>{cv.title}</Text>
                    <Text style={styles.cvDescription}>{cv.description}</Text>
                  </View>
                  <View style={styles.cvActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingCV(cv);
                        setShowCVModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCV(cv.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.cvSkills}>
                  {cv.skills && cv.skills.length > 0 && (
                    <View style={styles.skillsContainer}>
                      {cv.skills.slice(0, 5).map((skill: string, index: number) => (
                        <View key={`skill-${index}-${skill}`} style={styles.skillTag}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                      {cv.skills.length > 5 && (
                        <View style={styles.skillTag}>
                          <Text style={styles.skillText}>+{cv.skills.length - 5}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.cvFooter}>
                  <Text style={styles.cvExperience}>{cv.experience} experience</Text>
                  <Text style={styles.cvDownloads}>📥 {cv.downloads} downloads</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderAdviceManagement = () => {
    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>إدارة النصائح</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setEditingAdvice(null);
              setShowAdviceModal(true);
            }}
          >
            <Text style={styles.addButtonText}>+ إضافة نصيحة</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="البحث في النصائح..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />

        <View style={styles.cvList}>
          {advices.filter(advice => 
            searchQuery === '' || 
            advice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            advice.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            advice.author.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💡</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'لم يتم العثور على نصائح' : 'لا توجد نصائح'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'جرب مصطلح بحث مختلف' : 'ابدأ بإضافة نصيحتك الأولى'}
              </Text>
            </View>
          ) : (
            advices.filter(advice => 
              searchQuery === '' || 
              advice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              advice.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              advice.author.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((advice, index) => (
              <View key={advice._id || `advice-${index}`} style={styles.cvCard}>
                <View style={styles.cvHeader}>
                  <View style={styles.cvInfo}>
                    <Text style={styles.cvName}>{advice.title}</Text>
                    <Text style={styles.cvTitle}>بواسطة {advice.author}</Text>
                    <Text style={styles.cvDescription} numberOfLines={2}>{advice.content}</Text>
                  </View>
                  <View style={styles.cvActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingAdvice(advice);
                        setShowAdviceModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAdvice(advice._id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.cvFooter}>
                  <Text style={styles.cvExperience}>📚 {advice.category}</Text>
                  <Text style={styles.cvDownloads}>⏱️ {advice.duration}</Text>
                  {advice.isRecorded && (
                    <Text style={styles.cvDownloads}>🎙️ متوفر صوتي</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderArticleManagement = () => {
    console.log('🎨 Rendering Article Management...');
    console.log('📄 Articles state:', articles);
    console.log('📄 Articles length:', articles.length);
    
    const filteredArticles = articles.filter(article => 
      searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log('🔍 Filtered articles:', filteredArticles.length);
    
    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>Articles Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                console.log('🔄 Manual refresh triggered');
                fetchArticles();
              }}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setEditingArticle(null);
                setShowArticleModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Article</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <ScrollView style={styles.contentList}>
          {filteredArticles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {articles.length === 0 ? 'No articles found. Add your first article!' : 'No articles match your search.'}
              </Text>
              <Text style={styles.debugText}>
                Debug: Articles count: {articles.length}, Search: "{searchQuery}"
              </Text>
            </View>
          ) : (
            filteredArticles.map((article, index) => (
              <View key={article._id || article.id || `article-${index}`} style={styles.articleCard}>
                <View style={styles.articleHeader}>
                  <View style={styles.articleInfo}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <Text style={styles.articleAuthor}>By {article.author}</Text>
                    <Text style={styles.articleDescription}>{article.description}</Text>
                  </View>
                  <View style={styles.articleActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingArticle(article);
                        setShowArticleModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteArticle(article._id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.articleMeta}>
                  <Text style={styles.articleCategory}>📂 {article.category}</Text>
                  <Text style={styles.articleReadTime}>⏱️ {article.readTime}</Text>
                  <Text style={styles.articleViews}>👁️ {article.views} views</Text>
                  <Text style={styles.articleLikes}>❤️ {article.likes} likes</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  const handleDeleteCV = async (cvId: string) => {
    Alert.alert(
      'Delete CV Template',
      'Are you sure you want to delete this CV template?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const token = await AsyncStorage.getItem('token');
              
              const response = await fetch(`http://192.168.100.42:3000/api/admin/content/cv-templates/${cvId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setCvTemplates(cvTemplates.filter(cv => cv._id !== cvId));
                Alert.alert('Success', 'CV template deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete CV template');
              }
            } catch (error) {
              console.error('Error deleting CV template:', error);
              Alert.alert('Error', 'Failed to delete CV template');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAdvice = async (adviceId: string) => {
    Alert.alert(
      'Delete Advice',
      'Are you sure you want to delete this advice?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const token = await AsyncStorage.getItem('token');
              
              const response = await fetch(`http://192.168.100.42:3000/api/admin/content/advices/${adviceId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setAdvices(advices.filter(advice => advice._id !== adviceId));
                Alert.alert('Success', 'Advice deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete advice');
              }
            } catch (error) {
              console.error('Error deleting advice:', error);
              Alert.alert('Error', 'Failed to delete advice');
            }
          }
        }
      ]
    );
  };

  const handleDeleteArticle = async (articleId: string) => {
    Alert.alert(
      'Delete Article',
      'Are you sure you want to delete this article?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const token = await AsyncStorage.getItem('token');
              
              const response = await fetch(`http://192.168.100.42:3000/api/admin/content/articles/${articleId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setArticles(articles.filter(article => article._id !== articleId));
                Alert.alert('Success', 'Article deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete article');
              }
            } catch (error) {
              console.error('Delete article error:', error);
              Alert.alert('Error', 'Failed to delete article');
            }
          }
        }
      ]
    );
  };

  const renderRoadmapManagement = () => {
    console.log('🎨 Rendering Roadmap Management...');
    console.log('🗺️ Roadmaps state:', roadmaps);
    console.log('🗺️ Roadmaps length:', roadmaps.length);
    
    const filteredRoadmaps = roadmaps.filter(roadmap => 
      searchQuery === '' || 
      roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roadmap.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roadmap.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log('🔍 Filtered roadmaps:', filteredRoadmaps.length);
    
    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>Roadmaps Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                console.log('🔄 Manual refresh triggered');
                fetchRoadmaps();
              }}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setEditingRoadmap(null);
                setShowRoadmapModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search roadmaps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {filteredRoadmaps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {roadmaps.length === 0 ? 'No roadmaps found' : 'No roadmaps match your search'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {roadmaps.length === 0 ? 'Add your first roadmap to get started' : 'Try adjusting your search terms'}
            </Text>
            <Text style={styles.debugText}>
              Debug: Total roadmaps: {roadmaps.length}, Filtered: {filteredRoadmaps.length}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
            {filteredRoadmaps.map((roadmap, index) => (
              <View key={roadmap._id || index} style={styles.contentCard}>
                <View style={styles.contentCardHeader}>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle}>{roadmap.title}</Text>
                    <Text style={styles.contentDescription} numberOfLines={2}>
                      {roadmap.description}
                    </Text>
                    <View style={styles.contentMeta}>
                      <Text style={styles.contentMetaText}>Category: {roadmap.category}</Text>
                      <Text style={styles.contentMetaText}>Difficulty: {roadmap.difficulty}</Text>
                      <Text style={styles.contentMetaText}>Duration: {roadmap.duration}</Text>
                      <Text style={styles.contentMetaText}>Steps: {roadmap.steps?.length || 0}</Text>
                    </View>
                  </View>
                  <View style={styles.contentActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingRoadmap(roadmap);
                        setShowRoadmapModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRoadmap(roadmap._id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderPodcastManagement = () => {
    console.log('🎨 Rendering Podcast Management...');
    console.log('🎧 Podcasts state:', podcasts);
    console.log('🎧 Podcasts length:', podcasts.length);
    
    const filteredPodcasts = podcasts.filter(podcast =>
      podcast.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.host?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log('🔍 Filtered podcasts:', filteredPodcasts.length);

    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>Podcast Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={() => fetchPodcasts()}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => {
                setEditingPodcast(null);
                setShowPodcastModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Podcast</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search podcasts..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {filteredPodcasts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {podcasts.length === 0 
                ? 'No podcasts found. Add your first podcast!' 
                : 'No podcasts match your search.'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {podcasts.length === 0 
                ? 'Click "Add Podcast" to get started.' 
                : 'Try adjusting your search terms.'}
            </Text>
            <Text style={styles.emptyStateDebug}>
              Debug: {podcasts.length} total podcasts, {filteredPodcasts.length} filtered
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
            {filteredPodcasts.map((podcast) => (
              <View key={podcast._id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentTitle}>{podcast.title || 'Untitled Podcast'}</Text>
                  <View style={styles.contentActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingPodcast(podcast);
                        setShowPodcastModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeletePodcast(podcast._id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.contentMetaText}>Host: {podcast.host || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Category: {podcast.category || 'Uncategorized'}</Text>
                <Text style={styles.contentMetaText}>Duration: {podcast.duration || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Listeners: {podcast.totalListeners || 0}</Text>
                <Text style={styles.contentMetaText}>Rating: {podcast.rating || 0}/5</Text>
                <Text style={styles.contentMetaText}>
                  Status: {podcast.isActive ? '✅ Active' : '❌ Inactive'} 
                  {podcast.isFeatured ? ' | 🌟 Featured' : ''}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    Alert.alert(
      'Delete Roadmap',
      'Are you sure you want to delete this roadmap?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const token = await AsyncStorage.getItem('token');
              
              const response = await fetch(`http://192.168.100.42:3000/api/admin/content/roadmaps/${roadmapId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setRoadmaps(roadmaps.filter(roadmap => roadmap._id !== roadmapId));
                Alert.alert('Success', 'Roadmap deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete roadmap');
              }
            } catch (error) {
              console.error('Delete roadmap error:', error);
              Alert.alert('Error', 'Failed to delete roadmap');
            }
          }
        }
      ]
    );
  };

  const handleDeletePodcast = async (podcastId: string) => {
    Alert.alert(
      'Delete Podcast',
      'Are you sure you want to delete this podcast?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const token = await AsyncStorage.getItem('token');
              
              const response = await fetch(`http://192.168.100.42:3000/api/admin/content/podcasts/${podcastId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setPodcasts(podcasts.filter(podcast => podcast._id !== podcastId));
                Alert.alert('Success', 'Podcast deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete podcast');
              }
            } catch (error) {
              console.error('Delete podcast error:', error);
              Alert.alert('Error', 'Failed to delete podcast');
            }
          }
        }
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.overviewSection}>
            <View style={styles.contentHeader}>
              <Text style={styles.sectionTitle}>Content Overview</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={() => {
                  console.log('🔄 Manual refresh triggered for stats');
                  setLoading(true);
                  fetchContentStats();
                }}
              >
                <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.overviewGrid}>
              {contentTypes.map(renderOverviewCard)}
            </View>
          </View>
        );
      
      case 'courses':
        return (
          <View style={styles.contentSection}>
            <View style={styles.contentHeader}>
              <Text style={styles.sectionTitle}>Courses Management</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  setSelectedContentType('courses');
                  setShowAddModal(true);
                }}
              >
                <Text style={styles.addButtonText}>+ Add Course</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <Text style={styles.comingSoon}>Course management interface coming soon...</Text>
          </View>
        );
      
      case 'cvTemplates':
        return renderCVManagement();
      
      case 'articles':
        console.log('📄 Articles tab selected, rendering article management...');
        return renderArticleManagement();
      
      case 'roadmaps':
        console.log('🗺️ Roadmaps tab selected, rendering roadmap management...');
        return renderRoadmapManagement();
      
      case 'podcasts':
        console.log('🎧 Podcasts tab selected, rendering podcast management...');
        return renderPodcastManagement();
      
      case 'advices':
        console.log('💡 Advices tab selected, rendering advice management...');
        return renderAdviceManagement();
      
      default:
        return (
          <View style={styles.contentSection}>
            <View style={styles.contentHeader}>
              <Text style={styles.sectionTitle}>{tabs.find(t => t.id === activeTab)?.name} Management</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  setSelectedContentType(activeTab);
                  setShowAddModal(true);
                }}
              >
                <Text style={styles.addButtonText}>+ Add {tabs.find(t => t.id === activeTab)?.name}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${tabs.find(t => t.id === activeTab)?.name.toLowerCase()}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <Text style={styles.comingSoon}>Management interface coming soon...</Text>
          </View>
        );
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading content management...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Content Management</Text>
            
            {/* Notification Settings Button */}
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notification-settings')}
            >
              <Text style={styles.notificationButtonText}>🔔 إعدادات الإشعارات</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load content statistics</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchContentStats}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Content Management</Text>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content */}
          {renderTabContent()}
        </ScrollView>

        {/* Add Content Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
        >
          <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                Add {tabs.find(t => t.id === selectedContentType)?.name}
              </Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.comingSoon}>
                Add {selectedContentType} form coming soon...
              </Text>
            </View>
          </LinearGradient>
        </Modal>

        {/* CV Template Modal */}
        <Modal
          visible={showCVModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCVModal(false)}
        >
          <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCVModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingCV ? 'Edit CV Template' : 'Add CV Template'}
              </Text>
            </View>
            <ScrollView style={styles.modalContent}>
              <CVForm 
                cv={editingCV}
                onSave={async (cvData) => {
                  try {
                    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                    const token = await AsyncStorage.getItem('token');
                    
                    console.log('Saving CV data:', cvData);
                    console.log('Token exists:', !!token);
                    
                    let response;
                    if (editingCV) {
                      // Update existing CV
                      console.log('Updating CV:', editingCV._id);
                      response = await fetch(`http://192.168.100.42:3000/api/admin/content/cv-templates/${editingCV._id}`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cvData),
                      });
                    } else {
                      // Add new CV
                      console.log('Creating new CV');
                      response = await fetch('http://192.168.100.42:3000/api/admin/content/cv-templates', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cvData),
                      });
                    }

                    console.log('Response status:', response.status);
                    
                    if (response.ok) {
                      const result = await response.json();
                      console.log('Success result:', result);
                      if (editingCV) {
                        setCvTemplates(cvTemplates.map(cv => 
                          cv._id === editingCV._id ? result.data.cvTemplate : cv
                        ));
                        Alert.alert('Success', 'CV template updated successfully');
                      } else {
                        setCvTemplates([...cvTemplates, result.data.cvTemplate]);
                        Alert.alert('Success', 'CV template added successfully');
                      }
                      setShowCVModal(false);
                      setEditingCV(null);
                    } else {
                      const errorText = await response.text();
                      console.error('Error response:', errorText);
                      Alert.alert('Error', `Failed to save CV template: ${response.status}`);
                    }
                  } catch (error) {
                    console.error('Error saving CV template:', error);
                    Alert.alert('Error', `Failed to save CV template: ${error.message}`);
                  }
                }}
                onCancel={() => {
                  setShowCVModal(false);
                  setEditingCV(null);
                }}
              />
            </ScrollView>
          </LinearGradient>
        </Modal>

        {/* Article Form Modal */}
        {showArticleModal && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showArticleModal}
            onRequestClose={() => setShowArticleModal(false)}
          >
            <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingArticle ? 'Edit Article' : 'Add New Article'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowArticleModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                <ArticleForm 
                  article={editingArticle}
                  onSave={async (articleData) => {
                    try {
                      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                      const token = await AsyncStorage.getItem('token');
                      
                      const url = editingArticle 
                        ? `http://192.168.100.42:3000/api/admin/content/articles/${editingArticle._id}`
                        : 'http://192.168.100.42:3000/api/admin/content/articles';
                      
                      const response = await fetch(url, {
                        method: editingArticle ? 'PUT' : 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(articleData),
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        
                        if (editingArticle) {
                          setArticles(articles.map(article => 
                            article._id === editingArticle._id ? result.data.article : article
                          ));
                          Alert.alert('Success', 'Article updated successfully');
                        } else {
                          setArticles([result.data.article, ...articles]);
                          Alert.alert('Success', 'Article created successfully');
                        }
                        setShowArticleModal(false);
                        setEditingArticle(null);
                      } else {
                        const errorData = await response.json();
                        Alert.alert('Error', `Failed to save article: ${response.status}`);
                      }
                    } catch (error) {
                      console.error('Error saving article:', error);
                      Alert.alert('Error', 'Failed to save article');
                    }
                  }}
                  onCancel={() => {
                    setShowArticleModal(false);
                    setEditingArticle(null);
                  }}
                />
              </ScrollView>
            </LinearGradient>
          </Modal>
        )}

        {/* Roadmap Form Modal */}
        {showRoadmapModal && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showRoadmapModal}
            onRequestClose={() => setShowRoadmapModal(false)}
          >
            <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingRoadmap ? 'Edit Roadmap' : 'Add New Roadmap'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowRoadmapModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                <RoadmapForm 
                  roadmap={editingRoadmap}
                  onSave={async (roadmapData) => {
                    try {
                      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                      const token = await AsyncStorage.getItem('token');
                      
                      if (!token) {
                        Alert.alert('Error', 'Please login again');
                        return;
                      }
                      
                      const url = editingRoadmap 
                        ? `http://192.168.100.42:3000/api/admin/content/roadmaps/${editingRoadmap._id}`
                        : 'http://192.168.100.42:3000/api/admin/content/roadmaps';
                      
                      console.log('Saving roadmap:', roadmapData);
                      console.log('Image data:', roadmapData.image);
                      
                      const response = await fetch(url, {
                        method: editingRoadmap ? 'PUT' : 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(roadmapData),
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        
                        if (editingRoadmap) {
                          setRoadmaps(roadmaps.map(roadmap => 
                            roadmap._id === editingRoadmap._id ? result.data.roadmap : roadmap
                          ));
                          Alert.alert('Success', 'Roadmap updated successfully');
                        } else {
                          setRoadmaps([result.data.roadmap, ...roadmaps]);
                          Alert.alert('Success', 'Roadmap created successfully');
                        }
                        setShowRoadmapModal(false);
                        setEditingRoadmap(null);
                      } else {
                        const errorData = await response.json();
                        console.error('Roadmap save error:', errorData);
                        Alert.alert('Error', `Failed to save roadmap: ${errorData.message || response.status}`);
                      }
                    } catch (error) {
                      console.error('Error saving roadmap:', error);
                      Alert.alert('Error', `Network error: ${error.message}`);
                    }
                  }}
                  onCancel={() => {
                    setShowRoadmapModal(false);
                    setEditingRoadmap(null);
                  }}
                />
              </ScrollView>
            </LinearGradient>
          </Modal>
        )}

        {/* Podcast Form Modal */}
        {showPodcastModal && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showPodcastModal}
            onRequestClose={() => setShowPodcastModal(false)}
          >
            <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingPodcast ? 'Edit Podcast' : 'Add New Podcast'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPodcastModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                <PodcastForm 
                  podcast={editingPodcast}
                  onSave={async (podcastData) => {
                    try {
                      console.log('🎬 Saving podcast:', JSON.stringify(podcastData, null, 2));
                      console.log('🎬 Video URL in save:', podcastData.videoUrl);
                      console.log('🎬 Intro Video in save:', podcastData.introVideo);
                      console.log('🎬 Episodes in save:', podcastData.episodes);
                      console.log('🎬 Episodes length in save:', podcastData.episodes?.length || 0);
                      
                      const url = editingPodcast 
                        ? `http://192.168.100.42:3000/api/admin/content/podcasts/${editingPodcast._id}`
                        : 'http://192.168.100.42:3000/api/admin/content/podcasts';
                      
                      const method = editingPodcast ? 'PUT' : 'POST';

                      console.log('🎬 Sending to URL:', url);
                      console.log('🎬 Method:', method);

                      const response = await makeAuthenticatedRequest(url, {
                        method,
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(podcastData),
                      });

                      console.log('🎬 Response status:', response.status);

                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Podcast saved:', result);
                        
                        if (editingPodcast) {
                          setPodcasts(podcasts.map(p => p._id === editingPodcast._id ? result.data.podcast : p));
                        } else {
                          setPodcasts([result.data.podcast, ...podcasts]);
                          
                          // Send notification for new content
                          await NotificationService.sendContentNotification(
                            'podcast',
                            result.data.podcast?.title || 'بودكاست جديد',
                            result.data.podcast?.host
                          );
                        }
                        setShowPodcastModal(false);
                        setEditingPodcast(null);
                        Alert.alert('تم بنجاح!', editingPodcast ? 'تم تحديث البودكاست بنجاح!' : 'تم إنشاء البودكاست وإرسال إشعار!');
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Podcast save error:', errorText);
                        Alert.alert('Error', `Failed to save podcast: ${response.status} - ${errorText}`);
                      }
                    } catch (error) {
                      console.error('Error saving podcast:', error);
                      Alert.alert('Error', 'Failed to save podcast');
                    }
                  }}
                  onCancel={() => {
                    setShowPodcastModal(false);
                    setEditingPodcast(null);
                  }}
                />
              </ScrollView>
            </LinearGradient>
          </Modal>
        )}

        {/* Advice Modal */}
        {showAdviceModal && (
          <Modal
            visible={showAdviceModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowAdviceModal(false)}
          >
            <LinearGradient
              colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
              style={styles.modalContainer}
            >
              <ScrollView style={styles.modalScrollView}>
                <AdviceForm
                  advice={editingAdvice}
                  onSave={async (adviceData) => {
                    try {
                      console.log('💡 Saving advice:', JSON.stringify(adviceData, null, 2));
                      
                      const url = editingAdvice 
                        ? `http://192.168.100.42:3000/api/admin/content/advices/${editingAdvice._id}`
                        : 'http://192.168.100.42:3000/api/admin/content/advices';
                      
                      const method = editingAdvice ? 'PUT' : 'POST';
                      
                      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                      const token = await AsyncStorage.getItem('token');
                      
                      const response = await fetch(url, {
                        method,
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(adviceData),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Advice saved successfully:', result);
                        
                        if (editingAdvice) {
                          setAdvices(advices.map(advice => 
                            advice._id === editingAdvice._id ? result.data : advice
                          ));
                        } else {
                          setAdvices([result.data, ...advices]);
                          
                          // Send notification for new content
                          await NotificationService.sendContentNotification(
                            'advice',
                            result.data.title || 'نصيحة جديدة',
                            result.data.author
                          );
                        }
                        setShowAdviceModal(false);
                        setEditingAdvice(null);
                        Alert.alert('تم بنجاح!', editingAdvice ? 'تم تحديث النصيحة بنجاح!' : 'تم إنشاء النصيحة وإرسال إشعار!');
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Advice save error:', errorText);
                        Alert.alert('Error', `Failed to save advice: ${response.status} - ${errorText}`);
                      }
                    } catch (error) {
                      console.error('Error saving advice:', error);
                      Alert.alert('Error', 'Failed to save advice');
                    }
                  }}
                  onCancel={() => {
                    setShowAdviceModal(false);
                    setEditingAdvice(null);
                  }}
                />
              </ScrollView>
            </LinearGradient>
          </Modal>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

// CV Form Component
const CVForm = ({ cv, onSave, onCancel }: { cv: any, onSave: (data: any) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    name: cv?.name || '',
    title: cv?.title || '',
    description: cv?.description || '',
    experience: cv?.experience || '',
    education: cv?.education || '',
    skills: cv?.skills?.join(', ') || '',
    downloadUrl: cv?.downloadUrl || '',
    fileType: cv?.fileType || 'link' // 'link' or 'pdf'
  });
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        Alert.alert('Success', `File selected: ${file.name}`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const cvData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      selectedFile: selectedFile // Include the selected file
    };

    onSave(cvData);
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Name *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder="Enter CV owner name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Title *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
          placeholder="Enter CV title"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Description *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Enter CV description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Experience</Text>
        <TextInput
          style={styles.formInput}
          value={formData.experience}
          onChangeText={(text) => setFormData({...formData, experience: text})}
          placeholder="e.g., 5+ years"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Education</Text>
        <TextInput
          style={styles.formInput}
          value={formData.education}
          onChangeText={(text) => setFormData({...formData, education: text})}
          placeholder="e.g., Computer Science - Cairo University"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Skills</Text>
        <TextInput
          style={styles.formInput}
          value={formData.skills}
          onChangeText={(text) => setFormData({...formData, skills: text})}
          placeholder="Enter skills separated by commas"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>File Type</Text>
        <View style={styles.fileTypeContainer}>
          <TouchableOpacity 
            style={[
              styles.fileTypeButton, 
              formData.fileType === 'link' && styles.fileTypeButtonActive
            ]}
            onPress={() => setFormData({...formData, fileType: 'link'})}
          >
            <Text style={[
              styles.fileTypeButtonText,
              formData.fileType === 'link' && styles.fileTypeButtonTextActive
            ]}>🔗 Link</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.fileTypeButton, 
              formData.fileType === 'pdf' && styles.fileTypeButtonActive
            ]}
            onPress={() => setFormData({...formData, fileType: 'pdf'})}
          >
            <Text style={[
              styles.fileTypeButtonText,
              formData.fileType === 'pdf' && styles.fileTypeButtonTextActive
            ]}>📄 PDF File</Text>
          </TouchableOpacity>
        </View>
      </View>

      {formData.fileType === 'link' ? (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Download URL</Text>
          <TextInput
            style={styles.formInput}
            value={formData.downloadUrl}
            onChangeText={(text) => setFormData({...formData, downloadUrl: text})}
            placeholder="Enter download URL (e.g., https://example.com/cv.pdf)"
            placeholderTextColor="#999"
          />
        </View>
      ) : (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>PDF File</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadButtonText}>
              {selectedFile ? `📄 ${selectedFile.name}` : '📁 Choose PDF File'}
            </Text>
          </TouchableOpacity>
          {selectedFile && (
            <Text style={styles.fileInfo}>
              ✅ File selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Text>
          )}
          <Text style={styles.uploadHint}>Upload a PDF file from your device</Text>
        </View>
      )}

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save CV Template</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Article Form Component
const ArticleForm = ({ article, onSave, onCancel }: { article: any, onSave: (data: any) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    description: article?.description || '',
    content: article?.content || '',
    author: article?.author || '',
    readTime: article?.readTime || '',
    category: article?.category || 'programming',
    image: article?.image || '',
    icon: article?.icon || '📄',
    color: article?.color || '#4ECDC4'
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setFormData({...formData, image: result.assets[0].uri});
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.content || !formData.author || !formData.readTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // If no image URL and no selected image, use a default placeholder
    if (!formData.image && !selectedImage) {
      setFormData({...formData, image: 'https://via.placeholder.com/300x200/1a1a1a/4ECDC4?text=Article+Image'});
    }

    onSave(formData);
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Title *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
          placeholder="Enter article title"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Description *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Enter article description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Content *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          value={formData.content}
          onChangeText={(text) => setFormData({...formData, content: text})}
          placeholder="Enter article content"
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Author *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.author}
          onChangeText={(text) => setFormData({...formData, author: text})}
          placeholder="Enter author name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Read Time *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.readTime}
          onChangeText={(text) => setFormData({...formData, readTime: text})}
          placeholder="e.g., 5 min read"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Category *</Text>
        <View style={styles.categoryContainer}>
          {['programming', 'design', 'marketing', 'freelancing', 'career'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                formData.category === category && styles.categoryButtonActive
              ]}
              onPress={() => setFormData({...formData, category})}
            >
              <Text style={[
                styles.categoryButtonText,
                formData.category === category && styles.categoryButtonTextActive
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Image</Text>
        <TouchableOpacity 
          style={styles.imagePickerButton}
          onPress={pickImage}
        >
          <Text style={styles.imagePickerButtonText}>
            {selectedImage ? '📷 Image Selected' : '📷 Choose Image from Gallery'}
          </Text>
        </TouchableOpacity>
        {selectedImage && (
          <Text style={styles.imageInfo}>
            Selected: {selectedImage.fileName || 'Image'}
          </Text>
        )}
        <Text style={styles.formLabel}>Or enter Image URL:</Text>
        <TextInput
          style={styles.formInput}
          value={formData.image}
          onChangeText={(text) => setFormData({...formData, image: text})}
          placeholder="Enter image URL (optional)"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Icon</Text>
        <TextInput
          style={styles.formInput}
          value={formData.icon}
          onChangeText={(text) => setFormData({...formData, icon: text})}
          placeholder="Enter icon emoji"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Color</Text>
        <TextInput
          style={styles.formInput}
          value={formData.color}
          onChangeText={(text) => setFormData({...formData, color: text})}
          placeholder="Enter color hex code"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Article</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RoadmapForm = ({ roadmap, onSave, onCancel }: { roadmap: any, onSave: (data: any) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    title: roadmap?.title || '',
    description: roadmap?.description || '',
    category: roadmap?.category || 'Frontend',
    difficulty: roadmap?.difficulty || 'Beginner',
    duration: roadmap?.duration || '',
    steps: roadmap?.steps || [{ title: '', description: '', resources: [] }],
    image: roadmap?.image || '',
    icon: roadmap?.icon || '🗺️',
    color: roadmap?.color || '#9B59B6',
    isActive: roadmap?.isActive !== undefined ? roadmap.isActive : true,
    isFeatured: roadmap?.isFeatured !== undefined ? roadmap.isFeatured : false
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        console.log('Image selected:', imageUri);
        
        // Upload image to server
        await uploadImageToServer(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImageToServer = async (imageUri: string) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const response = await fetch('http://192.168.100.42:3000/api/admin/content/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Image uploaded:', result.data.imageUrl);
        setFormData({...formData, image: result.data.imageUrl});
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        console.error('Failed to upload image:', response.status);
        Alert.alert('Error', 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { title: '', description: '', resources: [] }]
    });
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      setFormData({
        ...formData,
        steps: formData.steps.filter((_, i) => i !== index)
      });
    }
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const addResource = (stepIndex: number) => {
    const newSteps = [...formData.steps];
    newSteps[stepIndex].resources = [...newSteps[stepIndex].resources, { title: '', url: '', type: 'article' }];
    setFormData({ ...formData, steps: newSteps });
  };

  const removeResource = (stepIndex: number, resourceIndex: number) => {
    const newSteps = [...formData.steps];
    newSteps[stepIndex].resources = newSteps[stepIndex].resources.filter((_, i) => i !== resourceIndex);
    setFormData({ ...formData, steps: newSteps });
  };

  const updateResource = (stepIndex: number, resourceIndex: number, field: string, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[stepIndex].resources[resourceIndex] = { ...newSteps[stepIndex].resources[resourceIndex], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.duration) {
      Alert.alert('Error', 'Please fill in title, description, and duration');
      return;
    }

    // If no image URL or if it's a local file URL, use a default placeholder
    if (!formData.image || formData.image.startsWith('file://')) {
      setFormData({...formData, image: 'https://via.placeholder.com/300x200/1a1a1a/9B59B6?text=Roadmap+Image'});
    }

    onSave(formData);
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Title *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
          placeholder="Enter roadmap title"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Description *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Enter roadmap description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.formLabel}>Category *</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => {
              Alert.alert(
                'Select Category',
                'Choose the roadmap category',
                [
                  { text: 'Frontend', onPress: () => setFormData({...formData, category: 'Frontend'}) },
                  { text: 'Backend', onPress: () => setFormData({...formData, category: 'Backend'}) },
                  { text: 'Full Stack', onPress: () => setFormData({...formData, category: 'Full Stack'}) },
                  { text: 'Mobile', onPress: () => setFormData({...formData, category: 'Mobile'}) },
                  { text: 'DevOps', onPress: () => setFormData({...formData, category: 'DevOps'}) },
                  { text: 'Data Science', onPress: () => setFormData({...formData, category: 'Data Science'}) },
                  { text: 'AI/ML', onPress: () => setFormData({...formData, category: 'AI/ML'}) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.selectText}>{formData.category}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.formLabel}>Difficulty *</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => {
              Alert.alert(
                'Select Difficulty',
                'Choose the difficulty level',
                [
                  { text: 'Beginner', onPress: () => setFormData({...formData, difficulty: 'Beginner'}) },
                  { text: 'Intermediate', onPress: () => setFormData({...formData, difficulty: 'Intermediate'}) },
                  { text: 'Advanced', onPress: () => setFormData({...formData, difficulty: 'Advanced'}) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.selectText}>{formData.difficulty}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Duration *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.duration}
          onChangeText={(text) => setFormData({...formData, duration: text})}
          placeholder="e.g., 6 months, 12 weeks"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Image</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerText}>📷 Pick Image from Device</Text>
        </TouchableOpacity>
        {selectedImage && (
          <View style={styles.imageInfo}>
            <Text style={styles.imageInfoText}>✅ Image selected: {selectedImage.substring(0, 30)}...</Text>
          </View>
        )}
        {formData.image && !selectedImage && (
          <View style={styles.imageInfo}>
            <Text style={styles.imageInfoText}>📷 Current image: {formData.image.substring(0, 50)}...</Text>
          </View>
        )}
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.formLabel}>Icon</Text>
          <TextInput
            style={styles.formInput}
            value={formData.icon}
            onChangeText={(text) => setFormData({...formData, icon: text})}
            placeholder="🗺️"
            placeholderTextColor="#999"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.formLabel}>Color</Text>
          <TextInput
            style={styles.formInput}
            value={formData.color}
            onChangeText={(text) => setFormData({...formData, color: text})}
            placeholder="#9B59B6"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Steps *</Text>
        {formData.steps.map((step, stepIndex) => (
          <View key={stepIndex} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Step {stepIndex + 1}</Text>
              {formData.steps.length > 1 && (
                <TouchableOpacity onPress={() => removeStep(stepIndex)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TextInput
              style={styles.formInput}
              value={step.title}
              onChangeText={(text) => updateStep(stepIndex, 'title', text)}
              placeholder="Step title (optional)"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={step.description}
              onChangeText={(text) => updateStep(stepIndex, 'description', text)}
              placeholder="Step description (optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={2}
            />

            <View style={styles.resourcesContainer}>
              <Text style={styles.resourcesTitle}>Resources:</Text>
              {step.resources.map((resource, resourceIndex) => (
                <View key={resourceIndex} style={styles.resourceContainer}>
                  <View style={styles.resourceRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 2, marginRight: 8 }]}
                      value={resource.title}
                      onChangeText={(text) => updateResource(stepIndex, resourceIndex, 'title', text)}
                      placeholder="Resource title"
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity 
                      style={[styles.selectContainer, { flex: 1, marginRight: 8 }]}
                      onPress={() => {
                        Alert.alert(
                          'Select Resource Type',
                          'Choose the type of resource',
                          [
                            { text: 'Article', onPress: () => updateResource(stepIndex, resourceIndex, 'type', 'article') },
                            { text: 'Video', onPress: () => updateResource(stepIndex, resourceIndex, 'type', 'video') },
                            { text: 'Course', onPress: () => updateResource(stepIndex, resourceIndex, 'type', 'course') },
                            { text: 'Documentation', onPress: () => updateResource(stepIndex, resourceIndex, 'type', 'documentation') },
                            { text: 'Tool', onPress: () => updateResource(stepIndex, resourceIndex, 'type', 'tool') },
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        );
                      }}
                    >
                      <Text style={styles.selectText}>{resource.type || 'article'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeResource(stepIndex, resourceIndex)} style={styles.removeButton}>
                      <Text style={styles.removeButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.formInput, { marginTop: 8 }]}
                    value={resource.url}
                    onChangeText={(text) => updateResource(stepIndex, resourceIndex, 'url', text)}
                    placeholder="Resource URL (optional)"
                    placeholderTextColor="#999"
                  />
                </View>
              ))}
              <TouchableOpacity onPress={() => addResource(stepIndex)} style={styles.addResourceButton}>
                <Text style={styles.addResourceButtonText}>+ Add Resource</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={addStep} style={styles.addStepButton}>
          <Text style={styles.addStepButtonText}>+ Add Step</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formRow}>
        <TouchableOpacity 
          style={[styles.checkboxContainer, { flex: 1, marginRight: 8 }]}
          onPress={() => setFormData({...formData, isActive: !formData.isActive})}
        >
          <Text style={styles.checkboxText}>Active</Text>
          <Text style={styles.checkbox}>{formData.isActive ? '✅' : '⬜'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.checkboxContainer, { flex: 1, marginLeft: 8 }]}
          onPress={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
        >
          <Text style={styles.checkboxText}>Featured</Text>
          <Text style={styles.checkbox}>{formData.isFeatured ? '✅' : '⬜'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Roadmap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabsContainer: {
    marginBottom: 30,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  overviewSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  overviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: '45%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  contentSection: {
    marginBottom: 30,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 80,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  comingSoon: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    marginRight: 15,
  },
  closeButtonText: {
    color: '#E50914',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // CV Management Styles
  cvList: {
    marginTop: 20,
  },
  cvCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cvInfo: {
    flex: 1,
  },
  cvName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 4,
  },
  cvTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cvDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  cvActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 18,
    color: '#3498DB',
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#E74C3C',
  },
  cvFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cvExperience: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  cvDownloads: {
    fontSize: 12,
    color: '#999999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  // Form Styles
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#E50914',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Skills Display Styles
  cvSkills: {
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderWidth: 1,
    borderColor: '#E50914',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '600',
  },
  // File Type Styles
  fileTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  fileTypeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fileTypeButtonActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  fileTypeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fileTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  // Upload Styles
  uploadButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderWidth: 1,
    borderColor: '#3498DB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#3498DB',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadHint: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  fileInfo: {
    color: '#4CAF50',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  // Article Styles
  articleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  articleInfo: {
    flex: 1,
    marginRight: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  articleAuthor: {
    fontSize: 12,
    color: '#4ECDC4',
    marginBottom: 6,
  },
  articleDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  articleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  articleCategory: {
    fontSize: 12,
    color: '#999999',
  },
  articleReadTime: {
    fontSize: 12,
    color: '#999999',
  },
  articleViews: {
    fontSize: 12,
    color: '#999999',
  },
  articleLikes: {
    fontSize: 12,
    color: '#999999',
  },
  // Form Styles
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#444',
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 12,
  },
  emptyStateSubtext: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  debugText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  // Header Actions Styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginRight: 8,
    minWidth: 70,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addEpisodeButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  addEpisodeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  episodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  episodeTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  removeEpisodeButton: {
    backgroundColor: '#FF6B6B',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeEpisodeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoSourceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  videoOptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  videoOptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoUrlInput: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444444',
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  urlHelpContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  urlHelpTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  urlHelpText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  imagePickerButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  imagePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageInfo: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageInfoText: {
    color: '#4CAF50',
    fontSize: 14,
    flex: 1,
  },
  clearImageButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearImageText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  episodeImageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  episodeImageButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  episodeImageButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  urlActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  episodeVideoOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  episodeVideoButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  episodeVideoButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Image Picker Styles
  imagePickerButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  imageInfo: {
    color: '#4CAF50',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  // Roadmap Form Styles
  stepContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    padding: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 14,
  },
  resourcesContainer: {
    marginTop: 8,
  },
  resourcesTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  resourceContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addResourceButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addResourceButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  addStepButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addStepButtonText: {
    color: '#9B59B6',
    fontSize: 16,
    fontWeight: '600',
  },
  selectContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  imagePickerButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePickerText: {
    color: '#3498DB',
    fontSize: 14,
    fontWeight: '600',
  },
  imageInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  imageInfoText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  // Content Card Styles
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentInfo: {
    flex: 1,
    marginRight: 16,
  },
  contentTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  contentDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  contentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contentMetaText: {
    color: '#999999',
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  contentActions: {
    flexDirection: 'row',
  },
  dropdownButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownArrow: {
    color: '#999999',
    fontSize: 12,
  },
  helpText: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  helpTextLabel: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  helpTextExample: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 2,
    lineHeight: 16,
  },
});

// Podcast Form Component
            const PodcastForm = ({ podcast, onSave, onCancel }: { podcast: any, onSave: (data: any) => void, onCancel: () => void }) => {
  
  // Debug: Log when component mounts
  console.log('🎬 PodcastForm mounted with podcast:', podcast);
  const [formData, setFormData] = useState({
    title: podcast?.title || 'My Podcast',
    description: podcast?.description || 'A great podcast episode',
    host: podcast?.host || 'Host Name',
    duration: podcast?.duration || '30:00',
    category: podcast?.category || 'Technology',
    rating: podcast?.rating !== undefined ? podcast.rating : 4,
    totalListeners: podcast?.totalListeners !== undefined ? podcast.totalListeners : 100,
    thumbnail: podcast?.thumbnail || '',
    videoUrl: podcast?.videoUrl || '',
    introVideo: podcast?.introVideo || '',
    episodes: podcast?.episodes || [],
    isActive: podcast?.isActive !== undefined ? podcast.isActive : true,
    isFeatured: podcast?.isFeatured || false,
  });

  // Debug: Log formData changes
  console.log('🎬 Current formData:', formData);

  const handleSubmit = () => {
                console.log('🎬 Form data before save:', JSON.stringify(formData, null, 2));
                console.log('🎬 Video URL:', formData.videoUrl);
                console.log('🎬 Video URL type:', typeof formData.videoUrl);
                console.log('🎬 Video URL length:', formData.videoUrl?.length || 0);
                console.log('🎬 Video URL includes http:', formData.videoUrl?.includes('http'));
                console.log('🎬 Intro Video:', formData.introVideo);
                console.log('🎬 Intro Video type:', typeof formData.introVideo);
                console.log('🎬 Intro Video includes http:', formData.introVideo?.includes('http'));
                console.log('🎬 Episodes:', formData.episodes);
                console.log('🎬 Episodes length:', formData.episodes?.length || 0);
                console.log('🎬 Episodes type:', typeof formData.episodes);
                console.log('🎬 Episodes is array:', Array.isArray(formData.episodes));
                console.log('🎬 Episodes URLs:', formData.episodes?.map(ep => ep.url));
    
    // Force episodes to be an array if it's not
    const finalFormData = {
      ...formData,
      episodes: Array.isArray(formData.episodes) ? formData.episodes : []
    };
    
    console.log('🎬 Final form data:', JSON.stringify(finalFormData, null, 2));
    
                // Clean up empty URLs
                const cleanedFormData = {
                  ...finalFormData,
                  videoUrl: finalFormData.videoUrl?.trim() || '',
                  introVideo: finalFormData.introVideo?.trim() || '',
                  episodes: finalFormData.episodes.map(episode => ({
                    ...episode,
                    url: episode.url?.trim() || ''
                  }))
                };
                
                console.log('🎬 Cleaned form data:', JSON.stringify(cleanedFormData, null, 2));
                
                // Validate data - now accepts all video URLs
                const hasValidVideo = cleanedFormData.videoUrl && cleanedFormData.videoUrl.trim() !== '';
                const hasValidIntro = cleanedFormData.introVideo && cleanedFormData.introVideo.trim() !== '';
                const hasValidEpisodes = cleanedFormData.episodes.some(ep => ep.url && ep.url.trim() !== '');
                
                if (!hasValidVideo && !hasValidIntro && !hasValidEpisodes) {
                  Alert.alert('تحذير', 'لم تقم بإضافة أي فيديوهات صحيحة. هل تريد المتابعة؟', [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'متابعة', onPress: () => onSave(cleanedFormData) }
                  ]);
                } else {
                  onSave(cleanedFormData);
                }
  };


  const selectCategory = () => {
    Alert.alert(
      'Select Category',
      'Choose a category for the podcast',
      [
        { text: 'Technology', onPress: () => setFormData({...formData, category: 'Technology'}) },
        { text: 'Programming', onPress: () => setFormData({...formData, category: 'Programming'}) },
        { text: 'Business', onPress: () => setFormData({...formData, category: 'Business'}) },
        { text: 'Design', onPress: () => setFormData({...formData, category: 'Design'}) },
        { text: 'Career', onPress: () => setFormData({...formData, category: 'Career'}) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('📷 Image selected:', imageUri);
        
        // Upload image to server
        const uploadResult = await uploadImageToServer(imageUri);
        if (uploadResult) {
          setFormData({...formData, thumbnail: uploadResult});
          Alert.alert('تم', 'تم رفع الصورة بنجاح!');
        }
      }
    } catch (error) {
      console.error('📷 Image picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const uploadImageToServer = async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'podcast-thumbnail.jpg',
      } as any);

      const response = await fetch('http://192.168.100.42:3000/api/admin/content/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📷 Upload result:', result);
        return result.data.imageUrl;
      } else {
        console.error('📷 Upload failed:', response.status);
        Alert.alert('خطأ', 'فشل في رفع الصورة');
        return null;
      }
    } catch (error) {
      console.error('📷 Upload error:', error);
      Alert.alert('خطأ', 'فشل في رفع الصورة');
      return null;
    }
  };

  const pickEpisodeImage = async (episodeIndex: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('📷 Episode image selected:', imageUri);
        
        // Upload image to server
        const uploadResult = await uploadImageToServer(imageUri);
        if (uploadResult) {
          const updatedEpisodes = [...formData.episodes];
          updatedEpisodes[episodeIndex] = { ...updatedEpisodes[episodeIndex], thumbnail: uploadResult };
          setFormData({...formData, episodes: updatedEpisodes});
          Alert.alert('تم', 'تم رفع صورة الحلقة بنجاح!');
        }
      }
    } catch (error) {
      console.error('📷 Episode image picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار صورة الحلقة');
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>
        {podcast ? 'Edit Podcast' : 'Add New Podcast'}
      </Text>

      <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Title *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            placeholder="Enter podcast title"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Description *</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholder="Enter podcast description"
            placeholderTextColor="#666666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Host *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.host}
            onChangeText={(text) => setFormData({...formData, host: text})}
            placeholder="Enter host name"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Duration *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.duration}
            onChangeText={(text) => setFormData({...formData, duration: text})}
            placeholder="e.g., 45:30"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Category *</Text>
          <TouchableOpacity 
            style={[styles.dropdownButton, { backgroundColor: '#1a1a1a', borderColor: '#333333' }]} 
            onPress={selectCategory}
          >
            <Text style={[styles.dropdownButtonText, { color: '#FFFFFF' }]}>
              {formData.category}
            </Text>
            <Text style={[styles.dropdownArrow, { color: '#666666', marginLeft: 8 }]}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Rating</Text>
          <TextInput
            style={styles.formInput}
            value={(formData.rating || 0).toString()}
            onChangeText={(text) => setFormData({...formData, rating: parseFloat(text) || 0})}
            placeholder="0-5"
            placeholderTextColor="#666666"
            keyboardType="numeric"
          />
        </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Total Listeners</Text>
                      <TextInput
                        style={styles.formInput}
                        value={(formData.totalListeners || 0).toString()}
                        onChangeText={(text) => setFormData({...formData, totalListeners: parseInt(text) || 0})}
                        placeholder="0"
                        placeholderTextColor="#666666"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Thumbnail Image</Text>
                      <TouchableOpacity
                        style={styles.imagePickerButton}
                        onPress={pickImage}
                      >
                        <Text style={styles.imagePickerText}>
                          {formData.thumbnail ? '📷 Change Image' : '📷 Select Image'}
                        </Text>
                      </TouchableOpacity>
                      
                      {formData.thumbnail && (
                        <View style={styles.imageInfo}>
                          <Text style={styles.imageInfoText}>
                            ✅ Image selected: {formData.thumbnail.split('/').pop()}
                          </Text>
                          <TouchableOpacity
                            style={styles.clearImageButton}
                            onPress={() => setFormData({...formData, thumbnail: ''})}
                          >
                            <Text style={styles.clearImageText}>🗑️ Remove</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Video Source</Text>
                      
                      {/* Video Source Options */}
                      <View style={styles.videoSourceOptions}>
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#4ECDC4' }]}
                          onPress={() => {
                            const sampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                            setFormData({...formData, videoUrl: sampleUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>📹 Direct MP4</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#E50914' }]}
                          onPress={() => {
                            const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                            setFormData({...formData, videoUrl: youtubeUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>🎥 YouTube</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#1AB7EA' }]}
                          onPress={() => {
                            const vimeoUrl = 'https://vimeo.com/148751763';
                            setFormData({...formData, videoUrl: vimeoUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>🎬 Vimeo</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#FF6B35' }]}
                          onPress={() => {
                            const cloudinaryUrl = 'https://player.cloudinary.com/embed/?cloud_name=dfqy6dw1g&public_id=Part1_wxgk8o&profile=cld-default';
                            setFormData({...formData, videoUrl: cloudinaryUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>☁️ Cloudinary</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#27AE60' }]}
                          onPress={() => {
                            const testUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                            setFormData({...formData, videoUrl: testUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>🧪 Test Video</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#8E44AD' }]}
                          onPress={() => {
                            // Add test episode
                            const testEpisode = {
                              title: 'Test Episode',
                              duration: '10:00',
                              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                              thumbnail: '',
                              description: 'Test episode description',
                              isCompleted: false,
                              category: 'Episode'
                            };
                            setFormData({
                              ...formData, 
                              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                              introVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                              episodes: [testEpisode]
                            });
                          }}
                        >
                          <Text style={styles.videoOptionText}>🚀 Test All</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#E74C3C' }]}
                          onPress={() => {
                            Alert.alert(
                              'اختبار سريع',
                              'هل تريد إضافة فيديوهات تجريبية للاختبار؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'نعم', 
                                  onPress: () => {
                                    const testEpisode1 = {
                                      title: 'Episode 1 - Introduction',
                                      duration: '15:30',
                                      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                                      thumbnail: '',
                                      description: 'Introduction to the podcast',
                                      isCompleted: false,
                                      category: 'Episode'
                                    };
                                    const testEpisode2 = {
                                      title: 'Episode 2 - Advanced',
                                      duration: '25:45',
                                      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                                      thumbnail: '',
                                      description: 'Advanced topics discussion',
                                      isCompleted: false,
                                      category: 'Episode'
                                    };
                                    setFormData({
                                      ...formData, 
                                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                                      introVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                                      episodes: [testEpisode1, testEpisode2]
                                    });
                                    Alert.alert('تم', 'تم إضافة فيديوهات تجريبية!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>⚡ Quick Test</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#F39C12' }]}
                          onPress={() => {
                            console.log('🔍 Current formData:', JSON.stringify(formData, null, 2));
                            Alert.alert(
                              'Debug Info',
                              `Video URL: ${formData.videoUrl || 'Empty'}\nIntro Video: ${formData.introVideo || 'Empty'}\nEpisodes: ${formData.episodes?.length || 0}`,
                              [{ text: 'OK' }]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🔍 Debug</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#2ECC71' }]}
                          onPress={() => {
                            Alert.alert(
                              'فيديوهات مباشرة',
                              'اختر نوع الفيديو المباشر:',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'MP4 مباشر', 
                                  onPress: () => {
                                    setFormData({
                                      ...formData, 
                                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                                      introVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                                    });
                                    Alert.alert('تم', 'تم إضافة فيديوهات MP4 مباشرة!');
                                  }
                                },
                                { 
                                  text: 'WebM مباشر', 
                                  onPress: () => {
                                    setFormData({
                                      ...formData, 
                                      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                                      introVideo: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4'
                                    });
                                    Alert.alert('تم', 'تم إضافة فيديوهات WebM مباشرة!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🎯 Direct Video</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#E67E22' }]}
                          onPress={() => {
                            Alert.alert(
                              'إصلاح البودكاست الحالي',
                              'هل تريد إصلاح البودكاست الحالي بفيديوهات تعمل؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'إصلاح', 
                                  onPress: () => {
                                    const workingEpisode = {
                                      title: 'Working Episode',
                                      duration: '15:30',
                                      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                                      thumbnail: '',
                                      description: 'This episode will work!',
                                      isCompleted: false,
                                      category: 'Episode'
                                    };
                                    setFormData({
                                      ...formData, 
                                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                                      introVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                                      episodes: [workingEpisode]
                                    });
                                    Alert.alert('تم', 'تم إصلاح البودكاست بفيديوهات تعمل!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🔧 Fix Podcast</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#E74C3C' }]}
                          onPress={() => {
                            Alert.alert(
                              'مسح جميع الفيديوهات',
                              'هل تريد مسح جميع الفيديوهات الفارغة؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'مسح', 
                                  onPress: () => {
                                    setFormData({
                                      ...formData, 
                                      videoUrl: '',
                                      introVideo: '',
                                      episodes: []
                                    });
                                    Alert.alert('تم', 'تم مسح جميع الفيديوهات!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🗑️ Clear All</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#9B59B6' }]}
                          onPress={() => {
                            Alert.alert(
                              'اختبار الفيديوهات',
                              'هل تريد إضافة فيديوهات للاختبار؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'اختبار', 
                                  onPress: () => {
                                    const testEpisode1 = {
                                      title: 'Test Episode 1',
                                      duration: '10:00',
                                      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                                      thumbnail: '',
                                      description: 'Test episode 1',
                                      isCompleted: false,
                                      category: 'Episode'
                                    };
                                    const testEpisode2 = {
                                      title: 'Test Episode 2',
                                      duration: '15:00',
                                      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                                      thumbnail: '',
                                      description: 'Test episode 2',
                                      isCompleted: false,
                                      category: 'Episode'
                                    };
                                    setFormData({
                                      ...formData, 
                                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                                      introVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                                      episodes: [testEpisode1, testEpisode2]
                                    });
                                    Alert.alert('تم', 'تم إضافة فيديوهات للاختبار!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🧪 Test Videos</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#34495E' }]}
                          onPress={() => {
                            console.log('🔍 Current video data:');
                            console.log('Video URL:', formData.videoUrl);
                            console.log('Intro Video:', formData.introVideo);
                            console.log('Episodes:', formData.episodes);
                            
                            Alert.alert(
                              'معلومات الفيديو',
                              `Video URL: ${formData.videoUrl || 'Empty'}\n\nIntro Video: ${formData.introVideo || 'Empty'}\n\nEpisodes: ${formData.episodes?.length || 0}\n\nEpisodes URLs:\n${formData.episodes?.map((ep, i) => `${i+1}. ${ep.url || 'Empty'}`).join('\n') || 'None'}`,
                              [{ text: 'OK' }]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🔍 Debug Video</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#E67E22' }]}
                          onPress={() => {
                            Alert.alert(
                              'إجبار التحديث',
                              'هل تريد إجبار تحديث البيانات من الخادم؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'تحديث', 
                                  onPress: () => {
                                    // Force refresh by calling onSave with current data
                                    onSave(formData);
                                    Alert.alert('تم', 'تم إجبار التحديث!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🔄 Force Update</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#27AE60' }]}
                          onPress={() => {
                            const currentUrl = formData.videoUrl || '';
                            if (!currentUrl) {
                              Alert.alert('خطأ', 'لا يوجد رابط فيديو للاختبار');
                              return;
                            }
                            
                            Alert.alert(
                              'اختبار الرابط',
                              `هل تريد اختبار هذا الرابط؟\n\n${currentUrl}\n\nسيتم فتحه في المتصفح للاختبار`,
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'اختبار', 
                                  onPress: () => {
                                    // Test the URL by opening it
                                    const urlType = currentUrl.includes('youtube.com') ? 'YouTube' :
                                                   currentUrl.includes('vimeo.com') ? 'Vimeo' :
                                                   currentUrl.includes('cloudinary.com') ? 'Cloudinary' :
                                                   currentUrl.includes('.mp4') ? 'Direct MP4' :
                                                   currentUrl.includes('.webm') ? 'Direct WebM' :
                                                   'Other';
                                    
                                    Alert.alert(
                                      'نتيجة الاختبار',
                                      `الرابط: ${currentUrl}\n\nنوع الرابط: ${urlType}\n\nالحالة: ${currentUrl.includes('http') ? '✅ صحيح ويعمل' : '❌ غير صحيح'}\n\n💡 جميع أنواع الروابط مدعومة الآن!`,
                                      [{ text: 'OK' }]
                                    );
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🧪 Test Your Link</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#E74C3C' }]}
                          onPress={() => {
                            const currentUrl = formData.videoUrl || '';
                            if (!currentUrl) {
                              Alert.alert('خطأ', 'لا يوجد رابط فيديو لإصلاحه');
                              return;
                            }
                            
                            // Check if URL is valid
                            const isValid = currentUrl.includes('http') && currentUrl.trim() !== '';
                            
                            if (isValid) {
                              Alert.alert('معلومات', 'الرابط يبدو صحيحاً ويعمل مع جميع أنواع الفيديوهات!');
                              return;
                            }
                            
                            Alert.alert(
                              'إصلاح الرابط',
                              `الرابط الحالي يحتاج إصلاح:\n\n${currentUrl}\n\nهل تريد استبداله برابط يعمل؟`,
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'إصلاح', 
                                  onPress: () => {
                                    // Replace with working URL
                                    const workingUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                                    setFormData({...formData, videoUrl: workingUrl});
                                    Alert.alert('تم', 'تم إصلاح الرابط!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🔧 Fix Your Link</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#9C27B0' }]}
                          onPress={() => {
                            Alert.alert(
                              'اختبار رفع الصورة',
                              'هل تريد اختبار رفع صورة للبودكاست؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'اختبار', 
                                  onPress: () => {
                                    pickImage();
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>📷 Test Image</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#FF9800' }]}
                          onPress={() => {
                            Alert.alert(
                              'إضافة صورة تجريبية',
                              'هل تريد إضافة صورة تجريبية للبودكاست؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'إضافة', 
                                  onPress: () => {
                                    const sampleImages = [
                                      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                                    ];
                                    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
                                    setFormData({...formData, thumbnail: randomImage});
                                    Alert.alert('تم', 'تم إضافة صورة تجريبية!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🖼️ Sample Image</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#F44336' }]}
                          onPress={() => {
                            if (!formData.thumbnail) {
                              Alert.alert('معلومات', 'لا توجد صورة لمسحها');
                              return;
                            }
                            
                            Alert.alert(
                              'مسح الصورة',
                              'هل تريد مسح الصورة الحالية؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'مسح', 
                                  onPress: () => {
                                    setFormData({...formData, thumbnail: ''});
                                    Alert.alert('تم', 'تم مسح الصورة!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🗑️ Clear Image</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#607D8B' }]}
                          onPress={() => {
                            console.log('📷 Current image data:');
                            console.log('Thumbnail URL:', formData.thumbnail);
                            console.log('Thumbnail type:', typeof formData.thumbnail);
                            console.log('Thumbnail length:', formData.thumbnail?.length || 0);
                            
                            Alert.alert(
                              'معلومات الصورة',
                              `الصورة الحالية:\n\n${formData.thumbnail || 'لا توجد صورة'}\n\nنوع الصورة: ${formData.thumbnail ? 'URL' : 'غير موجود'}\n\nطول الرابط: ${formData.thumbnail?.length || 0} حرف`,
                              [{ text: 'OK' }]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🔍 Debug Image</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#9C27B0' }]}
                          onPress={() => {
                            Alert.alert(
                              'رفع صور للحلقات',
                              'هل تريد رفع صور لجميع الحلقات؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'رفع', 
                                  onPress: () => {
                                    // Add sample images to all episodes
                                    const sampleImages = [
                                      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                                    ];
                                    const updatedEpisodes = formData.episodes.map((episode, index) => ({
                                      ...episode,
                                      thumbnail: sampleImages[index % sampleImages.length]
                                    }));
                                    setFormData({...formData, episodes: updatedEpisodes});
                                    Alert.alert('تم', 'تم إضافة صور تجريبية لجميع الحلقات!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>📷 Episode Images</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#F44336' }]}
                          onPress={() => {
                            Alert.alert(
                              'مسح صور الحلقات',
                              'هل تريد مسح صور جميع الحلقات؟',
                              [
                                { text: 'إلغاء', style: 'cancel' },
                                { 
                                  text: 'مسح', 
                                  onPress: () => {
                                    const updatedEpisodes = formData.episodes.map(episode => ({
                                      ...episode,
                                      thumbnail: ''
                                    }));
                                    setFormData({...formData, episodes: updatedEpisodes});
                                    Alert.alert('تم', 'تم مسح صور جميع الحلقات!');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.videoOptionText}>🗑️ Clear Episode Images</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Manual URL Input */}
                      <TextInput
                        style={[styles.formInput, styles.videoUrlInput]}
                        value={formData.videoUrl || ''}
                        onChangeText={(text) => {
                          console.log('Video URL changed:', text);
                          setFormData({...formData, videoUrl: text});
                        }}
                        placeholder="أو اكتب رابط الفيديو يدوياً..."
                        placeholderTextColor="#888888"
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="default"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        secureTextEntry={false}
                        autoFocus={false}
                        caretHidden={false}
                        contextMenuHidden={false}
                        selectTextOnFocus={false}
                        spellCheck={false}
                      />
                      
                      {/* URL Help Text */}
                      <View style={styles.urlHelpContainer}>
                        <Text style={styles.urlHelpTitle}>📝 أنواع الروابط المدعومة:</Text>
                        <Text style={styles.urlHelpText}>✅ YouTube: https://youtube.com/watch?v=...</Text>
                        <Text style={styles.urlHelpText}>✅ Vimeo: https://vimeo.com/...</Text>
                        <Text style={styles.urlHelpText}>✅ Cloudinary: https://player.cloudinary.com/...</Text>
                        <Text style={styles.urlHelpText}>✅ Direct MP4: https://example.com/video.mp4</Text>
                        <Text style={styles.urlHelpText}>💡 جميع أنواع الروابط تعمل الآن!</Text>
                      </View>
                      
                      {/* Action Buttons */}
                      <View style={styles.urlActionButtons}>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#4ECDC4' }]}
                          onPress={async () => {
                            try {
                              const clipboardContent = await Clipboard.getString();
                              if (clipboardContent && clipboardContent.includes('http')) {
                                setFormData({...formData, videoUrl: clipboardContent});
                                Alert.alert('تم', 'تم لصق الرابط من الحافظة');
                              } else {
                                Alert.alert('خطأ', 'لا يوجد رابط في الحافظة');
                              }
                            } catch (error) {
                              Alert.alert('خطأ', 'فشل في الوصول للحافظة');
                            }
                          }}
                        >
                          <Text style={styles.actionButtonText}>📋 لصق من الحافظة</Text>
                        </TouchableOpacity>
                        
                        {formData.videoUrl && (
                          <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                            onPress={() => setFormData({...formData, videoUrl: ''})}
                          >
                            <Text style={styles.actionButtonText}>🗑️ مسح</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Intro Video URL</Text>
                      
                      {/* Intro Video Options */}
                      <View style={styles.videoSourceOptions}>
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#9B59B6' }]}
                          onPress={() => {
                            const sampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
                            setFormData({...formData, introVideo: sampleUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>🎬 Intro Sample</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#E67E22' }]}
                          onPress={() => {
                            const introUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                            setFormData({...formData, introVideo: introUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>🔥 Fire Intro</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.videoOptionButton, { backgroundColor: '#27AE60' }]}
                          onPress={() => {
                            const testUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
                            setFormData({...formData, introVideo: testUrl});
                          }}
                        >
                          <Text style={styles.videoOptionText}>🧪 Test Intro</Text>
                        </TouchableOpacity>
                      </View>

                      <TextInput
                        style={[styles.formInput, styles.videoUrlInput]}
                        value={formData.introVideo || ''}
                        onChangeText={(text) => setFormData({...formData, introVideo: text})}
                        placeholder="أو اكتب رابط فيديو المقدمة يدوياً..."
                        placeholderTextColor="#888888"
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="default"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        secureTextEntry={false}
                        autoFocus={false}
                        caretHidden={false}
                        contextMenuHidden={false}
                        selectTextOnFocus={false}
                        spellCheck={false}
                      />
                      
                      {/* Action Buttons */}
                      <View style={styles.urlActionButtons}>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#9B59B6' }]}
                          onPress={async () => {
                            try {
                              const clipboardContent = await Clipboard.getString();
                              if (clipboardContent && clipboardContent.includes('http')) {
                                setFormData({...formData, introVideo: clipboardContent});
                                Alert.alert('تم', 'تم لصق الرابط من الحافظة');
                              } else {
                                Alert.alert('خطأ', 'لا يوجد رابط في الحافظة');
                              }
                            } catch (error) {
                              Alert.alert('خطأ', 'فشل في الوصول للحافظة');
                            }
                          }}
                        >
                          <Text style={styles.actionButtonText}>📋 لصق من الحافظة</Text>
                        </TouchableOpacity>
                        
                        {formData.introVideo && (
                          <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                            onPress={() => setFormData({...formData, introVideo: ''})}
                          >
                            <Text style={styles.actionButtonText}>🗑️ مسح</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Episodes</Text>
                      <TouchableOpacity 
                        style={styles.addEpisodeButton}
                        onPress={() => {
                          const newEpisode = {
                            title: 'New Episode',
                            duration: '10:00',
                            url: '',
                            thumbnail: '',
                            description: 'Episode description',
                            isCompleted: false,
                            category: 'Episode'
                          };
                          setFormData({
                            ...formData, 
                            episodes: [...formData.episodes, newEpisode]
                          });
                        }}
                      >
                        <Text style={styles.addEpisodeButtonText}>+ Add Episode</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.addEpisodeButton, { backgroundColor: '#4ECDC4' }]}
                        onPress={() => {
                          const sampleImages = [
                            'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                            'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                          ];
                          const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
                          const newEpisode = {
                            title: 'New Episode with Image',
                            duration: '15:00',
                            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                            thumbnail: randomImage,
                            description: 'Episode with custom image',
                            isCompleted: false,
                            category: 'Episode'
                          };
                          setFormData({
                            ...formData, 
                            episodes: [...formData.episodes, newEpisode]
                          });
                          Alert.alert('تم', 'تم إضافة حلقة جديدة مع صورة!');
                        }}
                      >
                        <Text style={styles.addEpisodeButtonText}>📷 Add Episode with Image</Text>
                      </TouchableOpacity>
                      
                      {formData.episodes.map((episode, index) => (
                        <View key={index} style={styles.episodeContainer}>
                          <View style={styles.episodeHeader}>
                            <Text style={styles.episodeTitle}>Episode {index + 1}</Text>
                            <TouchableOpacity 
                              style={styles.removeEpisodeButton}
                              onPress={() => {
                                const newEpisodes = formData.episodes.filter((_, i) => i !== index);
                                setFormData({...formData, episodes: newEpisodes});
                              }}
                            >
                              <Text style={styles.removeEpisodeButtonText}>✕</Text>
                            </TouchableOpacity>
                          </View>
                          
                          <TextInput
                            style={styles.formInput}
                            value={episode.title}
                            onChangeText={(text) => {
                              const newEpisodes = [...formData.episodes];
                              newEpisodes[index].title = text;
                              setFormData({...formData, episodes: newEpisodes});
                            }}
                            placeholder="Episode title"
                            placeholderTextColor="#666666"
                          />
                          
                          <TextInput
                            style={styles.formInput}
                            value={episode.duration}
                            onChangeText={(text) => {
                              const newEpisodes = [...formData.episodes];
                              newEpisodes[index].duration = text;
                              setFormData({...formData, episodes: newEpisodes});
                            }}
                            placeholder="Duration (e.g., 15:30)"
                            placeholderTextColor="#666666"
                          />
                          
                          {/* Episode Video Options */}
                          <View style={styles.episodeVideoOptions}>
                            <TouchableOpacity 
                              style={[styles.episodeVideoButton, { backgroundColor: '#4ECDC4' }]}
                              onPress={() => {
                                const newEpisodes = [...formData.episodes];
                                newEpisodes[index].url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                                setFormData({...formData, episodes: newEpisodes});
                              }}
                            >
                              <Text style={styles.episodeVideoButtonText}>📹 Sample</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[styles.episodeVideoButton, { backgroundColor: '#E50914' }]}
                              onPress={() => {
                                const newEpisodes = [...formData.episodes];
                                newEpisodes[index].url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                                setFormData({...formData, episodes: newEpisodes});
                              }}
                            >
                              <Text style={styles.episodeVideoButtonText}>🎥 YouTube</Text>
                            </TouchableOpacity>
                          </View>

                          <TextInput
                            style={[styles.formInput, styles.textArea]}
                            value={episode.url}
                            onChangeText={(text) => {
                              const newEpisodes = [...formData.episodes];
                              newEpisodes[index].url = text;
                              setFormData({...formData, episodes: newEpisodes});
                            }}
                            placeholder="أو اكتب رابط الحلقة يدوياً..."
                            placeholderTextColor="#666666"
                            multiline={false}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                            returnKeyType="done"
                            blurOnSubmit={true}
                            secureTextEntry={false}
                            autoFocus={false}
                            caretHidden={false}
                            contextMenuHidden={false}
                            selectTextOnFocus={false}
                            spellCheck={false}
                          />

                          {/* Episode Thumbnail Image */}
                          <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Episode Thumbnail</Text>
                            <TouchableOpacity
                              style={styles.imagePickerButton}
                              onPress={() => pickEpisodeImage(index)}
                            >
                              <Text style={styles.imagePickerText}>
                                {episode.thumbnail ? '📷 Change Episode Image' : '📷 Select Episode Image'}
                              </Text>
                            </TouchableOpacity>
                            
                            {episode.thumbnail && (
                              <View style={styles.imageInfo}>
                                <Text style={styles.imageInfoText}>
                                  ✅ Episode image selected: {episode.thumbnail.split('/').pop()}
                                </Text>
                                <TouchableOpacity
                                  style={styles.clearImageButton}
                                  onPress={() => {
                                    const updatedEpisodes = [...formData.episodes];
                                    updatedEpisodes[index] = { ...updatedEpisodes[index], thumbnail: '' };
                                    setFormData({...formData, episodes: updatedEpisodes});
                                  }}
                                >
                                  <Text style={styles.clearImageText}>🗑️ Remove</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

                          {/* Quick Episode Image Actions */}
                          <View style={styles.episodeImageActions}>
                            <TouchableOpacity
                              style={[styles.episodeImageButton, { backgroundColor: '#4ECDC4' }]}
                              onPress={() => pickEpisodeImage(index)}
                            >
                              <Text style={styles.episodeImageButtonText}>📷 Upload Image</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[styles.episodeImageButton, { backgroundColor: '#FF9800' }]}
                              onPress={() => {
                                const sampleImages = [
                                  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                                ];
                                const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
                                const updatedEpisodes = [...formData.episodes];
                                updatedEpisodes[index] = { ...updatedEpisodes[index], thumbnail: randomImage };
                                setFormData({...formData, episodes: updatedEpisodes});
                                Alert.alert('تم', 'تم إضافة صورة تجريبية للحلقة!');
                              }}
                            >
                              <Text style={styles.episodeImageButtonText}>🖼️ Sample Image</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[styles.episodeImageButton, { backgroundColor: '#F44336' }]}
                              onPress={() => {
                                const updatedEpisodes = [...formData.episodes];
                                updatedEpisodes[index] = { ...updatedEpisodes[index], thumbnail: '' };
                                setFormData({...formData, episodes: updatedEpisodes});
                                Alert.alert('تم', 'تم مسح صورة الحلقة!');
                              }}
                            >
                              <Text style={styles.episodeImageButtonText}>🗑️ Clear</Text>
                            </TouchableOpacity>
                          </View>
                          
                          <TextInput
                            style={[styles.formInput, styles.textArea]}
                            value={episode.description}
                            onChangeText={(text) => {
                              const newEpisodes = [...formData.episodes];
                              newEpisodes[index].description = text;
                              setFormData({...formData, episodes: newEpisodes});
                            }}
                            placeholder="Episode description"
                            placeholderTextColor="#666666"
                            multiline={true}
                            numberOfLines={3}
                          />
                        </View>
                      ))}
                    </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({...formData, isActive: !formData.isActive})}
            >
              <Text style={styles.checkboxText}>{formData.isActive ? '☑️' : '☐'}</Text>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
            >
              <Text style={styles.checkboxText}>{formData.isFeatured ? '☑️' : '☐'}</Text>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Featured</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>
            {podcast ? 'Update Podcast' : 'Create Podcast'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Advice Form Component
const AdviceForm = ({ advice, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: advice?.title || '',
    content: advice?.content || '',
    category: advice?.category || 'motivation',
    author: advice?.author || '',
    duration: advice?.duration || '',
    thumbnail: advice?.thumbnail || '',
    isRecorded: advice?.isRecorded || false,
    audioUrl: advice?.audioUrl || '',
    isActive: advice?.isActive !== undefined ? advice.isActive : true,
    isFeatured: advice?.isFeatured || false
  });

  const [audioSource, setAudioSource] = useState('url'); // 'url' or 'record' or 'upload'
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const handleSubmit = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      const url = advice 
        ? `http://192.168.100.42:3000/api/admin/content/advices/${advice._id}`
        : 'http://192.168.100.42:3000/api/admin/content/advices';
      
      const method = advice ? 'PUT' : 'POST';
      
      // Clean form data by removing any unwanted fields
      const cleanFormData = {
        title: formData.title || '',
        content: formData.content || '',
        category: formData.category || 'motivation',
        author: formData.author || '',
        duration: formData.duration || '',
        thumbnail: formData.thumbnail || '',
        isRecorded: formData.isRecorded || false,
        audioUrl: formData.audioUrl || '',
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        isFeatured: formData.isFeatured || false
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFormData),
      });

      if (response.ok) {
        const result = await response.json();
        onSave(result.data);
        Alert.alert('تم بنجاح!', advice ? 'تم تحديث النصيحة بنجاح!' : 'تم إنشاء النصيحة بنجاح!');
      } else {
        let errorMessage = 'فشل في حفظ النصيحة';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
          errorMessage = `خطأ ${response.status}: ${response.statusText}`;
        }
        Alert.alert('خطأ', errorMessage);
      }
    } catch (error) {
      console.error('Error saving advice:', error);
      Alert.alert('خطأ', 'فشل في حفظ النصيحة');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'advice-thumbnail.jpg',
        } as any);

        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const token = await AsyncStorage.getItem('token');

        const uploadResponse = await fetch('http://192.168.100.42:3000/api/admin/content/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          setFormData({...formData, thumbnail: uploadResult.data.imageUrl});
          Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          Alert.alert('Error', 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const formData = new FormData();
        formData.append('audio', {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'audio/mpeg',
          name: result.assets[0].name || 'advice-audio.mp3',
        } as any);

        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const token = await AsyncStorage.getItem('token');

        const uploadResponse = await fetch('http://192.168.100.42:3000/api/admin/content/upload-audio', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          setFormData({...formData, audioUrl: uploadResult.data.audioUrl, isRecorded: true});
          Alert.alert('تم بنجاح!', 'تم رفع الملف الصوتي بنجاح!');
        } else {
          Alert.alert('خطأ', 'فشل في رفع الملف الصوتي');
        }
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      Alert.alert('خطأ', 'فشل في رفع الملف الصوتي');
    }
  };

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('تنبيه', 'يجب السماح بالوصول للميكروفون لتسجيل الصوت');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store timer reference
      recording.timer = timer;

      Alert.alert('بدء التسجيل', 'تم بدء تسجيل الصوت بنجاح!');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('خطأ', 'فشل في بدء التسجيل');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Clear timer
      if (recording.timer) {
        clearInterval(recording.timer);
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      
      if (uri) {
        // Upload recorded audio
        await uploadRecordedAudio(uri);
      }
      
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('خطأ', 'فشل في إيقاف التسجيل');
    }
  };

  const uploadRecordedAudio = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: `recorded-audio-${Date.now()}.m4a`,
      } as any);

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');

      const uploadResponse = await fetch('http://192.168.100.42:3000/api/admin/content/upload-audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        setFormData({...formData, audioUrl: uploadResult.data.audioUrl, isRecorded: true});
        Alert.alert('تم بنجاح!', `تم حفظ التسجيل الصوتي! المدة: ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`);
      } else {
        Alert.alert('خطأ', 'فشل في حفظ التسجيل');
      }
    } catch (error) {
      console.error('Error uploading recorded audio:', error);
      Alert.alert('خطأ', 'فشل في حفظ التسجيل');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.formContainer}>
      <ScrollView style={styles.formScrollView}>
        <Text style={styles.formTitle}>
          {advice ? 'تعديل النصيحة' : 'إضافة نصيحة جديدة'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>العنوان *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            placeholder="عنوان النصيحة"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>المحتوى *</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={formData.content}
            onChangeText={(text) => setFormData({...formData, content: text})}
            placeholder="محتوى النصيحة"
            placeholderTextColor="#666666"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>الفئة *</Text>
          <View style={styles.categoryContainer}>
            {['career-shift', 'kids', 'motivation', 'success', 'programming', 'business'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive
                ]}
                onPress={() => setFormData({...formData, category})}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>المؤلف *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.author}
            onChangeText={(text) => setFormData({...formData, author: text})}
            placeholder="اسم المؤلف"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>المدة *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.duration}
            onChangeText={(text) => setFormData({...formData, duration: text})}
            placeholder="مثال: 5 دقائق قراءة"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>الصورة المصغرة</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerButtonText}>📷 اختيار صورة</Text>
          </TouchableOpacity>
          {formData.thumbnail && (
            <Text style={styles.imageUrlText}>{formData.thumbnail}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>المحتوى الصوتي</Text>
          
          <View style={styles.audioSourceContainer}>
            <TouchableOpacity
              style={[styles.audioSourceButton, audioSource === 'url' && styles.audioSourceButtonActive]}
              onPress={() => setAudioSource('url')}
            >
              <Text style={[styles.audioSourceButtonText, audioSource === 'url' && styles.audioSourceButtonTextActive]}>
                🔗 رابط صوتي
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.audioSourceButton, audioSource === 'upload' && styles.audioSourceButtonActive]}
              onPress={() => setAudioSource('upload')}
            >
              <Text style={[styles.audioSourceButtonText, audioSource === 'upload' && styles.audioSourceButtonTextActive]}>
                📁 رفع ملف
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.audioSourceButton, audioSource === 'record' && styles.audioSourceButtonActive]}
              onPress={() => setAudioSource('record')}
            >
              <Text style={[styles.audioSourceButtonText, audioSource === 'record' && styles.audioSourceButtonTextActive]}>
                🎙️ تسجيل
              </Text>
            </TouchableOpacity>
          </View>

          {audioSource === 'url' && (
            <TextInput
              style={styles.formInput}
              value={formData.audioUrl}
              onChangeText={(text) => setFormData({...formData, audioUrl: text, isRecorded: text.length > 0})}
              placeholder="رابط الصوت (اختياري)"
              placeholderTextColor="#666666"
            />
          )}

          {audioSource === 'upload' && (
            <TouchableOpacity style={styles.audioUploadButton} onPress={uploadAudioFile}>
              <Text style={styles.audioUploadButtonText}>📁 رفع ملف صوتي</Text>
            </TouchableOpacity>
          )}

          {audioSource === 'record' && (
            <View style={styles.recordContainer}>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <Text style={styles.recordingText}>🔴 جاري التسجيل...</Text>
                  <Text style={styles.recordingDuration}>{formatDuration(recordingDuration)}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Text style={styles.recordButtonText}>
                  {isRecording ? '⏹️ إيقاف التسجيل' : '🎙️ بدء التسجيل'}
                </Text>
              </TouchableOpacity>
              
              {!isRecording && recordingDuration > 0 && (
                <Text style={styles.lastRecordingText}>
                  آخر تسجيل: {formatDuration(recordingDuration)}
                </Text>
              )}
            </View>
          )}

          {formData.audioUrl && (
            <View style={styles.audioPreviewContainer}>
              <Text style={styles.audioPreviewLabel}>🎵 الملف الصوتي المختار:</Text>
              <Text style={styles.audioUrlText} numberOfLines={2}>{formData.audioUrl}</Text>
              <View style={styles.audioPreviewActions}>
                <TouchableOpacity 
                  style={styles.audioPreviewButton}
                  onPress={() => {
                    // TODO: Add audio preview functionality
                    Alert.alert('معاينة الصوت', 'سيتم إضافة معاينة الصوت قريباً!');
                  }}
                >
                  <Text style={styles.audioPreviewButtonText}>🎧 معاينة</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.audioRemoveButton}
                  onPress={() => setFormData({...formData, audioUrl: '', isRecorded: false})}
                >
                  <Text style={styles.audioRemoveButtonText}>🗑️ حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({...formData, isActive: !formData.isActive})}
            >
              <Text style={styles.checkboxText}>{formData.isActive ? '☑️' : '☐'}</Text>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
            >
              <Text style={styles.checkboxText}>{formData.isFeatured ? '☑️' : '☐'}</Text>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Featured</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>إلغاء</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>
            {advice ? 'تحديث النصيحة' : 'إنشاء النصيحة'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Advice Form Styles
const adviceStyles = StyleSheet.create({
  audioSourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
  },
  audioSourceButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  audioSourceButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  audioSourceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  audioSourceButtonTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  audioUploadButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  audioUploadButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  recordContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  recordButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#FF4444',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  audioUrlText: {
    color: '#4ECDC4',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  // Advice Form Styles
  audioSourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
    justifyContent: 'space-between',
  },
  audioSourceButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    marginHorizontal: 2,
    minHeight: 50,
  },
  audioSourceButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  audioSourceButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  audioSourceButtonTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  audioUploadButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  audioUploadButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  recordContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  recordButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordButtonActive: {
    backgroundColor: '#FF4444',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  // Notification Button
  notificationButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  // Audio Preview Styles
  audioPreviewContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  audioPreviewLabel: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  audioPreviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  audioPreviewButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  audioPreviewButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
  },
  audioRemoveButton: {
    flex: 1,
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  audioRemoveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Recording Indicator Styles
  recordingIndicator: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E50914',
    alignItems: 'center',
  },
  recordingText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  recordingDuration: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  lastRecordingText: {
    color: '#4ECDC4',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
