import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    Linking,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import CertificateCard from '../components/CertificateCard';
import { buildCertificateHtml, getCertificateFields } from '../utils/certificate';
import resolveMediaUrl from '../utils/mediaUrl';
import { isContentLocked } from '../utils/contentAccess';
import {
  fetchSubscriptionAccess,
  showPremiumGateAlert,
} from '../utils/subscriptionAccess';
import { showSignInAlert } from '../hooks/useAuthGuard';
import { getWebViewSource, needsWebView } from '../utils/videoPlayback';
import { useUser } from '../contexts/UserContext';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';
import { recordActivityDay } from '../utils/learningProgress';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { goBackOr } from '../utils/navigation';
import { resolveProjectRules } from '../utils/projectRules';

const { width, height } = Dimensions.get('window');

function cleanProjectUrl(value: string) {
  let next = String(value || '').trim();
  next = next.replace(/^\/+(https?:\/\/)/i, '$1');
  if (next && !/^https?:\/\//i.test(next) && /^[\w.-]+\.[a-z]{2,}/i.test(next)) {
    next = `https://${next}`;
  }
  return next;
}

function courseProgressKey(courseId: string, userId?: string) {
  return `yone_course_progress_v1:${userId || 'guest'}:${courseId}`;
}

interface CourseVideo {
  id: string;
  title: string;
  duration: string;
  url: string;
  thumbnail: string;
  description: string;
  isCompleted: boolean;
  category: string;
  isLocked?: boolean;
}

interface CourseTask {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'project';
  points: number;
  dueDate: string;
  isCompleted: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  isCompleted: boolean;
  isLocked: boolean;
}

