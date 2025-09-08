import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: string;
  duration: string;
  level: string;
  description: string;
  whatYouWillLearn: string[];
  curriculum: {
    section: string;
    lectures: {
      title: string;
      duration: string;
      type: 'video' | 'reading' | 'quiz';
      isCompleted: boolean;
    }[];
  }[];
}

export default function CourseDetailsScreen() {
  const { courseId } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [enrolled, setEnrolled] = useState(false);

  // Sample course data - in real app, fetch from API
  const course: Course = {
    id: courseId as string || '1',
    title: 'Complete React Native Development Course',
    instructor: 'John Doe',
    rating: 4.8,
    students: 1250,
    price: 'Free',
    duration: '12 hours',
    level: 'Beginner to Advanced',
    description: 'Learn React Native from scratch and build real-world mobile applications. This comprehensive course covers everything from basic concepts to advanced topics like navigation, state management, and app deployment.',
    whatYouWillLearn: [
      'Build cross-platform mobile apps with React Native',
      'Master React Native navigation and routing',
      'Implement state management with Redux',
      'Integrate APIs and handle data fetching',
      'Deploy apps to App Store and Google Play',
      'Use React Native best practices and patterns'
    ],
    curriculum: [
      {
        section: 'Getting Started',
        lectures: [
          { title: 'Introduction to React Native', duration: '15 min', type: 'video', isCompleted: true },
          { title: 'Setting up Development Environment', duration: '20 min', type: 'video', isCompleted: true },
          { title: 'Your First React Native App', duration: '25 min', type: 'video', isCompleted: false },
          { title: 'Understanding React Native Architecture', duration: '18 min', type: 'reading', isCompleted: false }
        ]
      },
      {
        section: 'Core Concepts',
        lectures: [
          { title: 'Components and Props', duration: '22 min', type: 'video', isCompleted: false },
          { title: 'State and Lifecycle', duration: '28 min', type: 'video', isCompleted: false },
          { title: 'Handling User Input', duration: '20 min', type: 'video', isCompleted: false },
          { title: 'Styling and Layout', duration: '30 min', type: 'video', isCompleted: false },
          { title: 'Quiz: Core Concepts', duration: '10 min', type: 'quiz', isCompleted: false }
        ]
      },
      {
        section: 'Navigation and Routing',
        lectures: [
          { title: 'React Navigation Setup', duration: '25 min', type: 'video', isCompleted: false },
          { title: 'Stack Navigation', duration: '30 min', type: 'video', isCompleted: false },
          { title: 'Tab Navigation', duration: '20 min', type: 'video', isCompleted: false },
          { title: 'Drawer Navigation', duration: '25 min', type: 'video', isCompleted: false }
        ]
      },
      {
        section: 'Advanced Topics',
        lectures: [
          { title: 'State Management with Redux', duration: '45 min', type: 'video', isCompleted: false },
          { title: 'API Integration', duration: '35 min', type: 'video', isCompleted: false },
          { title: 'Push Notifications', duration: '30 min', type: 'video', isCompleted: false },
          { title: 'App Deployment', duration: '40 min', type: 'video', isCompleted: false }
        ]
      }
    ]
  };

  const handleEnroll = () => {
    if (enrolled) {
      Alert.alert('Already Enrolled', 'You are already enrolled in this course!');
    } else {
      setEnrolled(true);
      Alert.alert('Success!', 'You have been enrolled in this course!');
    }
  };

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVideo = (lecture: any) => {
    setSelectedVideo(lecture);
    setIsPlaying(true);
  };

  const renderInlineVideoPlayer = () => {
    if (!selectedVideo) return null;

    return (
      <View style={styles.videoPlayerContainer}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.videoPlayerBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.videoPlayerGradient}
          >
            <View style={styles.videoPlayerHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedVideo(null)}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.videoPlayerTitle}>{selectedVideo.title}</Text>
              <Text style={styles.videoPlayerDuration}>{selectedVideo.duration}</Text>
            </View>

            <View style={styles.videoPlayerCenter}>
              <TouchableOpacity 
                style={styles.videoPlayButton} 
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <Text style={styles.videoPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.videoPlayerBottom}>
              <View style={styles.videoProgressContainer}>
                <View style={styles.videoProgressBar}>
                  <View style={[styles.videoProgressFill, { width: '25%' }]} />
                </View>
                <Text style={styles.videoTimeText}>2:15 / {selectedVideo.duration}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>About This Course</Text>
        <Text style={styles.description}>{course.description}</Text>
      </View>

      <View style={styles.learnSection}>
        <Text style={styles.sectionTitle}>What You'll Learn</Text>
        {course.whatYouWillLearn.map((item, index) => (
          <View key={index} style={styles.learnItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.learnText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.instructorSection}>
        <Text style={styles.sectionTitle}>Instructor</Text>
        <View style={styles.instructorCard}>
          <View style={styles.instructorAvatar}>
            <Text style={styles.instructorInitials}>{course.instructor.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{course.instructor}</Text>
            <Text style={styles.instructorTitle}>Senior Mobile Developer</Text>
            <Text style={styles.instructorStats}>5+ years experience • 10,000+ students</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCurriculum = () => (
    <View style={styles.tabContent}>
      <View style={styles.curriculumHeader}>
        <Text style={styles.curriculumTitle}>Course Curriculum</Text>
        <Text style={styles.curriculumSubtitle}>{course.curriculum.length} sections • {course.curriculum.reduce((total, section) => total + section.lectures.length, 0)} lectures</Text>
      </View>

      {course.curriculum.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionName}>{section.section}</Text>
            <Text style={styles.sectionCount}>{section.lectures.length} lectures</Text>
          </View>
          
          {section.lectures.map((lecture, lectureIndex) => (
            <TouchableOpacity 
              key={lectureIndex} 
              style={styles.lectureItem}
              onPress={() => handlePlayVideo(lecture)}
            >
              <View style={styles.lectureIcon}>
                <Text style={styles.lectureIconText}>
                  {lecture.type === 'video' ? '▶' : lecture.type === 'reading' ? '📖' : '❓'}
                </Text>
              </View>
              <View style={styles.lectureInfo}>
                <Text style={styles.lectureTitle}>{lecture.title}</Text>
                <Text style={styles.lectureDuration}>{lecture.duration}</Text>
              </View>
              {lecture.isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.ratingNumber}>{course.rating}</Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text key={star} style={styles.star}>⭐</Text>
          ))}
        </View>
        <Text style={styles.ratingCount}>({course.students} ratings)</Text>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitials}>JS</Text>
          </View>
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>Jane Smith</Text>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={styles.star}>⭐</Text>
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reviewText}>
          "Excellent course! The instructor explains everything clearly and the projects are very practical. 
          I was able to build my first mobile app after completing this course."
        </Text>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitials}>MJ</Text>
          </View>
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>Mike Johnson</Text>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={styles.star}>⭐</Text>
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reviewText}>
          "Great content and well-structured. The instructor is knowledgeable and responsive to questions. 
          Highly recommended for anyone wanting to learn React Native."
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Inline Video Player */}
      {renderInlineVideoPlayer()}
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={styles.heroGradient}
          />
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseInstructor}>By {course.instructor}</Text>
            
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
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statText}>{course.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Course Info Bar */}
        <View style={styles.infoBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{course.price}</Text>
            {course.price !== 'Free' && <Text style={styles.originalPrice}>$99.99</Text>}
          </View>
          <TouchableOpacity style={[styles.enrollButton, enrolled && styles.enrolledButton]} onPress={handleEnroll}>
            <Text style={styles.enrollButtonText}>
              {enrolled ? 'Enrolled' : 'Enroll Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]} 
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'curriculum' && styles.activeTab]} 
            onPress={() => setSelectedTab('curriculum')}
          >
            <Text style={[styles.tabText, selectedTab === 'curriculum' && styles.activeTabText]}>Curriculum</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]} 
            onPress={() => setSelectedTab('reviews')}
          >
            <Text style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}>Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <ScrollView 
          style={styles.contentScroll} 
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          decelerationRate="fast"
          overScrollMode="auto"
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'curriculum' && renderCurriculum()}
          {selectedTab === 'reviews' && renderReviews()}
        </ScrollView>
      </ScrollView>
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
  heroSection: {
    height: height * 0.35,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 30,
  },
  courseInstructor: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  courseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  enrollButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enrolledButton: {
    backgroundColor: '#4CAF50',
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E50914',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#E50914',
  },
  contentScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabContent: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 25,
  },
  learnSection: {
    marginBottom: 25,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkmark: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  learnText: {
    flex: 1,
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  instructorSection: {
    marginBottom: 25,
  },
  instructorCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  instructorInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 14,
    color: '#E50914',
    marginBottom: 4,
  },
  instructorStats: {
    fontSize: 12,
    color: '#999999',
  },
  curriculumHeader: {
    marginBottom: 20,
  },
  curriculumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  curriculumSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  sectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionCount: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  lectureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lectureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lectureIconText: {
    fontSize: 12,
    color: '#E50914',
  },
  lectureInfo: {
    flex: 1,
  },
  lectureTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  lectureDuration: {
    fontSize: 12,
    color: '#999999',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E50914',
    marginRight: 10,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  reviewerInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  // Inline Video Player Styles
  videoPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
  videoPlayerBackground: {
    width: '100%',
    height: '100%',
  },
  videoPlayerGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  videoPlayerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    textAlign: 'center',
  },
  videoPlayerDuration: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  videoPlayerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    marginLeft: 4,
  },
  videoPlayerBottom: {
    padding: 20,
  },
  videoProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 15,
  },
  videoProgressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  videoTimeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
