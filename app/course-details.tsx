import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface CourseVideo {
  id: string;
  title: string;
  duration: string;
  url: string;
  thumbnail: string;
  description: string;
  isCompleted: boolean;
  category: string;
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
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'JavaScript Basics': true,
    'React Native Fundamentals': true,
    'Advanced Concepts': true,
  });

  // Sample course data - in real app, this would come from API
  const course = {
    id: courseId || '1',
    title: 'Complete React Native Development',
    instructor: 'John Smith',
    instructorAvatar: '👨‍💻',
    instructorBio: 'Senior Mobile Developer with 8+ years experience in React Native, iOS, and Android development.',
    instructorRating: 4.9,
    instructorStudents: 25000,
    duration: '12 hours',
    level: 'Intermediate',
    rating: 4.8,
    totalRatings: 15420,
    students: 15420,
    price: 0,
    originalPrice: 199,
    category: 'Programming',
    language: 'English',
    lastUpdated: '2 weeks ago',
    description: 'Learn to build professional mobile applications with React Native from scratch. This comprehensive course covers everything from basic setup to advanced concepts like navigation, state management, and app deployment.',
    thumbnail: '📱',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    whatYouWillLearn: [
      'Build cross-platform mobile apps with React Native',
      'Master React Native navigation and routing',
      'Implement state management with Redux',
      'Integrate APIs and handle data fetching',
      'Deploy apps to App Store and Google Play',
      'Handle user authentication and security',
      'Optimize app performance and debugging',
      'Use modern React Native features and hooks'
    ],
    requirements: [
      'Basic knowledge of JavaScript and React',
      'Node.js installed on your computer',
      'Android Studio or Xcode for mobile development',
      'A computer with at least 8GB RAM',
      'Internet connection for downloading packages'
    ],
    tags: ['React Native', 'Mobile Development', 'JavaScript', 'Cross-Platform', 'iOS', 'Android']
  };

  const courseVideos: CourseVideo[] = [
    {
      id: '1',
      title: 'Introduction to React Native',
      duration: '15:30',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Get started with React Native development and understand the fundamentals.',
      isCompleted: true,
      category: 'JavaScript Basics'
    },
    {
      id: '2',
      title: 'JavaScript Fundamentals',
      duration: '22:45',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Learn the core concepts of JavaScript programming language.',
      isCompleted: true,
      category: 'JavaScript Basics'
    },
    {
      id: '3',
      title: 'ES6+ Features',
      duration: '28:15',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Master modern JavaScript features and syntax.',
      isCompleted: false,
      category: 'JavaScript Basics'
    },
    {
      id: '4',
      title: 'Setting Up Development Environment',
      duration: '35:20',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Learn how to set up your development environment for React Native.',
      isCompleted: false,
      category: 'React Native Fundamentals'
    },
    {
      id: '5',
      title: 'Components and Styling',
      duration: '32:10',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Master React Native components and styling techniques.',
      isCompleted: false,
      category: 'React Native Fundamentals'
    },
    {
      id: '6',
      title: 'Navigation and Routing',
      duration: '40:25',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Implement navigation and routing in your React Native apps.',
      isCompleted: false,
      category: 'React Native Fundamentals'
    },
    {
      id: '7',
      title: 'State Management with Redux',
      duration: '45:15',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Learn how to manage application state with Redux.',
      isCompleted: false,
      category: 'Advanced Concepts'
    },
    {
      id: '8',
      title: 'API Integration',
      duration: '38:30',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      description: 'Connect your app to external APIs and handle data.',
      isCompleted: false,
      category: 'Advanced Concepts'
    }
  ];

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

  const courseLessons: CourseLesson[] = [
    { id: '1', title: 'Introduction to React Native', duration: '15:30', type: 'video', isCompleted: true, isLocked: false },
    { id: '2', title: 'Setting Up Development Environment', duration: '22:45', type: 'video', isCompleted: true, isLocked: false },
    { id: '3', title: 'Components and Styling', duration: '28:15', type: 'video', isCompleted: false, isLocked: false },
    { id: '4', title: 'Navigation and Routing', duration: '35:20', type: 'video', isCompleted: false, isLocked: false },
    { id: '5', title: 'State Management with Redux', duration: '42:10', type: 'video', isCompleted: false, isLocked: true },
    { id: '6', title: 'API Integration', duration: '38:25', type: 'video', isCompleted: false, isLocked: true },
    { id: '7', title: 'App Deployment', duration: '25:40', type: 'video', isCompleted: false, isLocked: true }
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
    setSelectedVideo(video);
    setShowVideoModal(true);
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
          source={{ uri: course.image }}
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
                  <Text style={styles.statText}>{course.rating}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>👥</Text>
                  <Text style={styles.statText}>{course.students.toLocaleString()}</Text>
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
                {course.price === 0 ? (
                  <Text style={styles.freePrice}>FREE</Text>
                ) : (
                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>${course.price}</Text>
                    <Text style={styles.originalPrice}>${course.originalPrice}</Text>
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
            {course.whatYouWillLearn.map((item, index) => (
              <View key={index} style={styles.learningItem}>
                <Text style={styles.learningBullet}>✓</Text>
                <Text style={styles.learningText}>{item}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Requirements</Text>
            {course.requirements.map((item, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={styles.requirementBullet}>•</Text>
                <Text style={styles.requirementText}>{item}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Course Description</Text>
            <Text style={styles.descriptionText}>{course.description}</Text>

            {/* Learning Path */}
            <View style={styles.learningPathSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎯 Your Learning Journey</Text>
                <Text style={styles.sectionSubtitle}>Interactive roadmap to mastery</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '40%' }]} />
                </View>
                <Text style={styles.progressText}>2 of 7 modules completed</Text>
              </View>

              <View style={styles.modulesGrid}>
                {courseLessons.slice(0, 4).map((lesson, index) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.moduleCard,
                      lesson.isCompleted && styles.moduleCompleted,
                      lesson.isLocked && styles.moduleLocked
                    ]}
                    disabled={lesson.isLocked}
                  >
                    <View style={styles.moduleIcon}>
                      <Text style={styles.moduleIconText}>
                        {lesson.isCompleted ? '✅' : lesson.isLocked ? '🔒' : '📚'}
                      </Text>
                    </View>
                    <Text style={styles.moduleTitle}>{lesson.title}</Text>
                    <Text style={styles.moduleDuration}>{lesson.duration}</Text>
                    <View style={styles.moduleProgress}>
                      <View style={[
                        styles.moduleProgressBar,
                        { width: lesson.isCompleted ? '100%' : '0%' }
                      ]} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'videos' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎬 Course Videos</Text>
              <Text style={styles.sectionSubtitle}>Watch and learn at your own pace</Text>
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
                                {video.isCompleted && (
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
              <Text style={styles.sectionTitle}>🎓 مشروع التخرج الشامل</Text>
              <Text style={styles.sectionSubtitle}>تطبيق متكامل يجمع كل ما تعلمته</Text>
            </View>

            <View style={styles.graduationProject}>
              <View style={styles.projectHeader}>
                <View style={styles.projectIconContainer}>
                  <Text style={styles.projectIcon}>🚀</Text>
                </View>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle}>تطبيق YONE المتكامل</Text>
                  <Text style={styles.projectSubtitle}>تطبيق تعليمي شامل</Text>
                </View>
              </View>
              
              <Text style={styles.projectDescription}>
                مشروع شامل يجمع كل المهارات التي تعلمتها في الكورس. ستبني تطبيق تعليمي متكامل يشمل:
              </Text>
              
              <View style={styles.projectFeatures}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📱</Text>
                  <Text style={styles.featureText}>واجهة مستخدم حديثة ومتجاوبة</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎥</Text>
                  <Text style={styles.featureText}>مشغل فيديو متقدم</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🔐</Text>
                  <Text style={styles.featureText}>نظام مصادقة آمن</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>☁️</Text>
                  <Text style={styles.featureText}>تخزين سحابي مع Firebase</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📊</Text>
                  <Text style={styles.featureText}>تحليلات وتقارير متقدمة</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🔔</Text>
                  <Text style={styles.featureText}>إشعارات ذكية</Text>
                </View>
              </View>
              
              <View style={styles.projectTimeline}>
                <Text style={styles.timelineTitle}>خطة المشروع:</Text>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineWeek}>الأسبوع 1-2</Text>
                  <Text style={styles.timelineTask}>إعداد المشروع والهيكل الأساسي</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineWeek}>الأسبوع 3-4</Text>
                  <Text style={styles.timelineTask}>تطوير الواجهات والمكونات</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineWeek}>الأسبوع 5-6</Text>
                  <Text style={styles.timelineTask}>ربط البيانات والخدمات</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineWeek}>الأسبوع 7-8</Text>
                  <Text style={styles.timelineTask}>الاختبار والتحسين</Text>
                </View>
              </View>
              
              <View style={styles.projectMeta}>
                <View style={styles.projectMetaItem}>
                  <Text style={styles.projectMetaIcon}>⏱️</Text>
                  <Text style={styles.projectMetaText}>8 أسابيع</Text>
                </View>
                <View style={styles.projectMetaItem}>
                  <Text style={styles.projectMetaIcon}>🏆</Text>
                  <Text style={styles.projectMetaText}>1000 نقطة</Text>
                </View>
                <View style={styles.projectMetaItem}>
                  <Text style={styles.projectMetaIcon}>📜</Text>
                  <Text style={styles.projectMetaText}>شهادة إنجاز</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.projectButton}>
                <Text style={styles.projectButtonText}>بدء المشروع</Text>
              </TouchableOpacity>
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
                <Text style={styles.instructorSpotlightAvatar}>{course.instructorAvatar}</Text>
                <View style={styles.instructorVerified}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              </View>
              
              <View style={styles.instructorDetails}>
                <Text style={styles.instructorSpotlightName}>{course.instructor}</Text>
                <View style={styles.instructorStats}>
                  <View style={styles.instructorStat}>
                    <Text style={styles.instructorStatNumber}>{course.instructorRating}</Text>
                    <Text style={styles.instructorStatLabel}>Rating</Text>
                  </View>
                  <View style={styles.instructorStat}>
                    <Text style={styles.instructorStatNumber}>{course.instructorStudents.toLocaleString()}</Text>
                    <Text style={styles.instructorStatLabel}>Students</Text>
                  </View>
                  <View style={styles.instructorStat}>
                    <Text style={styles.instructorStatNumber}>8+</Text>
                    <Text style={styles.instructorStatLabel}>Years</Text>
                  </View>
                </View>
                <Text style={styles.instructorSpotlightBio}>{course.instructorBio}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💬 Community Reviews</Text>
              <View style={styles.overallRating}>
                <Text style={styles.overallRatingNumber}>{course.rating}</Text>
                <View style={styles.overallRatingStars}>
                  {renderStars(course.rating)}
                </View>
                <Text style={styles.totalRatings}>({course.totalRatings.toLocaleString()} reviews)</Text>
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

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.videoModal}>
          <LinearGradient
            colors={['#000000', '#1a1a1a', '#000000']}
            style={styles.videoModalGradient}
          >
            <View style={styles.videoHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowVideoModal(false)}
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
            
            <View style={styles.videoContainer}>
              {selectedVideo && (
                <Video
                  source={{ uri: selectedVideo.url }}
                  style={styles.videoPlayer}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={true}
                  isLooping={false}
                  useNativeControls={true}
                />
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
              
              <View style={styles.videoActions}>
                <TouchableOpacity style={styles.videoActionButton}>
                  <Text style={styles.videoActionIcon}>👍</Text>
                  <Text style={styles.videoActionText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.videoActionButton}>
                  <Text style={styles.videoActionIcon}>💬</Text>
                  <Text style={styles.videoActionText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.videoActionButton}>
                  <Text style={styles.videoActionIcon}>📤</Text>
                  <Text style={styles.videoActionText}>Share</Text>
                </TouchableOpacity>
              </View>
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
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  videoPlayer: {
    width: '95%',
    height: '90%',
    backgroundColor: '#000000',
    borderRadius: 12,
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
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoActionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  videoActionIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  videoActionText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
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
});
