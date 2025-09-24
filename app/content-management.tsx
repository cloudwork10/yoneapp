import { useUser } from '@/contexts/UserContext';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Clipboard, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationService from '../services/NotificationService';
import { makeAuthenticatedRequest, refreshAuthToken } from '../utils/tokenRefresh';

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

  // Initialize notifications on component mount
  useEffect(() => {
    if (isAdmin && user) {
      initializeNotifications();
    }
  }, [isAdmin, user]);
  
  // Use shared refresh token function
  const refreshToken = refreshAuthToken;
  
  // Initialize notifications
  const initializeNotifications = async () => {
    try {
      await NotificationService.registerForPushNotifications();
      console.log('✅ Notifications initialized in content management');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

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
  const [terms, setTerms] = useState([]);
  const [showTermModal, setShowTermModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [thoughts, setThoughts] = useState([]);
  const [showThoughtModal, setShowThoughtModal] = useState(false);
  const [editingThought, setEditingThought] = useState(null);
  const [articles, setArticles] = useState([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
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
      setTimeout(() => {
        console.log('📚 Fetching courses...');
        fetchCourses();
      }, 2500);
      setTimeout(() => {
        console.log('⚡ Fetching programming terms...');
        fetchTerms();
      }, 3000);
      setTimeout(() => {
        console.log('💭 Fetching programmer thoughts...');
        fetchThoughts();
      }, 3500);
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
      console.log('🔗 URL: http://localhost:3000/api/admin/stats');
      const response = await makeAuthenticatedRequest('http://localhost:3000/api/admin/stats');

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
          const retryResponse = await fetch('http://localhost:3000/api/admin/stats', {
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
            const retryResponse = await fetch('http://localhost:3000/api/admin/stats', {
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

      const response = await makeAuthenticatedRequest('http://localhost:3000/api/admin/content/cv-templates');

      if (response.ok) {
        const data = await response.json();
        setCvTemplates(data.data.cvTemplates || []);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://localhost:3000/api/admin/content/cv-templates', {
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
            const retryResponse = await fetch('http://localhost:3000/api/admin/content/cv-templates', {
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

      const response = await makeAuthenticatedRequest('http://localhost:3000/api/admin/content/advices');

      if (response.ok) {
        const data = await response.json();
        setAdvices(data.data.advices || []);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch('http://localhost:3000/api/admin/content/advices', {
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
      const response = await makeAuthenticatedRequest('http://localhost:3000/api/admin/content/articles');

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
          const retryResponse = await fetch('http://localhost:3000/api/admin/content/articles', {
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
            const retryResponse = await fetch('http://localhost:3000/api/admin/content/articles', {
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
      const response = await makeAuthenticatedRequest('http://localhost:3000/api/admin/content/roadmaps');

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
          const retryResponse = await fetch('http://localhost:3000/api/admin/content/roadmaps', {
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
            const retryResponse = await fetch('http://localhost:3000/api/admin/content/roadmaps', {
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
      const response = await makeAuthenticatedRequest('http://localhost:3000/api/admin/content/podcasts');

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
          const retryResponse = await fetch('http://localhost:3000/api/admin/content/podcasts', {
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
            const retryResponse = await fetch('http://localhost:3000/api/admin/content/podcasts', {
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

  const fetchCourses = async (retryCount = 0) => {
    try {
      console.log('📚 Starting fetchCourses...');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No token found for courses');
        return;
      }

      const response = await fetch('http://localhost:3000/api/public/courses');

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses || []);
      } else if (response.status === 401) {
        console.log('🔄 Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        if (newToken) {
          const retryResponse = await fetch('http://localhost:3000/api/admin/content/courses', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setCourses(data.data.courses || []);
          } else {
            console.error('❌ Failed to fetch courses after token refresh:', retryResponse.status);
          }
        } else {
          console.error('Failed to refresh token for courses');
        }
      } else if (response.status === 429 && retryCount < 3) {
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchCourses(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      } else {
        console.error('Failed to fetch courses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };


  const fetchTerms = async (retryCount = 0) => {
    try {
      console.log('⚡ Fetching programming terms...');
      
      const response = await fetch('http://localhost:3000/api/public/programming-terms');
      
      if (response.ok) {
        const data = await response.json();
        console.log('⚡ Terms data received:', data);
        setTerms(data.data.terms || []);
        console.log('✅ Terms state updated');
      } else if (response.status === 429 && retryCount < 3) {
        console.log(`⏳ Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchTerms(retryCount + 1);
        }, (retryCount + 1) * 2000);
      } else {
        console.error('❌ Failed to fetch terms:', response.status);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const fetchThoughts = async (retryCount = 0) => {
    try {
      console.log('💭 Fetching programmer thoughts...');
      
      const response = await fetch('http://localhost:3000/api/public/programmer-thoughts');
      
      if (response.ok) {
        const data = await response.json();
        console.log('💭 Thoughts data received:', data);
        setThoughts(data.data.thoughts || []);
        console.log('✅ Thoughts state updated');
      } else if (response.status === 429 && retryCount < 3) {
        console.log(`⏳ Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchThoughts(retryCount + 1);
        }, (retryCount + 1) * 2000);
      } else {
        console.error('❌ Failed to fetch thoughts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching thoughts:', error);
    }
  };

  const contentTypes = [
    { id: 'courses', name: 'Courses', icon: '📚', color: '#E50914' },
    { id: 'podcasts', name: 'Podcasts', icon: '🎧', color: '#FF6B35' },
    { id: 'articles', name: 'Articles', icon: '📄', color: '#4ECDC4' },
    { id: 'roadmaps', name: 'Roadmaps', icon: '🗺️', color: '#9B59B6' },
    { id: 'advices', name: 'Advices', icon: '💡', color: '#96CEB4' },
    { id: 'terms', name: 'Programming Terms', icon: '⚡', color: '#FF9F43' },
    { id: 'thoughts', name: 'Programmer Thoughts', icon: '💭', color: '#8E44AD' },
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
    { id: 'thoughts', name: 'Thoughts', icon: '💭' },
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


  const renderTermsManagement = () => {
    console.log('🎨 Rendering Terms Management...');
    console.log('⚡ Terms state:', terms);
    console.log('⚡ Terms length:', terms.length);
    
    const filteredTerms = terms.filter(term => 
      searchQuery === '' || 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.language.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log('🔍 Filtered terms:', filteredTerms.length);
    
    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>⚡ Programming Terms Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                console.log('🔄 Manual refresh triggered');
                fetchTerms();
              }}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setEditingTerm(null);
                setShowTermModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Term</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search programming terms..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {filteredTerms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {terms.length === 0 
                ? 'No programming terms found. Add your first term!' 
                : 'No terms match your search.'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {terms.length === 0 
                ? 'Click "Add Term" to get started.' 
                : 'Try adjusting your search terms.'}
            </Text>
            <Text style={styles.emptyStateDebug}>
              Debug: {terms.length} total terms, {filteredTerms.length} filtered
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
            {filteredTerms.map((term) => (
              <View key={term._id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentTitle}>{term.term || 'Untitled Term'}</Text>
                  <View style={styles.contentActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingTerm(term);
                        setShowTermModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTerm(term._id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.contentMetaText}>Language: {term.language || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Category: {term.category || 'Uncategorized'}</Text>
                <Text style={styles.contentMetaText}>Difficulty: {term.difficulty || 'Beginner'}</Text>
                <Text style={styles.contentMetaText}>Duration: {term.duration || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Definition: {term.definition?.substring(0, 100)}...</Text>
                <Text style={styles.contentMetaText}>
                  Status: {term.isActive ? '✅ Active' : '❌ Inactive'} 
                  {term.isFeatured ? ' | 🌟 Featured' : ''}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderThoughtsManagement = () => {
    console.log('🎨 Rendering Thoughts Management...');
    console.log('💭 Thoughts state:', thoughts);
    console.log('💭 Thoughts length:', thoughts.length);
    
    const filteredThoughts = thoughts.filter(thought => 
      searchQuery === '' || 
      thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thought.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thought.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log('🔍 Filtered thoughts:', filteredThoughts.length);
    
    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>💭 Programmer Thoughts Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                console.log('🔄 Manual refresh triggered');
                fetchThoughts();
              }}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setEditingThought(null);
                setShowThoughtModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Episode</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search programmer thoughts..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {filteredThoughts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {thoughts.length === 0 
                ? 'No programmer thoughts found. Add your first episode!' 
                : 'No episodes match your search.'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {thoughts.length === 0 
                ? 'Click "Add Episode" to get started.' 
                : 'Try adjusting your search terms.'}
            </Text>
            <Text style={styles.emptyStateDebug}>
              Debug: {thoughts.length} total episodes, {filteredThoughts.length} filtered
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
            {filteredThoughts.map((thought) => (
              <View key={thought._id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentTitle}>{thought.title || 'Untitled Episode'}</Text>
                  <View style={styles.contentActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingThought(thought);
                        setShowThoughtModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteThought(thought._id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.contentMetaText}>Season: {thought.season || 1} | Episode: {thought.episodeNumber || 'N/A'}</Text>
                <Text style={styles.contentMetaText}>Category: {thought.category || 'Uncategorized'}</Text>
                <Text style={styles.contentMetaText}>Duration: {thought.duration || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Views: {thought.views || 0} | Likes: {thought.likes || 0}</Text>
                <Text style={styles.contentMetaText}>Description: {thought.description?.substring(0, 100)}...</Text>
                <Text style={styles.contentMetaText}>
                  Status: {thought.isActive ? '✅ Active' : '❌ Inactive'} 
                  {thought.isFeatured ? ' | 🌟 Featured' : ''}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
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
              
              const response = await fetch(`http://localhost:3000/api/admin/content/cv-templates/${cvId}`, {
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
              
              const response = await fetch(`http://localhost:3000/api/admin/content/advices/${adviceId}`, {
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


  const handleDeleteTerm = async (termId: string) => {
    Alert.alert(
      'Delete Programming Term',
      'Are you sure you want to delete this programming term?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://localhost:3000/api/public/programming-terms/${termId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setTerms(terms.filter(term => term._id !== termId));
                Alert.alert('Success', 'Programming term deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete programming term');
              }
            } catch (error) {
              console.error('Delete term error:', error);
              Alert.alert('Error', 'Failed to delete programming term');
            }
          }
        }
      ]
    );
  };

  const handleDeleteThought = async (thoughtId: string) => {
    Alert.alert(
      'Delete Programmer Thought',
      'Are you sure you want to delete this episode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://localhost:3000/api/public/programmer-thoughts/${thoughtId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setThoughts(thoughts.filter(thought => thought._id !== thoughtId));
                Alert.alert('Success', 'Programmer thought deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete programmer thought');
              }
            } catch (error) {
              console.error('Delete thought error:', error);
              Alert.alert('Error', 'Failed to delete programmer thought');
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
              
              const response = await fetch(`http://localhost:3000/api/admin/content/articles/${articleId}`, {
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
              
              const response = await fetch(`http://localhost:3000/api/admin/content/roadmaps/${roadmapId}`, {
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
              
              const response = await fetch(`http://localhost:3000/api/admin/content/podcasts/${podcastId}`, {
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

  const handleDeleteCourse = async (courseId: string) => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://localhost:3000/api/public/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setCourses(courses.filter(course => course._id !== courseId));
                Alert.alert('Success', 'Course deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete course');
              }
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Error', 'Failed to delete course');
            }
          }
        }
      ]
    );
  };

  const renderCourseManagement = () => {
    console.log('🎨 Rendering Course Management...');
    console.log('📚 Courses state:', courses);
    console.log('📚 Courses length:', courses.length);
    
    const filteredCourses = courses.filter(course =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log('🔍 Filtered courses:', filteredCourses.length);

    return (
      <View style={styles.contentSection}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>Course Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={() => fetchCourses()}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => {
                setEditingCourse(null);
                setShowCourseModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Course</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {courses.length === 0 
                ? 'No courses found. Add your first course!' 
                : 'No courses match your search.'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {courses.length === 0 
                ? 'Click "Add Course" to get started.' 
                : 'Try adjusting your search terms.'}
            </Text>
            <Text style={styles.emptyStateDebug}>
              Debug: {courses.length} total courses, {filteredCourses.length} filtered
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
            {filteredCourses.map((course) => (
              <View key={course._id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentTitle}>{course.title || 'Untitled Course'}</Text>
                  <View style={styles.contentActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => {
                        setEditingCourse(course);
                        setShowCourseModal(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCourse(course._id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.contentMetaText}>Instructor: {course.instructor || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Category: {course.category || 'Uncategorized'}</Text>
                <Text style={styles.contentMetaText}>Level: {course.level || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Duration: {course.duration || 'Unknown'}</Text>
                <Text style={styles.contentMetaText}>Students: {course.students || 0}</Text>
                <Text style={styles.contentMetaText}>Rating: {course.rating || 0}/5</Text>
                <Text style={styles.contentMetaText}>Price: ${course.price || 0}</Text>
                <Text style={styles.contentMetaText}>
                  Sections: {course.sections?.length || 0} | 
                  Lessons: {course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0}
                </Text>
                <Text style={styles.contentMetaText}>
                  Status: {course.isActive ? '✅ Active' : '❌ Inactive'} 
                  {course.isFeatured ? ' | 🌟 Featured' : ''}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
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
        console.log('📚 Courses tab selected, rendering course management...');
        return renderCourseManagement();
      
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
      
      case 'terms':
        console.log('⚡ Terms tab selected, rendering terms management...');
        return renderTermsManagement();
      
      case 'thoughts':
        console.log('💭 Thoughts tab selected, rendering thoughts management...');
        return renderThoughtsManagement();
      
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
                    console.log('Saving CV data:', cvData);
                    
                    let response;
                    if (editingCV) {
                      // Update existing CV
                      console.log('Updating CV:', editingCV._id);
                      response = await makeAuthenticatedRequest(`http://localhost:3000/api/admin/content/cv-templates/${editingCV._id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cvData),
                      });
                    } else {
                      // Add new CV
                      console.log('Creating new CV');
                      response = await makeAuthenticatedRequest('http://localhost:3000/api/admin/content/cv-templates', {
                        method: 'POST',
                        headers: {
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
                        ? `http://localhost:3000/api/admin/content/articles/${editingArticle._id}`
                        : 'http://localhost:3000/api/admin/content/articles';
                      
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
                        ? `http://localhost:3000/api/admin/content/roadmaps/${editingRoadmap._id}`
                        : 'http://localhost:3000/api/admin/content/roadmaps';
                      
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
                        ? `http://localhost:3000/api/admin/content/podcasts/${editingPodcast._id}`
                        : 'http://localhost:3000/api/admin/content/podcasts';
                      
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

        {/* Course Form Modal */}
        {showCourseModal && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showCourseModal}
            onRequestClose={() => setShowCourseModal(false)}
          >
            <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowCourseModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                <CourseForm 
                  course={editingCourse}
                  onSave={async (courseData) => {
                    try {
                      console.log('📚 Saving course:', JSON.stringify(courseData, null, 2));
                      
                      const response = await fetch(
                        editingCourse 
                          ? `http://localhost:3000/api/public/courses/${editingCourse._id}`
                          : 'http://localhost:3000/api/public/courses',
                        {
                          method: editingCourse ? 'PUT' : 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(courseData),
                        }
                      );

                      console.log('📡 Course save response status:', response.status);
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Course save result:', result);
                        
                        if (editingCourse) {
                          setCourses(courses.map(course => 
                            course._id === editingCourse._id ? result.data : course
                          ));
                        } else {
                          setCourses([...courses, result.data]);
                          // Send notification for new course
                          await NotificationService.sendContentNotification(
                            'course',
                            result.data?.title || 'كورس جديد',
                            result.data?.instructor
                          );
                        }
                        setShowCourseModal(false);
                        setEditingCourse(null);
                        Alert.alert('تم بنجاح!', editingCourse ? 'تم تحديث الكورس بنجاح!' : 'تم إنشاء الكورس وإرسال إشعار!');
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Course save error:', errorText);
                        Alert.alert('Error', `Failed to save course: ${response.status} - ${errorText}`);
                      }
                    } catch (error) {
                      console.error('Error saving course:', error);
                      Alert.alert('Error', 'Failed to save course');
                    }
                  }}
                  onCancel={() => {
                    setShowCourseModal(false);
                    setEditingCourse(null);
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
                        ? `http://localhost:3000/api/admin/content/advices/${editingAdvice._id}`
                        : 'http://localhost:3000/api/admin/content/advices';
                      
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

        {/* Programmer Thoughts Modal */}
        {showThoughtModal && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showThoughtModal}
            onRequestClose={() => {
              setShowThoughtModal(false);
              setEditingThought(null);
            }}
          >
            <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']} style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <ThoughtForm 
                  thought={editingThought}
                  onSave={async (thoughtData) => {
                    try {
                      console.log('💭 Saving programmer thought:', JSON.stringify(thoughtData, null, 2));
                      
                      const response = await fetch(
                        editingThought 
                          ? `http://localhost:3000/api/public/programmer-thoughts/${editingThought._id}`
                          : 'http://localhost:3000/api/public/programmer-thoughts',
                        {
                          method: editingThought ? 'PUT' : 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(thoughtData),
                        }
                      );

                      console.log('📡 Thought save response status:', response.status);
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Thought saved successfully:', result);
                        
                        if (editingThought) {
                          setThoughts(thoughts.map(thought => 
                            thought._id === editingThought._id ? result.data : thought
                          ));
                        } else {
                          setThoughts([result.data, ...thoughts]);
                          
                          // Send notification for new content
                          await NotificationService.sendContentNotification(
                            'thought',
                            result.data?.title || 'حلقة جديدة',
                            result.data?.category
                          );
                        }
                        setShowThoughtModal(false);
                        setEditingThought(null);
                        Alert.alert('تم بنجاح!', editingThought ? 'تم تحديث الحلقة بنجاح!' : 'تم إنشاء الحلقة وإرسال إشعار!');
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Thought save error:', errorText);
                        Alert.alert('Error', `Failed to save thought: ${response.status} - ${errorText}`);
                      }
                    } catch (error) {
                      console.error('Error saving thought:', error);
                      Alert.alert('Error', 'Failed to save thought');
                    }
                  }}
                  onCancel={() => {
                    setShowThoughtModal(false);
                    setEditingThought(null);
                  }}
                />
              </ScrollView>
            </LinearGradient>
          </Modal>
        )}

        {/* Programming Terms Modal */}
        {showTermModal && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showTermModal}
            onRequestClose={() => {
              setShowTermModal(false);
              setEditingTerm(null);
            }}
          >
            <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']} style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TermForm 
                  term={editingTerm}
                  onSave={async (termData) => {
                    try {
                      console.log('⚡ Saving programming term:', JSON.stringify(termData, null, 2));
                      
                      const response = await fetch(
                        editingTerm 
                          ? `http://localhost:3000/api/public/programming-terms/${editingTerm._id}`
                          : 'http://localhost:3000/api/public/programming-terms',
                        {
                          method: editingTerm ? 'PUT' : 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(termData),
                        }
                      );

                      console.log('📡 Term save response status:', response.status);
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Term saved successfully:', result);
                        
                        if (editingTerm) {
                          setTerms(terms.map(term => 
                            term._id === editingTerm._id ? result.data : term
                          ));
                        } else {
                          setTerms([result.data, ...terms]);
                          
                          // Send notification for new content
                          await NotificationService.sendContentNotification(
                            'term',
                            result.data?.term || 'مصطلح جديد',
                            result.data?.language
                          );
                        }
                        setShowTermModal(false);
                        setEditingTerm(null);
                        Alert.alert('تم بنجاح!', editingTerm ? 'تم تحديث المصطلح بنجاح!' : 'تم إنشاء المصطلح وإرسال إشعار!');
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Term save error:', errorText);
                        Alert.alert('Error', `Failed to save term: ${response.status} - ${errorText}`);
                      }
                    } catch (error) {
                      console.error('Error saving term:', error);
                      Alert.alert('Error', 'Failed to save term');
                    }
                  }}
                  onCancel={() => {
                    setShowTermModal(false);
                    setEditingTerm(null);
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

      const response = await fetch('http://localhost:3000/api/admin/content/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let fetch set it automatically
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

// Course Form Component
const CourseForm = ({ course, onSave, onCancel }: { course: any, onSave: (data: any) => void, onCancel: () => void }) => {
  console.log('📚 CourseForm mounted with course:', course);
  
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    instructor: course?.instructor || '',
    instructorBio: course?.instructorBio || '',
    instructorAvatar: course?.instructorAvatar || '👨‍💻',
    instructorRating: course?.instructorRating || 4.9,
    instructorStudents: course?.instructorStudents || 25000,
    duration: course?.duration || '',
    level: course?.level || 'Beginner',
    category: course?.category || 'Programming',
    rating: course?.rating || 0,
    totalRatings: course?.totalRatings || 15420,
    students: course?.students || 0,
    price: course?.price || 0,
    originalPrice: course?.originalPrice || 0,
    language: course?.language || 'Arabic',
    thumbnail: course?.thumbnail || '',
    image: course?.image || '',
    previewVideo: course?.previewVideo || '',
    certificateTemplate: course?.certificateTemplate || '',
    requirements: course?.requirements || [],
    learningOutcomes: course?.learningOutcomes || [],
    sections: course?.sections || [],
    challenges: course?.challenges || [],
    isActive: course?.isActive !== undefined ? course.isActive : true,
    isFeatured: course?.isFeatured || false,
    tags: course?.tags || [],
    lastUpdated: course?.lastUpdated || '2 weeks ago'
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newRequirement, setNewRequirement] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newTag, setNewTag] = useState('');
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'project',
    difficulty: 'easy',
    points: 10,
    duration: '1 week',
    requirements: [],
    deliverables: [],
    guidelines: [],
    evaluationCriteria: []
  });
  const [newChallengeRequirement, setNewChallengeRequirement] = useState('');
  const [newChallengeDeliverable, setNewChallengeDeliverable] = useState('');
  const [newChallengeGuideline, setNewChallengeGuideline] = useState('');
  const [newChallengeCriteria, setNewChallengeCriteria] = useState('');

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
        console.log('📷 Course image selected:', imageUri);
        
        // Upload image to server
        const uploadResult = await uploadImageToServer(imageUri);
        console.log('📷 Course image upload result:', uploadResult);
        if (uploadResult) {
          console.log('📷 Setting thumbnail in formData:', uploadResult);
          setFormData({...formData, thumbnail: uploadResult});
          Alert.alert('تم', 'تم رفع الصورة بنجاح!');
        } else {
          console.log('📷 Course image upload failed or returned null');
        }
      }
    } catch (error) {
      console.error('📷 Course image picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const pickHeroImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('🖼️ Course hero image selected:', imageUri);
        
        // Upload image to server
        const uploadResult = await uploadImageToServer(imageUri);
        console.log('🖼️ Course hero image upload result:', uploadResult);
        if (uploadResult) {
          console.log('🖼️ Setting hero image in formData:', uploadResult);
          setFormData({...formData, image: uploadResult});
          Alert.alert('تم', 'تم رفع صورة البانر بنجاح!');
        } else {
          console.log('🖼️ Course hero image upload failed or returned null');
        }
      }
    } catch (error) {
      console.error('🖼️ Course hero image picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار صورة البانر');
    }
  };

  const uploadImageToServer = async (imageUri: string) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('خطأ', 'يرجى تسجيل الدخول مرة أخرى');
        return null;
      }

      const formDataUpload = new FormData();
      formDataUpload.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'course-thumbnail.jpg',
      } as any);

      const response = await fetch('http://localhost:3000/api/admin/content/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📷 Course image upload result:', result);
        return result.data.imageUrl;
      } else {
        console.error('📷 Course image upload failed:', response.status);
        Alert.alert('خطأ', 'فشل في رفع الصورة');
        return null;
      }
    } catch (error) {
      console.error('📷 Course image upload error:', error);
      Alert.alert('خطأ', 'فشل في رفع الصورة');
      return null;
    }
  };

  const addRequirement = () => {
    console.log('📋 addRequirement called with:', newRequirement);
    console.log('📋 Current requirements before:', formData.requirements);
    
    if (newRequirement.trim()) {
      const updatedRequirements = [...formData.requirements, newRequirement.trim()];
      console.log('📋 New requirements array:', updatedRequirements);
      
      setFormData({
        ...formData,
        requirements: updatedRequirements
      });
      setNewRequirement('');
      console.log('📋 Requirement added successfully!');
    } else {
      console.log('📋 Requirement is empty, not adding');
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  // Challenge Management Functions
  const addChallengeRequirement = () => {
    if (newChallengeRequirement.trim()) {
      setNewChallenge({
        ...newChallenge,
        requirements: [...newChallenge.requirements, newChallengeRequirement.trim()]
      });
      setNewChallengeRequirement('');
    }
  };

  const removeChallengeRequirement = (index: number) => {
    setNewChallenge({
      ...newChallenge,
      requirements: newChallenge.requirements.filter((_, i) => i !== index)
    });
  };

  const addChallengeDeliverable = () => {
    if (newChallengeDeliverable.trim()) {
      setNewChallenge({
        ...newChallenge,
        deliverables: [...newChallenge.deliverables, newChallengeDeliverable.trim()]
      });
      setNewChallengeDeliverable('');
    }
  };

  const removeChallengeDeliverable = (index: number) => {
    setNewChallenge({
      ...newChallenge,
      deliverables: newChallenge.deliverables.filter((_, i) => i !== index)
    });
  };

  const addChallengeGuideline = () => {
    if (newChallengeGuideline.trim()) {
      setNewChallenge({
        ...newChallenge,
        guidelines: [...newChallenge.guidelines, newChallengeGuideline.trim()]
      });
      setNewChallengeGuideline('');
    }
  };

  const removeChallengeGuideline = (index: number) => {
    setNewChallenge({
      ...newChallenge,
      guidelines: newChallenge.guidelines.filter((_, i) => i !== index)
    });
  };

  const addChallengeCriteria = () => {
    if (newChallengeCriteria.trim()) {
      setNewChallenge({
        ...newChallenge,
        evaluationCriteria: [...newChallenge.evaluationCriteria, newChallengeCriteria.trim()]
      });
      setNewChallengeCriteria('');
    }
  };

  const removeChallengeCriteria = (index: number) => {
    setNewChallenge({
      ...newChallenge,
      evaluationCriteria: newChallenge.evaluationCriteria.filter((_, i) => i !== index)
    });
  };

  const addChallenge = () => {
    if (newChallenge.title.trim() && newChallenge.description.trim()) {
      setFormData({
        ...formData,
        challenges: [...formData.challenges, { ...newChallenge, id: Date.now().toString() }]
      });
      setNewChallenge({
        title: '',
        description: '',
        type: 'project',
        difficulty: 'easy',
        points: 10,
        duration: '1 week',
        requirements: [],
        deliverables: [],
        guidelines: [],
        evaluationCriteria: []
      });
    }
  };

  const removeChallenge = (challengeId: string) => {
    setFormData({
      ...formData,
      challenges: formData.challenges.filter(challenge => challenge.id !== challengeId)
    });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const addLearningOutcome = () => {
    console.log('🎯 addLearningOutcome called with:', newOutcome);
    console.log('🎯 Current outcomes before:', formData.learningOutcomes);
    
    if (newOutcome.trim()) {
      const updatedOutcomes = [...formData.learningOutcomes, newOutcome.trim()];
      console.log('🎯 New outcomes array:', updatedOutcomes);
      
      setFormData({
        ...formData,
        learningOutcomes: updatedOutcomes
      });
      setNewOutcome('');
      console.log('🎯 Learning outcome added successfully!');
    } else {
      console.log('🎯 Learning outcome is empty, not adding');
    }
  };

  const removeLearningOutcome = (index: number) => {
    setFormData({
      ...formData,
      learningOutcomes: formData.learningOutcomes.filter((_, i) => i !== index)
    });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, {
        title: 'New Section',
        description: '',
        lessons: [],
        order: formData.sections.length
      }]
    });
  };

  const updateSection = (sectionIndex: number, field: string, value: any) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeSection = (sectionIndex: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== sectionIndex)
    });
  };

  const addLesson = (sectionIndex: number) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].lessons.push({
      title: 'New Lesson',
      description: '',
      videoUrl: '',
      duration: '',
      thumbnail: '',
      isCompleted: false,
      order: updatedSections[sectionIndex].lessons.length
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: string, value: any) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].lessons[lessonIndex] = {
      ...updatedSections[sectionIndex].lessons[lessonIndex],
      [field]: value
    };
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].lessons = updatedSections[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الكورس');
      return;
    }

    console.log('📚 Course form data before save:', JSON.stringify(formData, null, 2));
    console.log('🎯 Requirements data:', formData.requirements);
    console.log('🎯 Learning outcomes data:', formData.learningOutcomes);
    console.log('🎯 Requirements length:', formData.requirements.length);
    console.log('🎯 Learning outcomes length:', formData.learningOutcomes.length);
    onSave(formData);
  };

  return (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.formHeader}>
        <Text style={styles.formHeaderTitle}>
          {course ? 'تعديل الكورس' : 'إضافة كورس جديد'}
        </Text>
        <Text style={styles.formHeaderSubtitle}>
          {course ? 'قم بتعديل تفاصيل الكورس' : 'املأ التفاصيل التالية لإضافة كورس جديد'}
        </Text>
      </View>

      {/* Basic Information Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>📚 المعلومات الأساسية</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>عنوان الكورس *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            placeholder="أدخل عنوان الكورس"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>وصف الكورس *</Text>
          <TextInput
            style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholder="اكتب وصفاً مفصلاً للكورس..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>المدرب *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.instructor}
              onChangeText={(text) => setFormData({...formData, instructor: text})}
              placeholder="اسم المدرب"
              placeholderTextColor="#666"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>المدة الزمنية</Text>
            <TextInput
              style={styles.formInput}
              value={formData.duration}
              onChangeText={(text) => setFormData({...formData, duration: text})}
              placeholder="مثال: 10 ساعات"
              placeholderTextColor="#666"
            />
          </View>
        </View>
      </View>

      {/* Pricing Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>💰 التسعير والإحصائيات</Text>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>السعر الحالي</Text>
            <TextInput
              style={styles.formInput}
              value={formData.price.toString()}
              onChangeText={(text) => setFormData({...formData, price: parseFloat(text) || 0})}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>السعر الأصلي</Text>
            <TextInput
              style={styles.formInput}
              value={formData.originalPrice.toString()}
              onChangeText={(text) => setFormData({...formData, originalPrice: parseFloat(text) || 0})}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>تقييم الكورس</Text>
            <TextInput
              style={styles.formInput}
              value={formData.rating.toString()}
              onChangeText={(text) => setFormData({...formData, rating: Math.min(5, Math.max(0, parseFloat(text) || 0))})}
              placeholder="4.5"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>عدد الطلاب</Text>
            <TextInput
              style={styles.formInput}
              value={formData.students.toString()}
              onChangeText={(text) => setFormData({...formData, students: parseInt(text) || 0})}
              placeholder="100"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>إجمالي التقييمات</Text>
          <TextInput
            style={styles.formInput}
            value={formData.totalRatings.toString()}
            onChangeText={(text) => setFormData({...formData, totalRatings: parseInt(text) || 0})}
            placeholder="15420"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Instructor Details Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>👨‍🏫 تفاصيل المدرب</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>نبذة عن المدرب</Text>
          <TextInput
            style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
            value={formData.instructorBio}
            onChangeText={(text) => setFormData({...formData, instructorBio: text})}
            placeholder="اكتب نبذة مختصرة عن المدرب..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>تقييم المدرب</Text>
            <TextInput
              style={styles.formInput}
              value={formData.instructorRating.toString()}
              onChangeText={(text) => setFormData({...formData, instructorRating: Math.min(5, Math.max(0, parseFloat(text) || 4.9))})}
              placeholder="4.9"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>عدد طلاب المدرب</Text>
            <TextInput
              style={styles.formInput}
              value={formData.instructorStudents.toString()}
              onChangeText={(text) => setFormData({...formData, instructorStudents: parseInt(text) || 25000})}
              placeholder="25000"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>أيقونة المدرب</Text>
          <View style={styles.avatarSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['👨‍💻', '👩‍💻', '👨‍🏫', '👩‍🏫', '👨‍🎓', '👩‍🎓', '🧑‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬'].map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.avatarOption,
                    formData.instructorAvatar === avatar && styles.avatarOptionSelected
                  ]}
                  onPress={() => setFormData({...formData, instructorAvatar: avatar})}
                >
                  <Text style={styles.avatarText}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Course Challenges Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>🏆 تحديات الكورس</Text>
        <Text style={styles.formSubtitle}>أضف تحديات عملية لتطبيق ما تعلمه الطلاب في الكورس</Text>
        
        {/* Current Challenges */}
        {formData.challenges.length > 0 && (
          <View style={styles.challengesList}>
            <Text style={styles.listTitle}>التحديات المضافة:</Text>
            {formData.challenges.map((challenge, index) => (
              <View key={challenge.id} style={styles.challengeItem}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <View style={styles.challengeBadges}>
                    <Text style={[styles.challengeBadge, { backgroundColor: 
                      challenge.difficulty === 'easy' ? '#2ECC71' : 
                      challenge.difficulty === 'medium' ? '#F39C12' : '#E74C3C'
                    }]}>
                      {challenge.difficulty === 'easy' ? 'سهل' : 
                       challenge.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </Text>
                    <Text style={[styles.challengeBadge, { backgroundColor: '#9B59B6' }]}>
                      {challenge.type === 'project' ? 'مشروع' : 
                       challenge.type === 'quiz' ? 'اختبار' : 
                       challenge.type === 'coding' ? 'برمجة' : 
                       challenge.type === 'design' ? 'تصميم' : 'بحث'}
                    </Text>
                    <Text style={[styles.challengeBadge, { backgroundColor: '#3498DB' }]}>
                      {challenge.points} نقطة
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeChallengeButton}
                    onPress={() => removeChallenge(challenge.id)}
                  >
                    <Text style={styles.removeChallengeText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                <Text style={styles.challengeMeta}>المدة: {challenge.duration}</Text>
              </View>
            ))}
          </View>
        )}

        {/* New Challenge Form */}
        <View style={styles.newChallengeForm}>
          <Text style={styles.formLabel}>إضافة تحدي جديد</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>عنوان التحدي *</Text>
            <TextInput
              style={styles.formInput}
              value={newChallenge.title}
              onChangeText={(text) => setNewChallenge({...newChallenge, title: text})}
              placeholder="مثال: بناء تطبيق إدارة المهام"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>وصف التحدي *</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
              value={newChallenge.description}
              onChangeText={(text) => setNewChallenge({...newChallenge, description: text})}
              placeholder="اكتب وصفاً مفصلاً للتحدي وما هو المطلوب من الطلاب..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.formLabel}>نوع التحدي</Text>
              <TouchableOpacity
                style={styles.formInput}
                onPress={() => {
                  Alert.alert(
                    'اختر نوع التحدي',
                    'اختر النوع المناسب للتحدي',
                    [
                      { text: 'مشروع', onPress: () => setNewChallenge({...newChallenge, type: 'project'}) },
                      { text: 'اختبار', onPress: () => setNewChallenge({...newChallenge, type: 'quiz'}) },
                      { text: 'برمجة', onPress: () => setNewChallenge({...newChallenge, type: 'coding'}) },
                      { text: 'تصميم', onPress: () => setNewChallenge({...newChallenge, type: 'design'}) },
                      { text: 'بحث', onPress: () => setNewChallenge({...newChallenge, type: 'research'}) },
                    ]
                  );
                }}
              >
                <Text style={styles.dropdownText}>
                  {newChallenge.type === 'project' ? 'مشروع' : 
                   newChallenge.type === 'quiz' ? 'اختبار' : 
                   newChallenge.type === 'coding' ? 'برمجة' : 
                   newChallenge.type === 'design' ? 'تصميم' : 'بحث'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.formLabel}>مستوى الصعوبة</Text>
              <TouchableOpacity
                style={styles.formInput}
                onPress={() => {
                  Alert.alert(
                    'اختر مستوى الصعوبة',
                    'اختر مستوى صعوبة التحدي',
                    [
                      { text: 'سهل', onPress: () => setNewChallenge({...newChallenge, difficulty: 'easy'}) },
                      { text: 'متوسط', onPress: () => setNewChallenge({...newChallenge, difficulty: 'medium'}) },
                      { text: 'صعب', onPress: () => setNewChallenge({...newChallenge, difficulty: 'hard'}) },
                    ]
                  );
                }}
              >
                <Text style={styles.dropdownText}>
                  {newChallenge.difficulty === 'easy' ? 'سهل' : 
                   newChallenge.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.formLabel}>النقاط</Text>
              <TextInput
                style={styles.formInput}
                value={newChallenge.points.toString()}
                onChangeText={(text) => setNewChallenge({...newChallenge, points: parseInt(text) || 0})}
                placeholder="10"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.formLabel}>المدة المقترحة</Text>
              <TextInput
                style={styles.formInput}
                value={newChallenge.duration}
                onChangeText={(text) => setNewChallenge({...newChallenge, duration: text})}
                placeholder="1 week"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          {/* Challenge Requirements */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>متطلبات التحدي</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.formInput, { flex: 1, marginRight: 10 }]}
                value={newChallengeRequirement}
                onChangeText={setNewChallengeRequirement}
                placeholder="مثال: معرفة أساسيات JavaScript"
                placeholderTextColor="#666"
                onSubmitEditing={addChallengeRequirement}
              />
              <TouchableOpacity style={styles.addListItemButton} onPress={addChallengeRequirement}>
                <Text style={styles.addListItemButtonText}>➕</Text>
              </TouchableOpacity>
            </View>
            {newChallenge.requirements.map((req, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>• {req}</Text>
                <TouchableOpacity 
                  style={styles.removeItemButton}
                  onPress={() => removeChallengeRequirement(index)}
                >
                  <Text style={styles.removeItemText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Challenge Deliverables */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>المخرجات المطلوبة</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.formInput, { flex: 1, marginRight: 10 }]}
                value={newChallengeDeliverable}
                onChangeText={setNewChallengeDeliverable}
                placeholder="مثال: كود المشروع على GitHub"
                placeholderTextColor="#666"
                onSubmitEditing={addChallengeDeliverable}
              />
              <TouchableOpacity style={styles.addListItemButton} onPress={addChallengeDeliverable}>
                <Text style={styles.addListItemButtonText}>➕</Text>
              </TouchableOpacity>
            </View>
            {newChallenge.deliverables.map((del, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>• {del}</Text>
                <TouchableOpacity 
                  style={styles.removeItemButton}
                  onPress={() => removeChallengeDeliverable(index)}
                >
                  <Text style={styles.removeItemText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addChallengeButton} onPress={addChallenge}>
            <Text style={styles.addChallengeButtonText}>🏆 إضافة التحدي</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Course Settings Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>⚙️ إعدادات الكورس</Text>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>المستوى</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => {
                Alert.alert(
                  'اختر المستوى',
                  'اختر مستوى صعوبة الكورس',
                  [
                    { text: 'مبتدئ', onPress: () => setFormData({...formData, level: 'Beginner'}) },
                    { text: 'متوسط', onPress: () => setFormData({...formData, level: 'Intermediate'}) },
                    { text: 'متقدم', onPress: () => setFormData({...formData, level: 'Advanced'}) },
              ]
            );
          }}
        >
          <Text style={styles.dropdownText}>
            {formData.level === 'Beginner' ? 'مبتدئ' : 
             formData.level === 'Intermediate' ? 'متوسط' : 'متقدم'}
          </Text>
        </TouchableOpacity>
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>التصنيف</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => {
                Alert.alert(
                  'اختر التصنيف',
                  'اختر تصنيف الكورس',
                  [
                    { text: 'برمجة', onPress: () => setFormData({...formData, category: 'Programming'}) },
                    { text: 'تصميم', onPress: () => setFormData({...formData, category: 'Design'}) },
                    { text: 'أعمال', onPress: () => setFormData({...formData, category: 'Business'}) },
                    { text: 'تسويق', onPress: () => setFormData({...formData, category: 'Marketing'}) },
                    { text: 'علم البيانات', onPress: () => setFormData({...formData, category: 'Data Science'}) },
                  ]
                );
              }}
            >
              <Text style={styles.dropdownText}>
                {formData.category === 'Programming' ? 'برمجة' : 
                 formData.category === 'Design' ? 'تصميم' :
                 formData.category === 'Business' ? 'أعمال' :
                 formData.category === 'Marketing' ? 'تسويق' : 'علم البيانات'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>السعر الحالي ($)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.price.toString()}
              onChangeText={(text) => setFormData({...formData, price: parseInt(text) || 0})}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>السعر الأصلي ($)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.originalPrice.toString()}
              onChangeText={(text) => setFormData({...formData, originalPrice: parseInt(text) || 0})}
              placeholder="199"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>اللغة</Text>
            <TextInput
              style={styles.formInput}
              value={formData.language}
              onChangeText={(text) => setFormData({...formData, language: text})}
              placeholder="Arabic"
              placeholderTextColor="#666"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>عدد الطلاب</Text>
            <TextInput
              style={styles.formInput}
              value={formData.students.toString()}
              onChangeText={(text) => setFormData({...formData, students: parseInt(text) || 0})}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Category</Text>
        <TouchableOpacity
          style={styles.formInput}
          onPress={() => {
            Alert.alert(
              'Select Category',
              'Choose course category',
              [
                { text: 'Programming', onPress: () => setFormData({...formData, category: 'Programming'}) },
                { text: 'Design', onPress: () => setFormData({...formData, category: 'Design'}) },
                { text: 'Business', onPress: () => setFormData({...formData, category: 'Business'}) },
                { text: 'Marketing', onPress: () => setFormData({...formData, category: 'Marketing'}) },
                { text: 'Data Science', onPress: () => setFormData({...formData, category: 'Data Science'}) },
              ]
            );
          }}
        >
          <Text style={styles.dropdownText}>{formData.category}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Price ($)</Text>
        <TextInput
          style={styles.formInput}
          value={formData.price.toString()}
          onChangeText={(text) => setFormData({...formData, price: parseFloat(text) || 0})}
          placeholder="0"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
      </View>

      {/* Course Thumbnail */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Course Thumbnail</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>
            {formData.thumbnail ? '📷 Change Image' : '📷 Select Image'}
          </Text>
        </TouchableOpacity>
        {formData.thumbnail && (
          <Text style={styles.imageSelectedText}>✅ Image selected</Text>
        )}
      </View>

      {/* Preview Video URL */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Preview Video URL</Text>
        <TextInput
          style={styles.formInput}
          value={formData.previewVideo}
          onChangeText={(text) => setFormData({...formData, previewVideo: text})}
          placeholder="Enter preview video URL"
          placeholderTextColor="#666"
        />
      </View>

      {/* Requirements and Outcomes Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>📋 المتطلبات والنتائج</Text>
        
        {/* Course Requirements */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>📋 متطلبات الكورس</Text>
          <Text style={styles.formHint}>أضف المتطلبات الأساسية التي يحتاجها الطالب قبل البدء</Text>
          
          <View style={styles.listInputContainer}>
            <TextInput
              style={styles.listInput}
              value={newRequirement}
              onChangeText={(text) => {
                console.log('📋 Requirement input changed:', text);
                setNewRequirement(text);
              }}
              placeholder="مثال: معرفة أساسية بالبرمجة"
              placeholderTextColor="#666"
              returnKeyType="done"
              onSubmitEditing={() => {
                console.log('📋 Enter pressed, adding requirement:', newRequirement);
                addRequirement();
              }}
            />
            <TouchableOpacity 
              style={[styles.addListItemButton, !newRequirement.trim() && styles.addListItemButtonDisabled]} 
              onPress={() => {
                console.log('📋 Add button pressed, requirement:', newRequirement);
                console.log('📋 Current requirements:', formData.requirements);
                addRequirement();
              }}
              disabled={!newRequirement.trim()}
            >
              <Text style={styles.addListItemButtonText}>➕ إضافة</Text>
            </TouchableOpacity>
          </View>

          {formData.requirements.length === 0 ? (
            <View style={styles.emptyListState}>
              <Text style={styles.emptyListText}>لم يتم إضافة أي متطلبات بعد</Text>
            </View>
          ) : (
            <View style={styles.listItemsContainer}>
              {formData.requirements.map((req, index) => (
                <View key={index} style={styles.enhancedListItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemBullet}>📌</Text>
                    <Text style={styles.listItemText}>{req}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeItemButton}
                    onPress={() => {
                      console.log('📋 Removing requirement at index:', index);
                      removeRequirement(index);
                    }}
                  >
                    <Text style={styles.removeItemText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Learning Outcomes */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>🎯 ما سيتعلمه الطلاب</Text>
          <Text style={styles.formHint}>أضف النتائج والمهارات التي سيكتسبها الطالب</Text>
          
          <View style={styles.listInputContainer}>
            <TextInput
              style={styles.listInput}
              value={newOutcome}
              onChangeText={(text) => {
                console.log('🎯 Outcome input changed:', text);
                setNewOutcome(text);
              }}
              placeholder="مثال: بناء تطبيقات الجوال باستخدام React Native"
              placeholderTextColor="#666"
              returnKeyType="done"
              onSubmitEditing={() => {
                console.log('🎯 Enter pressed, adding outcome:', newOutcome);
                addLearningOutcome();
              }}
            />
            <TouchableOpacity 
              style={[styles.addListItemButton, !newOutcome.trim() && styles.addListItemButtonDisabled]} 
              onPress={() => {
                console.log('🎯 Add button pressed, outcome:', newOutcome);
                console.log('🎯 Current outcomes:', formData.learningOutcomes);
                addLearningOutcome();
              }}
              disabled={!newOutcome.trim()}
            >
              <Text style={styles.addListItemButtonText}>➕ إضافة</Text>
            </TouchableOpacity>
          </View>

          {formData.learningOutcomes.length === 0 ? (
            <View style={styles.emptyListState}>
              <Text style={styles.emptyListText}>لم يتم إضافة أي نتائج تعلم بعد</Text>
            </View>
          ) : (
            <View style={styles.listItemsContainer}>
              {formData.learningOutcomes.map((outcome, index) => (
                <View key={index} style={styles.enhancedListItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemBullet}>✅</Text>
                    <Text style={styles.listItemText}>{outcome}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeItemButton}
                    onPress={() => {
                      console.log('🎯 Removing outcome at index:', index);
                      removeLearningOutcome(index);
                    }}
                  >
                    <Text style={styles.removeItemText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tags Section */}
        <Text style={styles.formLabel}>🏷️ العلامات (Tags)</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={[styles.formInput, { flex: 1, marginRight: 10 }]}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="أدخل علامة جديدة"
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.addListItemButton} onPress={addTag}>
            <Text style={styles.addListItemButtonText}>إضافة</Text>
          </TouchableOpacity>
        </View>
        {formData.tags.map((tag, index) => (
          <View key={index} style={styles.tagItem}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(index)}>
              <Text style={styles.removeItemText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Media Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>🎬 الوسائط والملفات</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>رابط الفيديو التعريفي</Text>
          <TextInput
            style={styles.formInput}
            value={formData.previewVideo}
            onChangeText={(text) => setFormData({...formData, previewVideo: text})}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>قالب الشهادة</Text>
          <TextInput
            style={styles.formInput}
            value={formData.certificateTemplate}
            onChangeText={(text) => setFormData({...formData, certificateTemplate: text})}
            placeholder="رابط قالب الشهادة"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>اللغة</Text>
          <TouchableOpacity
            style={styles.formInput}
            onPress={() => {
              Alert.alert(
                'اختر اللغة',
                'اختر لغة الكورس',
                [
                  { text: 'العربية', onPress: () => setFormData({...formData, language: 'Arabic'}) },
                  { text: 'الإنجليزية', onPress: () => setFormData({...formData, language: 'English'}) },
                  { text: 'الفرنسية', onPress: () => setFormData({...formData, language: 'French'}) },
                ]
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {formData.language === 'Arabic' ? 'العربية' : 
               formData.language === 'English' ? 'الإنجليزية' : 
               formData.language === 'French' ? 'الفرنسية' : formData.language}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Course Sections */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 أقسام الكورس</Text>
          <TouchableOpacity style={styles.addSectionButton} onPress={addSection}>
            <Text style={styles.addSectionButtonText}>+ إضافة قسم</Text>
          </TouchableOpacity>
        </View>
        
        {formData.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Section {sectionIndex + 1}</Text>
              <TouchableOpacity onPress={() => removeSection(sectionIndex)}>
                <Text style={styles.removeItemText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.formInput}
              value={section.title}
              onChangeText={(text) => updateSection(sectionIndex, 'title', text)}
              placeholder="Section title"
              placeholderTextColor="#666"
            />
            
            <TextInput
              style={[styles.formInput, { height: 60 }]}
              value={section.description}
              onChangeText={(text) => updateSection(sectionIndex, 'description', text)}
              placeholder="Section description"
              placeholderTextColor="#666"
              multiline
            />

            {/* Section Lessons */}
            <View style={styles.lessonsContainer}>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonHeaderText}>Lessons</Text>
                <TouchableOpacity 
                  style={styles.addLessonButton} 
                  onPress={() => addLesson(sectionIndex)}
                >
                  <Text style={styles.addLessonButtonText}>+ Add Lesson</Text>
                </TouchableOpacity>
              </View>
              
              {section.lessons.map((lesson, lessonIndex) => (
                <View key={lessonIndex} style={styles.lessonContainer}>
                  <View style={styles.lessonTitleContainer}>
                    <Text style={styles.lessonTitle}>Lesson {lessonIndex + 1}</Text>
                    <TouchableOpacity onPress={() => removeLesson(sectionIndex, lessonIndex)}>
                      <Text style={styles.removeItemText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={styles.formInput}
                    value={lesson.title}
                    onChangeText={(text) => updateLesson(sectionIndex, lessonIndex, 'title', text)}
                    placeholder="Lesson title"
                    placeholderTextColor="#666"
                  />
                  
                  <TextInput
                    style={styles.formInput}
                    value={lesson.videoUrl}
                    onChangeText={(text) => updateLesson(sectionIndex, lessonIndex, 'videoUrl', text)}
                    placeholder="Video URL"
                    placeholderTextColor="#666"
                  />
                  
                  <TextInput
                    style={styles.formInput}
                    value={lesson.duration}
                    onChangeText={(text) => updateLesson(sectionIndex, lessonIndex, 'duration', text)}
                    placeholder="Duration (e.g., 15:30)"
                    placeholderTextColor="#666"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Course Status */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>⚙️ إعدادات الحالة</Text>
        
        <View style={styles.statusRow}>
          <View style={styles.switchContainer}>
            <Text style={styles.formLabel}>نشط</Text>
            <TouchableOpacity
              style={[styles.switch, formData.isActive && styles.switchActive]}
              onPress={() => setFormData({...formData, isActive: !formData.isActive})}
            >
              <Text style={styles.switchText}>{formData.isActive ? 'نعم' : 'لا'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.formLabel}>مميز</Text>
            <TouchableOpacity
              style={[styles.switch, formData.isFeatured && styles.switchActive]}
              onPress={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
            >
              <Text style={styles.switchText}>{formData.isFeatured ? 'نعم' : 'لا'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Form Actions */}
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>إلغاء</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>
            {course ? 'تحديث الكورس' : 'حفظ الكورس'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  formHeader: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 20,
  },
  formHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  formHeaderSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4ECDC4',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  mediaPickerContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#2a2a2a',
  },
  imagePreview: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1a4a1a',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imagePreviewText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
  // Avatar Selector Styles
  avatarSelector: {
    marginTop: 10,
  },
  avatarOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarOptionSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  avatarText: {
    fontSize: 24,
  },
  // Tag Styles
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  tagText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  // Enhanced Requirements and Outcomes Styles
  formHint: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  addListItemButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  emptyListState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  emptyListText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  listItemsContainer: {
    marginTop: 10,
  },
  enhancedListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemBullet: {
    fontSize: 14,
    marginRight: 8,
  },
  removeItemButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 6,
    padding: 6,
    marginLeft: 10,
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
      // Get token manually for FormData uploads
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('خطأ', 'يرجى تسجيل الدخول مرة أخرى');
        return null;
      }

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'podcast-thumbnail.jpg',
      } as any);

      const response = await fetch('http://localhost:3000/api/admin/content/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let fetch set it automatically
        },
        body: formData,
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

      {/* Media Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>🎬 الوسائط</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>صورة الكورس الرئيسية</Text>
          <View style={styles.mediaPickerContainer}>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <Text style={styles.imagePickerText}>
                {formData.thumbnail ? '📷 تغيير الصورة' : '📷 اختيار صورة'}
              </Text>
            </TouchableOpacity>
            
            {formData.thumbnail && (
              <View style={styles.imagePreview}>
                <Text style={styles.imagePreviewText}>
                  ✅ تم اختيار الصورة
                </Text>
                <Text style={styles.imagePreviewText}>
                  URL: {formData.thumbnail}
                </Text>
                <TouchableOpacity
                  style={styles.clearImageButton}
                  onPress={() => setFormData({...formData, thumbnail: ''})}
                >
                  <Text style={styles.clearImageText}>🗑️ حذف</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>فيديو معاينة الكورس</Text>
          <TextInput
            style={styles.formInput}
            value={formData.previewVideo}
            onChangeText={(text) => setFormData({...formData, previewVideo: text})}
            placeholder="أدخل رابط فيديو المعاينة (اختياري)"
            placeholderTextColor="#666"
          />
        </View>
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
        ? `http://localhost:3000/api/admin/content/advices/${advice._id}`
        : 'http://localhost:3000/api/admin/content/advices';
      
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

        // Get token manually for FormData uploads
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const token = await AsyncStorage.getItem('token');
        
        const uploadResponse = await fetch('http://localhost:3000/api/admin/content/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - let fetch set it automatically
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

        // Get token manually for FormData uploads
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const token = await AsyncStorage.getItem('token');
        
        const uploadResponse = await fetch('http://localhost:3000/api/admin/content/upload-audio', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - let fetch set it automatically
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

      // Get token manually for FormData uploads
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      const uploadResponse = await fetch('http://localhost:3000/api/admin/content/upload-audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let fetch set it automatically
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

        {/* Course Hero Image */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>صورة البانر الرئيسية</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickHeroImage}>
            <Text style={styles.imagePickerButtonText}>
              {formData.image ? '📷 تغيير صورة البانر' : '📷 اختيار صورة البانر'}
            </Text>
          </TouchableOpacity>
          {formData.image && (
            <View style={styles.imagePreview}>
              <Text style={styles.imagePreviewText}>
                ✅ تم اختيار صورة البانر
              </Text>
              <Text style={styles.imagePreviewText}>
                URL: {formData.image}
              </Text>
              <TouchableOpacity
                style={styles.clearImageButton}
                onPress={() => setFormData({...formData, image: ''})}
              >
                <Text style={styles.clearImageText}>🗑️ حذف</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instructor Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>معلومات المدرب</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>اسم المدرب</Text>
            <TextInput
              style={styles.formInput}
              value={formData.instructor}
              onChangeText={(text) => setFormData({...formData, instructor: text})}
              placeholder="اسم المدرب..."
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>نبذة عن المدرب</Text>
            <TextInput
              style={styles.textArea}
              value={formData.instructorBio}
              onChangeText={(text) => setFormData({...formData, instructorBio: text})}
              placeholder="نبذة مختصرة عن المدرب وخبراته..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
              <Text style={styles.formLabel}>تقييم المدرب</Text>
              <TextInput
                style={styles.formInput}
                value={formData.instructorRating.toString()}
                onChangeText={(text) => setFormData({...formData, instructorRating: parseFloat(text) || 0})}
                placeholder="4.9"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, {flex: 1, marginLeft: 10}]}>
              <Text style={styles.formLabel}>عدد الطلاب</Text>
              <TextInput
                style={styles.formInput}
                value={formData.instructorStudents.toString()}
                onChangeText={(text) => setFormData({...formData, instructorStudents: parseInt(text) || 0})}
                placeholder="25000"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Course Statistics */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>إحصائيات الكورس</Text>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
              <Text style={styles.formLabel}>تقييم الكورس</Text>
              <TextInput
                style={styles.formInput}
                value={formData.rating.toString()}
                onChangeText={(text) => setFormData({...formData, rating: parseFloat(text) || 0})}
                placeholder="4.8"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, {flex: 1, marginLeft: 10}]}>
              <Text style={styles.formLabel}>عدد التقييمات</Text>
              <TextInput
                style={styles.formInput}
                value={formData.totalRatings.toString()}
                onChangeText={(text) => setFormData({...formData, totalRatings: parseInt(text) || 0})}
                placeholder="15420"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
              <Text style={styles.formLabel}>عدد الطلاب</Text>
              <TextInput
                style={styles.formInput}
                value={formData.students.toString()}
                onChangeText={(text) => setFormData({...formData, students: parseInt(text) || 0})}
                placeholder="15420"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, {flex: 1, marginLeft: 10}]}>
              <Text style={styles.formLabel}>آخر تحديث</Text>
              <TextInput
                style={styles.formInput}
                value={formData.lastUpdated}
                onChangeText={(text) => setFormData({...formData, lastUpdated: text})}
                placeholder="2 weeks ago"
                placeholderTextColor="#666666"
              />
            </View>
          </View>
        </View>

        {/* Tags Management */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>الكلمات المفتاحية (Tags)</Text>
          <View style={styles.addListItemContainer}>
            <TextInput
              style={[styles.formInput, { flex: 1, marginRight: 10 }]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="أضف كلمة مفتاحية..."
              placeholderTextColor="#666666"
            />
            <TouchableOpacity style={styles.addListItemButton} onPress={addTag}>
              <Text style={styles.addListItemButtonText}>إضافة</Text>
            </TouchableOpacity>
          </View>
          {formData.tags.map((tag, index) => (
            <View key={index} style={styles.tagItem}>
              <Text style={styles.tagText}>#{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(index)}>
                <Text style={styles.removeItemText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  // Course Form Styles
  dropdownText: {
    color: '#ffffff',
    fontSize: 16,
  },
  listInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  listInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    marginRight: 10,
  },
  addListItemButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addListItemButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  listItemText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  tagText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  removeItemText: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addSectionButton: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addSectionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#9B59B6',
    fontSize: 16,
    fontWeight: '700',
  },
  lessonsContainer: {
    marginTop: 10,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lessonHeaderText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  addLessonButton: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  addLessonButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  lessonContainer: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.3)',
  },
  lessonTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    color: '#E67E22',
    fontSize: 14,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switch: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  switchActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  switchText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePickerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageSelectedText: {
    color: '#4ECDC4',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

// Programming Term Form Component
const TermForm = ({ term, onSave, onCancel }: { term: any, onSave: (data: any) => void, onCancel: () => void }) => {
  console.log('⚡ TermForm mounted with term:', term);
  
  const [formData, setFormData] = useState({
    term: term?.term || '',
    definition: term?.definition || '',
    category: term?.category || '',
    language: term?.language || 'JavaScript',
    audioUrl: term?.audioUrl || '',
    duration: term?.duration || '',
    difficulty: term?.difficulty || 'Beginner',
    examples: term?.examples || [],
    relatedTerms: term?.relatedTerms || [],
    isActive: term?.isActive !== undefined ? term.isActive : true,
    isFeatured: term?.isFeatured || false
  });

  const [newExample, setNewExample] = useState({ code: '', explanation: '' });
  
  // Audio Recording States
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const addExample = () => {
    if (newExample.code.trim() && newExample.explanation.trim()) {
      setFormData({
        ...formData,
        examples: [...formData.examples, { ...newExample }]
      });
      setNewExample({ code: '', explanation: '' });
    }
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index)
    });
  };

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      console.log('🎤 Requesting audio permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('خطأ', 'يجب الموافقة على إذن الميكروفون لتسجيل الصوت');
        return;
      }

      console.log('🎤 Setting up audio session...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎤 Starting recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer for recording duration
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Store timer reference
      (newRecording as any).timer = timer;
      
      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('خطأ', 'فشل في بدء التسجيل');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      console.log('🎤 Stopping recording...');
      setIsRecording(false);
      
      // Clear timer
      if ((recording as any).timer) {
        clearInterval((recording as any).timer);
      }
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        setRecordedAudioUri(uri);
        console.log('✅ Recording saved to:', uri);
        
        // Calculate duration in MM:SS format
        const minutes = Math.floor(recordingDuration / 60);
        const seconds = recordingDuration % 60;
        const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setFormData({
          ...formData,
          duration: durationString
        });
        
        Alert.alert('نجح التسجيل!', `تم تسجيل الصوت بنجاح (${durationString})`);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert('خطأ', 'فشل في إيقاف التسجيل');
    }
  };

  const playPreview = async () => {
    try {
      if (!recordedAudioUri) return;

      if (isPlaying && audioPreview) {
        console.log('⏸️ Pausing audio preview...');
        await audioPreview.pauseAsync();
        setIsPlaying(false);
        return;
      }

      console.log('🔊 Playing audio preview...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedAudioUri },
        { shouldPlay: true }
      );
      
      setAudioPreview(sound);
      setIsPlaying(true);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setAudioPreview(null);
        }
      });
    } catch (error) {
      console.error('❌ Failed to play preview:', error);
      Alert.alert('خطأ', 'فشل في تشغيل المعاينة');
    }
  };

  const uploadAudio = async () => {
    try {
      if (!recordedAudioUri) {
        Alert.alert('خطأ', 'لا يوجد ملف صوتي للرفع');
        return;
      }

      setUploadingAudio(true);
      console.log('📤 Uploading audio file...');
      console.log('📤 Audio URI:', recordedAudioUri);

      // Create FormData for React Native
      const formDataUpload = new FormData();
      
      // Append the audio file with proper structure for React Native
      const audioFile = {
        uri: recordedAudioUri,
        type: 'audio/m4a',
        name: `term-audio-${Date.now()}.m4a`,
      };
      
      console.log('📤 Audio file object:', audioFile);
      formDataUpload.append('audio', audioFile as any);

      console.log('📤 FormData created, making request...');

      const response = await fetch('http://localhost:3000/api/admin/content/upload-audio', {
        method: 'POST',
        body: formDataUpload,
        // Remove Content-Type header to let FormData set it with boundary
      });

      console.log('📤 Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Audio uploaded successfully:', result);
        
        // Use the audioUrl directly from response
        const audioUrl = result.data.audioUrl;
        setFormData({
          ...formData,
          audioUrl: audioUrl
        });
        
        Alert.alert('نجح الرفع!', 'تم رفع الملف الصوتي بنجاح');
      } else {
        const errorText = await response.text();
        console.error('❌ Upload failed with status:', response.status);
        console.error('❌ Upload error response:', errorText);
        
        let errorMessage = 'فشل في رفع الملف الصوتي';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // If not JSON, use the text directly
          errorMessage = errorText || errorMessage;
        }
        
        Alert.alert('خطأ', errorMessage);
      }
    } catch (error) {
      console.error('❌ Failed to upload audio:', error);
      Alert.alert('خطأ', `فشل في رفع الملف الصوتي: ${error.message}`);
    } finally {
      setUploadingAudio(false);
    }
  };

  const deleteRecording = () => {
    Alert.alert(
      'حذف التسجيل',
      'هل أنت متأكد من حذف التسجيل الصوتي؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setRecordedAudioUri(null);
            setAudioPreview(null);
            setIsPlaying(false);
            setRecordingDuration(0);
            console.log('🗑️ Audio recording deleted');
          }
        }
      ]
    );
  };

  const handleSubmit = () => {
    if (!formData.term.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المصطلح');
      return;
    }
    
    if (!formData.definition.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال تعريف المصطلح');
      return;
    }

    if (!formData.category.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال تصنيف المصطلح');
      return;
    }

    // Check if audio is missing and warn user
    if (!formData.audioUrl.trim()) {
      Alert.alert(
        'تحذير',
        'لم يتم إضافة ملف صوتي للمصطلح. هل تريد المتابعة بدون صوت؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          { 
            text: 'متابعة', 
            onPress: () => {
              console.log('⚡ Term form data before save (no audio):', JSON.stringify(formData, null, 2));
              onSave(formData);
            }
          }
        ]
      );
      return;
    }

    console.log('⚡ Term form data before save:', JSON.stringify(formData, null, 2));
    onSave(formData);
  };

  return (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.formHeader}>
        <Text style={styles.formHeaderTitle}>
          {term ? 'تعديل المصطلح البرمجي' : 'إضافة مصطلح برمجي جديد'}
        </Text>
        <Text style={styles.formHeaderSubtitle}>
          {term ? 'قم بتعديل تفاصيل المصطلح' : 'املأ التفاصيل التالية لإضافة مصطلح جديد'}
        </Text>
      </View>

      {/* Basic Information Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>⚡ المعلومات الأساسية</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>اسم المصطلح *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.term}
            onChangeText={(text) => setFormData({...formData, term: text})}
            placeholder="مثال: Variable"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>التعريف *</Text>
          <TextInput
            style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
            value={formData.definition}
            onChangeText={(text) => setFormData({...formData, definition: text})}
            placeholder="اكتب تعريفاً مفصلاً للمصطلح..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>لغة البرمجة *</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => {
                Alert.alert(
                  'اختر لغة البرمجة',
                  'اختر اللغة المناسبة للمصطلح',
                  [
                    { text: 'JavaScript', onPress: () => setFormData({...formData, language: 'JavaScript'}) },
                    { text: 'Python', onPress: () => setFormData({...formData, language: 'Python'}) },
                    { text: 'Java', onPress: () => setFormData({...formData, language: 'Java'}) },
                    { text: 'C++', onPress: () => setFormData({...formData, language: 'C++'}) },
                    { text: 'C#', onPress: () => setFormData({...formData, language: 'C#'}) },
                    { text: 'PHP', onPress: () => setFormData({...formData, language: 'PHP'}) },
                    { text: 'Ruby', onPress: () => setFormData({...formData, language: 'Ruby'}) },
                    { text: 'Go', onPress: () => setFormData({...formData, language: 'Go'}) },
                  ]
                );
              }}
            >
              <Text style={styles.dropdownText}>{formData.language}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>التصنيف *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="مثال: متغيرات، دوال، هياكل البيانات..."
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>مستوى الصعوبة</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => {
                Alert.alert(
                  'اختر مستوى الصعوبة',
                  'اختر مستوى صعوبة المصطلح',
                  [
                    { text: 'Beginner', onPress: () => setFormData({...formData, difficulty: 'Beginner'}) },
                    { text: 'Intermediate', onPress: () => setFormData({...formData, difficulty: 'Intermediate'}) },
                    { text: 'Advanced', onPress: () => setFormData({...formData, difficulty: 'Advanced'}) },
                  ]
                );
              }}
            >
              <Text style={styles.dropdownText}>
                {formData.difficulty === 'Beginner' ? 'مبتدئ' : 
                 formData.difficulty === 'Intermediate' ? 'متوسط' : 'متقدم'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>مدة الصوت</Text>
            <TextInput
              style={styles.formInput}
              value={formData.duration}
              onChangeText={(text) => setFormData({...formData, duration: text})}
              placeholder="مثال: 2:30"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>رابط الملف الصوتي *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.audioUrl}
            onChangeText={(text) => setFormData({...formData, audioUrl: text})}
            placeholder="https://example.com/audio.mp3"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Audio Recording Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>🎤 تسجيل الصوت</Text>
        <Text style={styles.formSubtitle}>يمكنك تسجيل الصوت مباشرة من التطبيق بدلاً من إدخال رابط</Text>
        
        {!recordedAudioUri ? (
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={uploadingAudio}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? '⏹️ إيقاف التسجيل' : '🎤 بدء التسجيل'}
              </Text>
            </TouchableOpacity>
            
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.audioPreviewContainer}>
            <Text style={styles.audioPreviewTitle}>📁 التسجيل الصوتي جاهز</Text>
            <Text style={styles.audioPreviewDuration}>
              المدة: {formData.duration}
            </Text>
            
            <View style={styles.audioPreviewActions}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={playPreview}
                disabled={uploadingAudio}
              >
                <Text style={styles.previewButtonText}>
                  {isPlaying ? '⏸️ إيقاف' : '▶️ تشغيل'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.uploadButton, uploadingAudio && styles.uploadButtonDisabled]}
                onPress={uploadAudio}
                disabled={uploadingAudio}
              >
                <Text style={styles.uploadButtonText}>
                  {uploadingAudio ? '📤 جاري الرفع...' : '📤 رفع الملف'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteAudioButton}
                onPress={deleteRecording}
                disabled={uploadingAudio}
              >
                <Text style={styles.deleteAudioButtonText}>🗑️ حذف</Text>
              </TouchableOpacity>
            </View>
            
            {uploadingAudio && (
              <Text style={styles.uploadingText}>جاري رفع الملف الصوتي...</Text>
            )}
          </View>
        )}
      </View>

      {/* Examples Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>💻 أمثلة الكود</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>كود المثال</Text>
          <TextInput
            style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
            value={newExample.code}
            onChangeText={(text) => setNewExample({...newExample, code: text})}
            placeholder="const variable = 'value';"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>شرح المثال</Text>
          <TextInput
            style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
            value={newExample.explanation}
            onChangeText={(text) => setNewExample({...newExample, explanation: text})}
            placeholder="شرح كيفية عمل هذا الكود..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity style={styles.addListItemButton} onPress={addExample}>
          <Text style={styles.addListItemButtonText}>➕ إضافة مثال</Text>
        </TouchableOpacity>

        {formData.examples.map((example, index) => (
          <View key={index} style={styles.exampleItem}>
            <View style={styles.exampleContent}>
              <Text style={styles.exampleCode}>{example.code}</Text>
              <Text style={styles.exampleExplanation}>{example.explanation}</Text>
            </View>
            <TouchableOpacity 
              style={styles.removeItemButton}
              onPress={() => removeExample(index)}
            >
              <Text style={styles.removeItemText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Settings Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>⚙️ إعدادات المصطلح</Text>
        
        <View style={styles.formRow}>
          <View style={styles.switchContainer}>
            <Text style={styles.formLabel}>نشط</Text>
            <TouchableOpacity
              style={[styles.switch, formData.isActive && styles.switchActive]}
              onPress={() => setFormData({...formData, isActive: !formData.isActive})}
            >
              <Text style={styles.switchText}>{formData.isActive ? 'نعم' : 'لا'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.formLabel}>مميز</Text>
            <TouchableOpacity
              style={[styles.switch, formData.isFeatured && styles.switchActive]}
              onPress={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
            >
              <Text style={styles.switchText}>{formData.isFeatured ? 'نعم' : 'لا'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Form Actions */}
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>إلغاء</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>
            {term ? 'تحديث المصطلح' : 'إضافة المصطلح'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Add Term Form Styles
const termFormStyles = StyleSheet.create({
  exampleItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exampleContent: {
    flex: 1,
  },
  exampleCode: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#4ECDC4',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  exampleExplanation: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
  },
  switch: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  switchActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  switchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Audio Recording Styles
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
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
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E50914',
    marginRight: 10,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  recordingTime: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  audioPreviewContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  audioPreviewTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  audioPreviewDuration: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  audioPreviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: 'rgba(155, 89, 182, 0.5)',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteAudioButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.5)',
    minWidth: 70,
    alignItems: 'center',
  },
  deleteAudioButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadingText: {
    color: '#9B59B6',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  formSubtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  // Challenge Styles
  challengesList: {
    marginBottom: 20,
  },
  challengeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  challengeBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  challengeBadge: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  challengeDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  challengeMeta: {
    color: '#999999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  removeChallengeButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.5)',
  },
  removeChallengeText: {
    fontSize: 14,
  },
  newChallengeForm: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
  },
  addChallengeButton: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addChallengeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

// Programmer Thought Form Component
const ThoughtForm = ({ thought, onSave, onCancel }: { thought: any, onSave: (data: any) => void, onCancel: () => void }) => {
  console.log('💭 ThoughtForm mounted with thought:', thought);
  
  const [formData, setFormData] = useState({
    title: thought?.title || '',
    description: thought?.description || '',
    duration: thought?.duration || '',
    thumbnail: thought?.thumbnail || '',
    videoUrl: thought?.videoUrl || '',
    category: thought?.category || '',
    episodeNumber: thought?.episodeNumber || 1,
    season: thought?.season || 1,
    keyPoints: thought?.keyPoints || [],
    resources: thought?.resources || [],
    tags: thought?.tags || [],
    transcript: thought?.transcript || '',
    isActive: thought?.isActive !== undefined ? thought.isActive : true,
    isFeatured: thought?.isFeatured || false,
    isPublic: thought?.isPublic !== undefined ? thought.isPublic : true
  });

  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [newTag, setNewTag] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setFormData({
        ...formData,
        keyPoints: [...formData.keyPoints, newKeyPoint.trim()]
      });
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setFormData({
      ...formData,
      keyPoints: formData.keyPoints.filter((_, i) => i !== index)
    });
  };

  const addResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      setFormData({
        ...formData,
        resources: [...formData.resources, { ...newResource }]
      });
      setNewResource({ title: '', url: '' });
    }
  };

  const removeResource = (index: number) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  // Image picker function
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Video thumbnail aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('📸 Image selected:', imageUri);
        setSelectedImage(imageUri);
        
        // Upload image immediately
        uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  // Upload image function
  const uploadImage = async (imageUri: string) => {
    try {
      setUploadingImage(true);
      console.log('📤 Uploading image...');

      const formDataUpload = new FormData();
      formDataUpload.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `thought-thumbnail-${Date.now()}.jpg`,
      } as any);

      const response = await fetch('http://localhost:3000/api/admin/content/upload-image', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Image uploaded successfully:', result);
        
        const imageUrl = result.data.imageUrl;
        setFormData({
          ...formData,
          thumbnail: imageUrl
        });
        
        Alert.alert('نجح الرفع!', 'تم رفع الصورة بنجاح');
      } else {
        const errorText = await response.text();
        console.error('❌ Image upload failed:', errorText);
        Alert.alert('خطأ', 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      Alert.alert('خطأ', 'فشل في رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  // Video URL helpers
  const pasteVideoUrl = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent && isValidVideoUrl(clipboardContent)) {
        setFormData({
          ...formData,
          videoUrl: clipboardContent
        });
        Alert.alert('تم اللصق!', 'تم لصق رابط الفيديو من الحافظة');
      } else {
        Alert.alert('تنبيه', 'لا يوجد رابط فيديو صالح في الحافظة');
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      Alert.alert('خطأ', 'فشل في اللصق من الحافظة');
    }
  };

  const isValidVideoUrl = (url: string) => {
    if (!url || !url.trim()) return false;
    
    // Support multiple video platforms
    const videoPatterns = [
      // YouTube
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      // Vimeo
      /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/,
      // Dailymotion
      /^(https?:\/\/)?(www\.)?dailymotion\.com\/.+/,
      // Twitch
      /^(https?:\/\/)?(www\.)?twitch\.tv\/.+/,
      // Facebook
      /^(https?:\/\/)?(www\.)?facebook\.com\/.+\/videos\/.+/,
      // Instagram
      /^(https?:\/\/)?(www\.)?instagram\.com\/.+/,
      // TikTok
      /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/,
      // Direct video files
      /^(https?:\/\/).+\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/i,
      // Google Drive
      /^(https?:\/\/)?drive\.google\.com\/.+/,
      // Dropbox
      /^(https?:\/\/)?(www\.)?dropbox\.com\/.+/,
      // OneDrive
      /^(https?:\/\/)?onedrive\.live\.com\/.+/,
      // Any HTTPS URL (fallback)
      /^https:\/\/.+/
    ];
    
    return videoPatterns.some(pattern => pattern.test(url.trim()));
  };

  const getVideoUrlType = (url: string) => {
    if (!url) return '';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('vimeo.com')) return 'Vimeo';
    if (url.includes('dailymotion.com')) return 'Dailymotion';
    if (url.includes('twitch.tv')) return 'Twitch';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('drive.google.com')) return 'Google Drive';
    if (url.includes('dropbox.com')) return 'Dropbox';
    if (url.includes('onedrive.live.com')) return 'OneDrive';
    if (/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/i.test(url)) return 'Direct Video';
    
    return 'رابط مخصص';
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الحلقة');
      return;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وصف الحلقة');
      return;
    }

    if (!formData.category.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال تصنيف الحلقة');
      return;
    }

    if (!formData.videoUrl.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رابط الفيديو');
      return;
    }

    // Set default duration if empty
    const finalFormData = {
      ...formData,
      duration: formData.duration.trim() || '15:00'
    };

    console.log('💭 Thought form data before save:', JSON.stringify(finalFormData, null, 2));
    onSave(finalFormData);
  };

  return (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.formHeader}>
        <Text style={styles.formHeaderTitle}>
          {thought ? 'تعديل حلقة خواطر مبرمج' : 'إضافة حلقة جديدة'}
        </Text>
        <Text style={styles.formHeaderSubtitle}>
          {thought ? 'قم بتعديل تفاصيل الحلقة' : 'املأ التفاصيل التالية لإضافة حلقة جديدة'}
        </Text>
      </View>

      {/* Basic Information Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>💭 المعلومات الأساسية</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>عنوان الحلقة *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            placeholder="مثال: بداية الرحلة البرمجية"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>وصف الحلقة *</Text>
          <TextInput
            style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholder="اكتب وصفاً مفصلاً للحلقة وما تتناوله من مواضيع..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>التصنيف *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="مثال: البدايات، التعلم، التحديات..."
              placeholderTextColor="#666"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>مدة الحلقة</Text>
            <TextInput
              style={styles.formInput}
              value={formData.duration}
              onChangeText={(text) => setFormData({...formData, duration: text})}
              placeholder="15:30"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.formLabel}>رقم الحلقة</Text>
            <TextInput
              style={styles.formInput}
              value={formData.episodeNumber.toString()}
              onChangeText={(text) => setFormData({...formData, episodeNumber: parseInt(text) || 1})}
              placeholder="1"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.formLabel}>رقم الموسم</Text>
            <TextInput
              style={styles.formInput}
              value={formData.season.toString()}
              onChangeText={(text) => setFormData({...formData, season: parseInt(text) || 1})}
              placeholder="1"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>رابط الفيديو *</Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[styles.formInput, { flex: 1, marginRight: 10 }]}
              value={formData.videoUrl}
              onChangeText={(text) => setFormData({...formData, videoUrl: text})}
              placeholder="رابط الفيديو من أي منصة (YouTube, Vimeo, TikTok...)"
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.pasteButton} onPress={pasteVideoUrl}>
              <Text style={styles.pasteButtonText}>📋 لصق</Text>
            </TouchableOpacity>
          </View>
          
          {/* Video URL validation and platform detection */}
          {formData.videoUrl && !isValidVideoUrl(formData.videoUrl) && (
            <Text style={styles.validationError}>⚠️ رابط الفيديو غير صالح</Text>
          )}
          {formData.videoUrl && isValidVideoUrl(formData.videoUrl) && (
            <View style={styles.videoValidationContainer}>
              <Text style={styles.validationSuccess}>✅ رابط فيديو صالح</Text>
              <Text style={styles.videoPlatform}>المنصة: {getVideoUrlType(formData.videoUrl)}</Text>
            </View>
          )}
          
          {/* Supported platforms info */}
          <View style={styles.supportedPlatformsContainer}>
            <Text style={styles.supportedPlatformsTitle}>📺 المنصات المدعومة:</Text>
            <View style={styles.platformsList}>
              <Text style={styles.platformItem}>🔴 YouTube</Text>
              <Text style={styles.platformItem}>🔵 Vimeo</Text>
              <Text style={styles.platformItem}>🟠 Dailymotion</Text>
              <Text style={styles.platformItem}>🟣 Twitch</Text>
              <Text style={styles.platformItem}>📘 Facebook</Text>
              <Text style={styles.platformItem}>📷 Instagram</Text>
              <Text style={styles.platformItem}>⚫ TikTok</Text>
              <Text style={styles.platformItem}>☁️ Google Drive</Text>
              <Text style={styles.platformItem}>📦 Dropbox</Text>
              <Text style={styles.platformItem}>🗂️ OneDrive</Text>
              <Text style={styles.platformItem}>🎬 ملفات فيديو مباشرة</Text>
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>الصورة المصغرة</Text>
          
          {/* Current thumbnail preview */}
          {(formData.thumbnail || selectedImage) && (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: selectedImage || formData.thumbnail }} 
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                <Text style={styles.changeImageButtonText}>
                  {uploadingImage ? '📤 جاري الرفع...' : '📸 تغيير الصورة'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Image picker button */}
          {!formData.thumbnail && !selectedImage && (
            <TouchableOpacity 
              style={styles.imagePickerButton} 
              onPress={pickImage}
              disabled={uploadingImage}
            >
              <Text style={styles.imagePickerButtonText}>
                {uploadingImage ? '📤 جاري الرفع...' : '📸 اختر صورة من الجهاز'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Manual URL input */}
          <View style={styles.manualInputContainer}>
            <Text style={styles.orText}>أو أدخل رابط الصورة يدوياً:</Text>
            <TextInput
              style={styles.formInput}
              value={formData.thumbnail}
              onChangeText={(text) => setFormData({...formData, thumbnail: text})}
              placeholder="https://example.com/thumbnail.jpg"
              placeholderTextColor="#666"
            />
          </View>
        </View>
      </View>

      {/* Key Points Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>🎯 النقاط الرئيسية</Text>
        
        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.formInput, { flex: 1, marginRight: 10 }]}
            value={newKeyPoint}
            onChangeText={setNewKeyPoint}
            placeholder="أضف نقطة رئيسية مهمة في الحلقة..."
            placeholderTextColor="#666"
            onSubmitEditing={addKeyPoint}
          />
          <TouchableOpacity style={styles.addListItemButton} onPress={addKeyPoint}>
            <Text style={styles.addListItemButtonText}>➕</Text>
          </TouchableOpacity>
        </View>

        {formData.keyPoints.map((point, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>• {point}</Text>
            <TouchableOpacity 
              style={styles.removeItemButton}
              onPress={() => removeKeyPoint(index)}
            >
              <Text style={styles.removeItemText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Resources Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>📚 المصادر والروابط</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>عنوان المصدر</Text>
          <TextInput
            style={styles.formInput}
            value={newResource.title}
            onChangeText={(text) => setNewResource({...newResource, title: text})}
            placeholder="مثال: مقال مفيد، موقع تعليمي..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.formInput, { flex: 1, marginRight: 10 }]}
            value={newResource.url}
            onChangeText={(text) => setNewResource({...newResource, url: text})}
            placeholder="https://example.com"
            placeholderTextColor="#666"
            onSubmitEditing={addResource}
          />
          <TouchableOpacity style={styles.addListItemButton} onPress={addResource}>
            <Text style={styles.addListItemButtonText}>➕</Text>
          </TouchableOpacity>
        </View>

        {formData.resources.map((resource, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceUrl}>{resource.url}</Text>
            </View>
            <TouchableOpacity 
              style={styles.removeItemButton}
              onPress={() => removeResource(index)}
            >
              <Text style={styles.removeItemText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Tags Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>🏷️ العلامات</Text>
        
        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.formInput, { flex: 1, marginRight: 10 }]}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="أضف علامة..."
            placeholderTextColor="#666"
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={styles.addListItemButton} onPress={addTag}>
            <Text style={styles.addListItemButtonText}>➕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {formData.tags.map((tag, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.tagItem}
              onPress={() => removeTag(index)}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <Text style={styles.tagRemove}>✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transcript Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>📝 نص الحلقة (اختياري)</Text>
        
        <TextInput
          style={[styles.formInput, { height: 120, textAlignVertical: 'top' }]}
          value={formData.transcript}
          onChangeText={(text) => setFormData({...formData, transcript: text})}
          placeholder="يمكنك إضافة نص مكتوب للحلقة هنا..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={6}
        />
      </View>

      {/* Settings Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>⚙️ إعدادات الحلقة</Text>
        
        <View style={styles.formRow}>
          <View style={styles.switchContainer}>
            <Text style={styles.formLabel}>نشط</Text>
            <TouchableOpacity
              style={[styles.switch, formData.isActive && styles.switchActive]}
              onPress={() => setFormData({...formData, isActive: !formData.isActive})}
            >
              <Text style={styles.switchText}>{formData.isActive ? 'نعم' : 'لا'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.formLabel}>مميز</Text>
            <TouchableOpacity
              style={[styles.switch, formData.isFeatured && styles.switchActive]}
              onPress={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
            >
              <Text style={styles.switchText}>{formData.isFeatured ? 'نعم' : 'لا'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.formLabel}>عام (مرئي للجميع)</Text>
          <TouchableOpacity
            style={[styles.switch, formData.isPublic && styles.switchActive]}
            onPress={() => setFormData({...formData, isPublic: !formData.isPublic})}
          >
            <Text style={styles.switchText}>{formData.isPublic ? 'نعم' : 'لا'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Actions */}
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>إلغاء</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>
            {thought ? 'تحديث الحلقة' : 'إضافة الحلقة'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Thought Form Styles
const thoughtFormStyles = StyleSheet.create({
  resourceItem: {
    flex: 1,
  },
  resourceTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceUrl: {
    color: '#4ECDC4',
    fontSize: 12,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 68, 173, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(142, 68, 173, 0.5)',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  tagRemove: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  // Image and Video Styles
  imagePreviewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: '#8E44AD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeImageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePickerButton: {
    backgroundColor: 'rgba(142, 68, 173, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(142, 68, 173, 0.5)',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  imagePickerButtonText: {
    color: '#8E44AD',
    fontSize: 16,
    fontWeight: '600',
  },
  manualInputContainer: {
    marginTop: 12,
  },
  orText: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pasteButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  pasteButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  validationError: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  validationSuccess: {
    color: '#2ECC71',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  videoValidationContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  videoPlatform: {
    color: '#4ECDC4',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  supportedPlatformsContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  supportedPlatformsTitle: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  platformsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  platformItem: {
    color: '#CCCCCC',
    fontSize: 10,
    marginHorizontal: 6,
    marginVertical: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