interface CourseReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export default function CourseDetailsScreen() {
  const { courseId } = useLocalSearchParams();
  const { user } = useUser();
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionAccess, setSubscriptionAccess] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [extraUrl, setExtraUrl] = useState('');
  const [submittingProject, setSubmittingProject] = useState(false);
  const [projectSubmission, setProjectSubmission] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const certCaptureRef = useRef<View>(null);

  const certificateFields = getCertificateFields({
    course,
    projectSubmission,
    fullName,
    user,
  });

  const downloadCertificatePdf = async () => {
    try {
      setDownloadingCertificate(true);
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Certificate', 'Sharing is not available on this device.');
        return;
      }

      if (certCaptureRef.current) {
        const uri = await captureRef(certCaptureRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          pixelRatio: 3,
        });
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
          dialogTitle: 'Download certificate',
        });
        return;
      }

      const html = buildCertificateHtml(certificateFields);
      const file = await Print.printToFileAsync({
        html,
        width: 842,
        height: 595,
        margins: { left: 0, top: 0, right: 0, bottom: 0 },
      });
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Download certificate PDF',
      });
    } catch (error) {
      console.error('Certificate PDF error:', error);
      Alert.alert('Certificate', 'Could not create the certificate. Try again.');
    } finally {
      setDownloadingCertificate(false);
    }
  };

  // Generate course videos from course sections and lessons
  const courseVideos: CourseVideo[] = React.useMemo(() => {
    if (!course?.sections || course.sections.length === 0) {
      if (!course?.previewVideo?.trim()) {
        return [];
      }
      return [
        {
          id: '1',
          title: 'مقدمة الكورس',
          duration: '15:30',
          url: course.previewVideo.trim(),
          thumbnail: course?.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          description: course?.description || 'مقدمة عن الكورس',
          isCompleted: false,
          category: 'مقدمة'
        }
      ];
    }

    return course.sections.flatMap((section: any, sectionIndex: number) => 
      section.lessons?.map((lesson: any, lessonIndex: number) => ({
        id: `${sectionIndex}-${lessonIndex}`,
        title: lesson.title || `درس ${lessonIndex + 1}`,
        duration: lesson.duration || '10:00',
        url: lesson.videoUrl?.trim() || course?.previewVideo?.trim() || '',
        thumbnail: lesson.thumbnail || course?.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        description: lesson.description || lesson.title || 'وصف الدرس',
        isCompleted: Boolean(lesson.isCompleted),
        category: section.title || `القسم ${sectionIndex + 1}`,
        accessType: lesson.accessType || course?.accessType || 'free',
        isLocked: isContentLocked(
          { accessType: lesson.accessType || course?.accessType || 'free' },
          hasActiveSubscription
        ),
      })) || []
    );
  }, [course, hasActiveSubscription]);

  // Fetch course details from API
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/courses/${courseId}`);
        if (response.ok) {
          const result = await response.json();
          setCourse({
            ...result.data.course,
            thumbnail: resolveMediaUrl(result.data.course.thumbnail || result.data.course.image),
            image: resolveMediaUrl(result.data.course.image || result.data.course.thumbnail),
          });
        } else {
          console.error('Failed to fetch course details');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  useEffect(() => {
    const id = String(courseId || '');
    if (!id) return;
    const userId = String((user as any)?._id || (user as any)?.id || '');
    AsyncStorage.getItem(courseProgressKey(id, userId))
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setWatchedVideoIds(parsed.map(String));
        }
      })
      .catch(() => {});
  }, [courseId, user]);

  const markVideoWatched = useCallback((videoId: string) => {
    const id = String(courseId || '');
    if (!id || !videoId) return;
    const userId = String((user as any)?._id || (user as any)?.id || '');
    setWatchedVideoIds((prev) => {
      if (prev.includes(videoId)) return prev;
      const next = [...prev, videoId];
      AsyncStorage.setItem(courseProgressKey(id, userId), JSON.stringify(next)).catch(() => {});
      recordActivityDay(userId);
      return next;
    });
  }, [courseId, user]);

  // Set expanded categories based on course sections
  useEffect(() => {
    if (course?.sections) {
      const categories: Record<string, boolean> = {};
      course.sections.forEach((section: any, index: number) => {
        const categoryName = section.title || `القسم ${index + 1}`;
        categories[categoryName] = index === 0; // Open first section by default
      });
      setExpandedCategories(categories);
    }
  }, [course]);

  // Check user subscription + pending request status (refresh when screen focused)
  useFocusEffect(
    useCallback(() => {
      const checkSubscription = async () => {
        if (!user) {
          setSubscriptionLoading(false);
          return;
        }

        try {
          const access = await fetchSubscriptionAccess();
          setSubscriptionAccess(access);
          setHasActiveSubscription(access.hasActiveSubscription);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setHasActiveSubscription(false);
          setSubscriptionAccess({ status: 'none', hasActiveSubscription: false });
        } finally {
          setSubscriptionLoading(false);
        }
      };

      checkSubscription();
    }, [user])
  );

  const loadProjectSubmission = useCallback(async () => {
    if (!user || !courseId) {
      setProjectSubmission(null);
      return;
    }
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/course-projects/${courseId}/mine`
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setProjectSubmission(data?.data?.submission || null);
        const current = data?.data?.submission;
        if (current?.fullName) {
          setFullName(current.fullName);
        } else {
          const accountName = String(user?.name || '').trim().replace(/\s+/g, ' ');
          if (accountName.split(' ').filter(Boolean).length >= 2) {
            setFullName(accountName);
          }
        }
        if (current?.githubUrl) setGithubUrl(current.githubUrl);
        if (current?.liveUrl) setLiveUrl(current.liveUrl);
        if (current?.videoUrl) setVideoUrl(current.videoUrl);
        if (current?.extraUrl) setExtraUrl(current.extraUrl);
      }
    } catch {
      // Keep the form usable even if the inbox API is not deployed yet.
    }
  }, [user, courseId]);

  useFocusEffect(
    useCallback(() => {
      loadProjectSubmission();
    }, [loadProjectSubmission])
  );

  const watchedSet = React.useMemo(() => new Set(watchedVideoIds), [watchedVideoIds]);
  const totalVideos = courseVideos.length;
  const watchedCount = courseVideos.filter((video) => watchedSet.has(video.id) || video.isCompleted).length;
  const progressPercent = totalVideos ? Math.round((watchedCount / totalVideos) * 100) : 0;
  const isCourseComplete = totalVideos > 0 && watchedCount >= totalVideos;
  const projectRules = React.useMemo(() => resolveProjectRules(course || {}), [course]);

  // Show loading screen if course data is not loaded yet
  if (loading || !course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        {/* The tab bar is hidden on pushed screens, so this branch needs its
            own way out — otherwise a slow or failed fetch traps the user. */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => goBackOr('/(tabs)/courses')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const courseTasks: CourseTask[] = [
    {
      id: '1',
      title: 'Build Your First React Native App',
      description: 'Create a simple todo app using React Native components and state management.',
      type: 'project',
      points: 100,
      dueDate: '2024-01-15',
      isCompleted: true,
      difficulty: 'easy'
    },
    {
      id: '2',
      title: 'Navigation Quiz',
      description: 'Test your understanding of React Native navigation concepts.',
      type: 'quiz',
      points: 50,
      dueDate: '2024-01-20',
      isCompleted: false,
      difficulty: 'medium'
    },
    {
      id: '3',
      title: 'API Integration Assignment',
      description: 'Integrate a REST API with your React Native application.',
      type: 'assignment',
      points: 150,
      dueDate: '2024-01-25',
      isCompleted: false,
      difficulty: 'hard'
    }
  ];

  const courseReviews: CourseReview[] = [
    {
      id: '1',
      userName: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent course! The instructor explains everything clearly and the projects are very practical.',
      date: '2 weeks ago',
      helpful: 24
    },
    {
      id: '2',
      userName: 'Mike Chen',
      rating: 4,
      comment: 'Great content, but some sections could be more detailed. Overall very helpful for beginners.',
      date: '1 month ago',
      helpful: 18
    },
    {
      id: '3',
      userName: 'Emily Davis',
      rating: 5,
      comment: 'Perfect course structure and pace. I was able to build my first app after completing this course.',
      date: '1 month ago',
      helpful: 31
    }
  ];

  const handleVideoPress = (video: CourseVideo) => {
    if (video.isLocked && !user) {
      showSignInAlert('videos');
    } else if (video.isLocked) {
      showPremiumGateAlert(subscriptionAccess, router, 'videos');
    } else {
      setIsVideoLoading(true);
      setSelectedVideo(video);
      setShowVideoModal(true);
    }
  };

  const closeVideo = () => {
    if (selectedVideo?.id) {
      markVideoWatched(selectedVideo.id);
    }
    setShowVideoModal(false);
    setIsVideoLoading(false);
  };

  const submitProject = async () => {
    if (!user || !courseId) {
      showSignInAlert('courses');
      return;
    }
    if (!isCourseComplete) {
      Alert.alert(
        'أكمل الكورس أولاً',
        `لازم تخلّص كل الدروس قبل تسليم المشروع. (${watchedCount} من ${totalVideos})`
      );
      return;
    }
    const name = fullName.trim().replace(/\s+/g, ' ');
    if (name.split(' ').filter(Boolean).length < 2) {
      Alert.alert('الاسم', 'اكتب اسمك ثنائي: الاسم الأول واسم العائلة.');
      return;
    }
    try {
      setSubmittingProject(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/course-projects/${String(courseId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: name,
            githubUrl: cleanProjectUrl(githubUrl),
            liveUrl: cleanProjectUrl(liveUrl),
            videoUrl: cleanProjectUrl(videoUrl),
            extraUrl: cleanProjectUrl(extraUrl),
          }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        Alert.alert('Could not submit', data?.message || 'Check the required links and try again.');
        return;
      }
      setProjectSubmission(data?.data?.submission || { status: 'pending', githubUrl, liveUrl });
      setShowProjectForm(false);
      Alert.alert('Submitted', 'Your project is waiting for review. The certificate opens only after approval.');
    } catch {
      Alert.alert('Error', 'Could not submit the project.');
    } finally {
      setSubmittingProject(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    // In real app, this would call API to enroll user
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={styles.star}>
        {i < Math.floor(rating) ? '⭐' : '☆'}
      </Text>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOr('/(tabs)/courses')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <ImageBackground
          source={{ uri: course.image || course.thumbnail || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.courseBadge}>
                <Text style={styles.badgeText}>{course.category}</Text>
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseInstructor}>by {course.instructor}</Text>
              
              <View style={styles.courseStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={styles.statText}>{course.rating || 4.8}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>👥</Text>
                  <Text style={styles.statText}>{(course.students || 15420).toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⏱️</Text>
                  <Text style={styles.statText}>{course.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>📚</Text>
                  <Text style={styles.statText}>{course.level}</Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                {(course.price || 0) === 0 ? (
                  <Text style={styles.freePrice}>FREE</Text>
                ) : (
                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>${course.price}</Text>
                    <Text style={styles.originalPrice}>${course.originalPrice || 0}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {['overview', 'videos', 'challenges', 'instructor', 'reviews'].map((tab) => (
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
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
            {course.learningOutcomes?.map((item, index) => (
              <View key={index} style={styles.learningItem}>
                <Text style={styles.learningBullet}>✓</Text>
                <Text style={styles.learningText}>{item}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Requirements</Text>
            {course.requirements?.map((item, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={styles.requirementBullet}>•</Text>
                <Text style={styles.requirementText}>{item}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Course Description</Text>
            <Text style={styles.descriptionText}>{course.description}</Text>

            <View style={styles.learningPathSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Progress</Text>
                <Text style={styles.sectionSubtitle}>Updates when you close a video</Text>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.progressPercent}>{totalVideos ? `${progressPercent}%` : '—'}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {totalVideos
                    ? `${watchedCount} of ${totalVideos} videos watched`
                    : 'No videos in this course yet'}
                </Text>
              </View>

              <View style={styles.modulesGrid}>
                {courseVideos.slice(0, 6).map((video) => {
                  const done = watchedSet.has(video.id) || video.isCompleted;
                  return (
                    <TouchableOpacity
                      key={video.id}
                      style={[
                        styles.moduleCard,
                        done && styles.moduleCompleted,
                        video.isLocked && styles.moduleLocked,
                      ]}
                      onPress={() => handleVideoPress(video)}
                    >
                      <View style={styles.moduleIcon}>
                        <Text style={styles.moduleIconText}>
                          {done ? '✅' : video.isLocked ? '🔒' : '▶'}
                        </Text>
                      </View>
                      <Text style={styles.moduleTitle} numberOfLines={2}>{video.title}</Text>
                      <Text style={styles.moduleDuration}>{video.duration}</Text>
                      <View style={styles.moduleProgress}>
                        <View style={[
                          styles.moduleProgressBar,
                          { width: done ? '100%' : '0%' },
                        ]} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'videos' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎬 Course Videos</Text>
              <Text style={styles.sectionSubtitle}>
                {totalVideos ? `${watchedCount} of ${totalVideos} watched · ${progressPercent}%` : 'Watch and learn at your own pace'}
              </Text>
            </View>

            <View style={styles.videosList}>
              {(() => {
                // Group videos by category
                const groupedVideos = courseVideos.reduce((acc, video) => {
                  if (!acc[video.category]) {
                    acc[video.category] = [];
                  }
                  acc[video.category].push(video);
                  return acc;
                }, {} as Record<string, CourseVideo[]>);

                return Object.entries(groupedVideos).map(([category, videos]) => (
                  <View key={category} style={styles.videoCategorySection}>
                    <TouchableOpacity 
                      style={styles.videoCategoryHeader}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={styles.videoCategoryTitle}>{category}</Text>
                      <View style={styles.videoCategoryHeaderRight}>
                        <Text style={styles.videoCategoryCount}>{videos.length} videos</Text>
                        <Text style={styles.expandIcon}>
                          {expandedCategories[category] ? '▼' : '▶'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    {expandedCategories[category] && (
                      <>
                        {videos.map((video, index) => (
                          <TouchableOpacity
                            key={video.id}
                            style={[
                              styles.videoHeadline,
                              index === videos.length - 1 && styles.lastVideoHeadline
                            ]}
                            onPress={() => handleVideoPress(video)}
                          >
                            <View style={styles.videoHeadlineLeft}>
                              <View style={styles.videoHeadlineThumbnail}>
                                <ImageBackground
                                  source={{ uri: video.thumbnail }}
                                  style={styles.videoHeadlineImage}
                                  resizeMode="cover"
                                >
                                  <LinearGradient
                                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                                    style={styles.videoHeadlineGradient}
                                  >
                                    <View style={styles.videoHeadlinePlayButton}>
                                      <Text style={styles.videoHeadlinePlayIcon}>▶</Text>
                                    </View>
                                    <View style={styles.videoHeadlineDuration}>
                                      <Text style={styles.videoHeadlineDurationText}>{video.duration}</Text>
                                    </View>
                                  </LinearGradient>
                                </ImageBackground>
                              </View>
                            </View>
                            
                            <View style={styles.videoHeadlineContent}>
                              <View style={styles.videoHeadlineHeader}>
                                <Text style={styles.videoHeadlineTitle} numberOfLines={2}>{video.title}</Text>
                                {(watchedSet.has(video.id) || video.isCompleted) && (
                                  <View style={styles.videoHeadlineCompleted}>
                                    <Text style={styles.videoHeadlineCompletedText}>✓</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.videoHeadlineDescription} numberOfLines={2}>{video.description}</Text>
                              <View style={styles.videoHeadlineMeta}>
                                <Text style={styles.videoHeadlineMetaText}>Video {index + 1}</Text>
                                <Text style={styles.videoHeadlineMetaText}>•</Text>
                                <Text style={styles.videoHeadlineMetaText}>{video.duration}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                        
                        {/* Challenge after each category */}
                        <View style={styles.categoryChallenge}>
                          <View style={styles.challengeHeader}>
                            <Text style={styles.challengeIcon}>🏆</Text>
                            <Text style={styles.challengeTitle}>تحدي {category}</Text>
                          </View>
                          <Text style={styles.challengeDescription}>
                            {category === 'JavaScript Basics' && 'قم بإنشاء آلة حاسبة تفاعلية باستخدام JavaScript'}
                            {category === 'React Native Fundamentals' && 'أنشئ تطبيق قائمة مهام بسيط باستخدام React Native'}
                            {category === 'Advanced Concepts' && 'طور تطبيق دردشة في الوقت الفعلي مع Firebase'}
                          </Text>
                          <View style={styles.challengeMeta}>
                            <Text style={styles.challengeDifficulty}>متوسط</Text>
                            <Text style={styles.challengeTime}>⏱️ 2-3 ساعات</Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                ));
              })()}
            </View>
          </View>
        )}

        {activeTab === 'challenges' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Final Project</Text>
              <Text style={styles.sectionSubtitle}>Submit your work for certificate review</Text>
            </View>

            <View style={styles.graduationProject}>
              <View style={styles.projectHeader}>
                <View style={styles.projectIconContainer}>
                  <Text style={styles.projectIcon}>🚀</Text>
                </View>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle}>
                    {course.challenges?.[0]?.title || `${course.title} Project`}
                  </Text>
                  <Text style={styles.projectSubtitle}>Graduation project</Text>
                </View>
              </View>

              <Text style={styles.projectDescription}>
                {course.challenges?.[0]?.description || projectRules.hint}
              </Text>

              <View style={styles.projectMeta}>
                <View style={styles.projectMetaItem}>
                  <Text style={styles.projectMetaIcon}>📂</Text>
                  <Text style={styles.projectMetaText}>
                    {projectRules.githubRequired ? `${projectRules.labels.github} required` : `${projectRules.labels.github} optional`}
                  </Text>
                </View>
                <View style={styles.projectMetaItem}>
                  <Text style={styles.projectMetaIcon}>🔗</Text>
                  <Text style={styles.projectMetaText}>
                    {projectRules.liveRequired ? `${projectRules.labels.live} required` : `${projectRules.labels.live} optional`}
                  </Text>
                </View>
                <View style={styles.projectMetaItem}>
                  <Text style={styles.projectMetaIcon}>🎬</Text>
                  <Text style={styles.projectMetaText}>
                    {projectRules.videoRequired ? 'Video required' : 'Video optional'}
                  </Text>
                </View>
              </View>

              {projectSubmission?.status === 'pending' ? (
                <Text style={styles.projectStatus}>Submitted · waiting for review</Text>
              ) : null}
              {projectSubmission?.status === 'rejected' ? (
                <Text style={styles.projectStatusRejected}>
                  Rejected{projectSubmission.adminNote ? ` · ${projectSubmission.adminNote}` : ''}. You can resubmit.
                </Text>
              ) : null}
              {projectSubmission?.status === 'approved' ? (
                <Text style={styles.projectStatusApproved}>Approved · your certificate is ready</Text>
              ) : null}

              {projectSubmission?.status === 'approved' ? (
                <View style={styles.certificateReady}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => setShowCertificate(true)}
                  >
                    <View ref={certCaptureRef} collapsable={false} style={{ width: '100%', overflow: 'hidden' }}>
                      <CertificateCard fields={certificateFields} compact />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.certOpenHint}>اضغط على الشهادة لفتحها</Text>
                  <TouchableOpacity
                    style={[styles.projectButton, downloadingCertificate && { opacity: 0.6 }]}
                    onPress={downloadCertificatePdf}
                    disabled={downloadingCertificate}
                  >
                    <Text style={styles.projectButtonText}>
                      {downloadingCertificate ? 'Preparing...' : 'تحميل الشهادة'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.projectButton, !isCourseComplete && styles.projectButtonDisabled]}
                    disabled={!isCourseComplete}
                    onPress={() => {
                      if (!user) {
                        showSignInAlert('courses');
                        return;
                      }
                      if (!isCourseComplete) {
                        return;
                      }
                      setShowProjectForm(true);
                    }}
                  >
                    <Text style={styles.projectButtonText}>بدء تسليم المشروع</Text>
                  </TouchableOpacity>
                  <Text style={styles.projectHint}>
                    {isCourseComplete
                      ? 'إذا عديت نسبة 90% من المشروع هيتم الموافقة واستلام الشهادة.'
                      : `أكمل كل دروس الكورس أولاً عشان تقدر تسلّم المشروع. (${watchedCount} من ${totalVideos})`}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {activeTab === 'instructor' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👨‍🏫 Meet Your Instructor</Text>
              <Text style={styles.sectionSubtitle}>Learn from industry experts</Text>
            </View>

            <View style={styles.instructorSpotlight}>
              <View style={styles.instructorAvatarContainer}>
                <Text style={styles.instructorSpotlightAvatar}>{course.instructorAvatar || '👨‍💻'}</Text>
                <View style={styles.instructorVerified}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              </View>
              
              <View style={styles.instructorDetails}>
                <Text style={styles.instructorSpotlightName}>{course.instructor}</Text>
                <View style={styles.instructorStats}>
                  <View style={styles.instructorStat}>
                    <Text style={styles.instructorStatNumber}>{course.instructorRating || 4.9}</Text>
                    <Text style={styles.instructorStatLabel}>Rating</Text>
                  </View>
                  <View style={styles.instructorStat}>
                    <Text style={styles.instructorStatNumber}>{(course.instructorStudents || 25000).toLocaleString()}</Text>
                    <Text style={styles.instructorStatLabel}>Students</Text>
                  </View>
                  <View style={styles.instructorStat}>
                    <Text style={styles.instructorStatNumber}>8+</Text>
                    <Text style={styles.instructorStatLabel}>Years</Text>
                  </View>
                </View>
                <Text style={styles.instructorSpotlightBio}>{course.instructorBio || 'مطور محترف مع خبرة واسعة في تطوير التطبيقات'}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💬 Community Reviews</Text>
              <View style={styles.overallRating}>
                <Text style={styles.overallRatingNumber}>{course.rating || 4.8}</Text>
                <View style={styles.overallRatingStars}>
                  {renderStars(course.rating || 4.8)}
                </View>
                <Text style={styles.totalRatings}>({(course.totalRatings || 15420).toLocaleString()} reviews)</Text>
              </View>
            </View>

            <View style={styles.reviewsCarousel}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewsScroll}>
                {courseReviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerAvatarText}>
                          {review.userName.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.reviewerInfo}>
                        <Text style={styles.reviewerName}>{review.userName}</Text>
                        <View style={styles.reviewRating}>
                          {renderStars(review.rating)}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewCardComment} numberOfLines={4}>{review.comment}</Text>
                    <View style={styles.reviewCardFooter}>
                      <Text style={styles.reviewCardDate}>{review.date}</Text>
                      <TouchableOpacity style={styles.helpfulChip}>
                        <Text style={styles.helpfulChipText}>👍 {review.helpful}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}


      </ScrollView>

      <Modal
        visible={showProjectForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProjectForm(false)}
      >
        <View style={styles.projectFormOverlay}>
          <ScrollView style={{ maxHeight: '90%' }} contentContainerStyle={styles.projectFormCard}>
            <Text style={styles.projectFormTitle}>تسليم المشروع</Text>
            <Text style={styles.projectFormHint}>{projectRules.hint}</Text>
            <Text style={styles.projectFormLabel}>الاسم الثنائي (هيتكتب على الشهادة)</Text>
            <TextInput
              style={styles.projectFormInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="مثال: أحمد محمد"
              placeholderTextColor="#666"
              maxLength={80}
              autoCapitalize="words"
            />
            <Text style={styles.projectFormLabel}>
              {projectRules.labels.github} {projectRules.githubRequired ? '(required)' : '(optional)'}
            </Text>
            <TextInput
              style={styles.projectFormInput}
              value={githubUrl}
              onChangeText={setGithubUrl}
              placeholder="https://github.com/..."
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
            <Text style={styles.projectFormLabel}>
              {projectRules.labels.live} {projectRules.liveRequired ? '(required)' : '(optional)'}
            </Text>
            <TextInput
              style={styles.projectFormInput}
              value={liveUrl}
              onChangeText={setLiveUrl}
              placeholder="https://..."
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
            <Text style={styles.projectFormLabel}>
              {projectRules.labels.video} {projectRules.videoRequired ? '(required)' : '(optional)'}
            </Text>
            <TextInput
              style={styles.projectFormInput}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://youtube.com/... or Drive"
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
            {projectRules.extraRequired || projectRules.kind === 'design' || projectRules.kind === 'data' ? (
              <>
                <Text style={styles.projectFormLabel}>
                  {projectRules.labels.extra} {projectRules.extraRequired ? '(required)' : '(optional)'}
                </Text>
                <TextInput
                  style={styles.projectFormInput}
                  value={extraUrl}
                  onChangeText={setExtraUrl}
                  placeholder="https://..."
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                />
              </>
            ) : null}
            <TouchableOpacity
              style={[styles.projectButton, submittingProject && { opacity: 0.6 }]}
              onPress={submitProject}
              disabled={submittingProject}
            >
              <Text style={styles.projectButtonText}>
                {submittingProject ? 'Submitting...' : 'إرسال للمراجعة'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowProjectForm(false)}>
              <Text style={styles.projectFormCancel}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showCertificate}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCertificate(false)}
      >
        <View style={styles.certOverlay}>
          <View style={styles.certModalCard}>
            <CertificateCard fields={certificateFields} />
            <TouchableOpacity
              style={[styles.projectButton, downloadingCertificate && { opacity: 0.6 }]}
              onPress={downloadCertificatePdf}
              disabled={downloadingCertificate}
            >
              <Text style={styles.projectButtonText}>
                {downloadingCertificate ? 'Preparing...' : 'تحميل الشهادة'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.certCloseBtn} onPress={() => setShowCertificate(false)}>
              <Text style={styles.certCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideo}
      >
        <View style={styles.videoModal}>
          <LinearGradient
            colors={['#000000', '#1a1a1a', '#000000']}
            style={styles.videoModalGradient}
          >
            <View style={styles.videoHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeVideo}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
              <View style={styles.videoHeaderContent}>
                <Text style={styles.videoModalTitle}>{selectedVideo?.title}</Text>
                <Text style={styles.videoModalSubtitle}>Course Video</Text>
              </View>
              <TouchableOpacity style={styles.shareVideoButton}>
                <Text style={styles.shareVideoIcon}>📤</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.videoStage}>
              {selectedVideo && selectedVideo.url?.trim() ? (
                <>
                  {needsWebView(selectedVideo.url) ? (
                    <WebView
                      source={getWebViewSource(selectedVideo.url) || { uri: selectedVideo.url }}
                      style={styles.videoPlayerFlex}
                      originWhitelist={['*']}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                      domStorageEnabled
                      setSupportMultipleWindows={false}
                      startInLoadingState
                      onError={(error) => {
                        setIsVideoLoading(false);
                        Alert.alert(
                          'خطأ في الفيديو',
                          `Couldn't load this video.\n\nURL: ${selectedVideo.url}`
                        );
                        console.log('Course WebView error:', error);
                      }}
                      onHttpError={(event) => {
                        console.log('Course WebView HTTP error:', event.nativeEvent);
                      }}
                      onLoad={() => setIsVideoLoading(false)}
                      onLoadStart={() => setIsVideoLoading(true)}
                      onLoadEnd={() => setIsVideoLoading(false)}
                    />
                  ) : (
                    <Video
                      source={{ uri: selectedVideo.url }}
                      style={styles.videoPlayerFixed}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping={false}
                      useNativeControls
                      onError={(error) => {
                        setIsVideoLoading(false);
                        Alert.alert(
                          'خطأ في الفيديو',
                          `Couldn't load this video.\n\nURL: ${selectedVideo.url}`
                        );
                        console.log('Course video error:', error);
                      }}
                      onLoad={() => setIsVideoLoading(false)}
                      onLoadStart={() => setIsVideoLoading(true)}
                      onLoadEnd={() => setIsVideoLoading(false)}
                    />
                  )}
                  {isVideoLoading ? (
                    <View style={styles.videoLoading}>
                      <ActivityIndicator color="#E50914" size="large" />
                      <Text style={styles.videoLoadingText}>Loading video...</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.videoLoadingInline}>
                  <Text style={styles.videoLoadingText}>No video URL for this lesson</Text>
                </View>
              )}
            </View>
            
            <View style={styles.videoInfo}>
              <View style={styles.videoInfoHeader}>
                <Text style={styles.videoInfoTitle}>About This Video</Text>
                <View style={styles.videoInfoMeta}>
                  <Text style={styles.videoInfoDuration}>⏱️ {selectedVideo?.duration}</Text>
                  <Text style={styles.videoInfoType}>📹 Video Lesson</Text>
                </View>
              </View>
              <Text style={styles.videoModalDescription}>{selectedVideo?.description}</Text>
            </View>
          </LinearGradient>
        </View>
      </Modal>
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 9, 20, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
  },
  heroImage: {
    height: 300,
    width: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  courseBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  courseInstructor: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  courseStats: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  priceContainer: {
    marginTop: 10,
  },
  freePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: '#CCCCCC',
    textDecorationLine: 'line-through',
  },
  tabsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 9, 20, 0.2)',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  videosList: {
    marginTop: 15,
  },
  videoCategorySection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 0,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.1)',
    overflow: 'hidden',
  },
  videoCategoryHeader: {
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
  videoCategoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
    flex: 1,
  },
  videoCategoryCount: {
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
  videoHeadline: {
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
  videoHeadlineLeft: {
    marginRight: 15,
  },
  videoHeadlineThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoHeadlineImage: {
    width: '100%',
    height: '100%',
  },
  videoHeadlineGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoHeadlinePlayButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoHeadlinePlayIcon: {
    fontSize: 10,
    color: '#E50914',
    marginLeft: 1,
  },
  videoHeadlineDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoHeadlineDurationText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  videoHeadlineContent: {
    flex: 1,
  },
  videoHeadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  videoHeadlineTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  videoHeadlineCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoHeadlineCompletedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoHeadlineDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 18,
    marginBottom: 8,
  },
  videoHeadlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoHeadlineMetaText: {
    color: '#999999',
    fontSize: 12,
    marginRight: 8,
  },
  lastVideoHeadline: {
    borderBottomWidth: 0,
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
  projectButtonDisabled: {
    backgroundColor: '#3a3a3a',
    opacity: 0.7,
  },
  projectHint: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  projectStatus: {
    color: '#F59E0B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  projectStatusRejected: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  projectStatusApproved: {
    color: '#4ADE80',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  projectFormOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  projectFormCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  projectFormTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectFormHint: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  projectFormLabel: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 6,
  },
  projectFormInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  projectFormCancel: {
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  certificateReady: {
    width: '100%',
  },
  certOpenHint: {
    color: '#AAAAAA',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  certOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    padding: 16,
  },
  certModalCard: {
    alignItems: 'stretch',
    gap: 14,
  },
  certCloseBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  certCloseText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '600',
  },
  projectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  learningPathSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressPercent: {
    color: '#E50914',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 4,
  },
  progressText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moduleCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  moduleLocked: {
    opacity: 0.5,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleIconText: {
    fontSize: 18,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  moduleDuration: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  moduleProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  moduleProgressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  videoHubSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  videoCarousel: {
    marginTop: 15,
  },
  videoScroll: {
    paddingLeft: 0,
  },
  videoCard: {
    width: 280,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  videoCardThumbnail: {
    height: 160,
    width: '100%',
  },
  videoCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoCardPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCardPlayIcon: {
    fontSize: 20,
    color: '#E50914',
    marginLeft: 2,
  },
  videoCardDuration: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  videoCardDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  videoCardCompleted: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCardCompletedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoCardInfo: {
    padding: 12,
  },
  videoCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoCardDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  challengeSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  challengesGrid: {
    marginTop: 15,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeIconText: {
    fontSize: 18,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 18,
  },
  challengeStatus: {
    marginLeft: 10,
  },
  challengeCompleted: {
    fontSize: 20,
  },
  challengePending: {
    fontSize: 16,
    color: '#FF9800',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pointsChip: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructorSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructorSpotlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructorAvatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  instructorSpotlightAvatar: {
    fontSize: 48,
  },
  instructorVerified: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructorDetails: {
    flex: 1,
  },
  instructorSpotlightName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  instructorStats: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 20,
  },
  instructorStat: {
    alignItems: 'center',
  },
  instructorStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
  },
  instructorStatLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  instructorSpotlightBio: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  reviewsSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  reviewsCarousel: {
    marginTop: 15,
  },
  reviewsScroll: {
    paddingLeft: 0,
  },
  reviewCard: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewCardComment: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 10,
  },
  reviewCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCardDate: {
    color: '#666666',
    fontSize: 12,
  },
  helpfulChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  helpfulChipText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  tagsSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  tagChip: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  ctaContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  enrolledContainer: {
    alignItems: 'center',
  },
  enrolledText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  continueButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enrollButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  enrollGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  learningBullet: {
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  learningText: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementBullet: {
    color: '#E50914',
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  requirementText: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 22,
  },
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
    paddingTop: 80,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 9, 20, 0.2)',
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
    marginLeft: 15,
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
  videoStage: {
    flex: 1,
    minHeight: Math.round(height * 0.38),
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoPlayerFlex: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
  },
  videoPlayerFixed: {
    width: width,
    height: Math.round(width * 9 / 16),
    alignSelf: 'center',
    backgroundColor: '#000000',
  },
  videoLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 10,
  },
  videoLoadingInline: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  videoInfo: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 9, 20, 0.2)',
  },
  videoInfoHeader: {
    marginBottom: 15,
  },
  videoInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  videoInfoMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  videoInfoDuration: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
  },
  videoInfoType: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  videoModalDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overallRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E50914',
    marginRight: 10,
  },
  overallRatingStars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  totalRatings: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
