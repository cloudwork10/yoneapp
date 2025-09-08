import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const featuredCourses = [
    { id: 1, title: 'React Native Fundamentals', instructor: 'John Doe', rating: 4.8, students: 1250 },
    { id: 2, title: 'Node.js Backend Development', instructor: 'Jane Smith', rating: 4.9, students: 980 },
    { id: 3, title: 'MongoDB Database Design', instructor: 'Mike Johnson', rating: 4.7, students: 750 },
  ];

  const quickStats = [
    { label: 'Courses', value: '25+' },
    { label: 'Students', value: '10K+' },
    { label: 'Hours', value: '500+' },
    { label: 'Certificates', value: '15+' },
  ];

  // Create a real background image with parallax effect
  const CodingBackground = () => (
    <Animated.View 
      style={[
        styles.backgroundContainer,
        {
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, height * 0.6],
                outputRange: [0, -height * 0.3],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      {/* Real background image */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark overlay for better text readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
          style={styles.overlayGradient}
        />
        
        {/* Coding overlay for theme */}
        <View style={styles.codingOverlay}>
          <Text style={styles.codeLine1}>const developer = {`{`}</Text>
          <Text style={styles.codeLine2}>  skills: ['React', 'Node.js', 'MongoDB'],</Text>
          <Text style={styles.codeLine3}>  passion: 'Learning & Teaching',</Text>
          <Text style={styles.codeLine4}>  goal: 'Build Amazing Apps'</Text>
          <Text style={styles.codeLine5}>{`};`}</Text>
          <Text style={styles.codeLine6}>// Welcome to YONE Learning Platform</Text>
          <Text style={styles.codeLine7}>function startLearning() {`{`}</Text>
          <Text style={styles.codeLine8}>  return 'Success!';</Text>
          <Text style={styles.codeLine9}>{`}`}</Text>
        </View>
        
        {/* Add some geometric shapes for visual interest */}
        <View style={styles.geometricShapes}>
          <View style={[styles.shape, styles.shape1]} />
          <View style={[styles.shape, styles.shape2]} />
          <View style={[styles.shape, styles.shape3]} />
        </View>
      </ImageBackground>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Full-screen background that starts from top */}
      <CodingBackground />
      
      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Hero Section Content */}
        <View style={styles.heroSection}>
          <Animated.View 
            style={[
              styles.heroContent,
              {
                opacity: scrollY.interpolate({
                  inputRange: [0, height * 0.4],
                  outputRange: [1, 0.3],
                  extrapolate: 'clamp',
                }),
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, height * 0.8],
                      outputRange: [0, -100],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.heroTitle}>Welcome to YONE</Text>
            <Text style={styles.heroSubtitle}>Master coding with our comprehensive courses</Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.playButton}>
                <Text style={styles.playButtonText}>▶ Start Learning</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoButton}>
                <Text style={styles.infoButtonText}>ℹ More Info</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Continue Learning</Text>
          <Text style={styles.subtitle}>Pick up where you left off</Text>
        </View>

        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Courses</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coursesScroll}>
            {featuredCourses.map((course) => (
              <TouchableOpacity key={course.id} style={styles.courseCard}>
                <View style={styles.courseImage}>
                  <Text style={styles.courseImageText}>📚</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseInstructor}>By {course.instructor}</Text>
                  <View style={styles.courseStats}>
                    <Text style={styles.courseRating}>⭐ {course.rating}</Text>
                    <Text style={styles.courseStudents}>{course.students} students</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionTitle}>Start Learning</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>View Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏆</Text>
              <Text style={styles.actionTitle}>Certificates</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Community</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
        </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Full-screen background that starts from top
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Hero Section
  heroSection: {
    height: height * 0.8,
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  contentSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 30,
    paddingHorizontal: 20,
    minHeight: height * 0.6,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  codingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    opacity: 0.15,
  },
  codeLine1: {
    fontSize: 16,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  codeLine2: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 6,
    marginLeft: 20,
  },
  codeLine3: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 6,
    marginLeft: 20,
  },
  codeLine4: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 8,
    marginLeft: 20,
  },
  codeLine5: {
    fontSize: 16,
    color: '#00ff00',
    fontFamily: 'monospace',
  },
  codeLine6: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 20,
    marginBottom: 8,
  },
  codeLine7: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  codeLine8: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 6,
    marginLeft: 20,
  },
  codeLine9: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
  },
  geometricShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    opacity: 0.2,
  },
  shape1: {
    width: 100,
    height: 100,
    backgroundColor: '#E50914',
    borderRadius: 50,
    top: '20%',
    right: '10%',
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    width: 60,
    height: 60,
    backgroundColor: '#00ff00',
    top: '60%',
    left: '15%',
    transform: [{ rotate: '30deg' }],
  },
  shape3: {
    width: 80,
    height: 80,
    backgroundColor: '#0066ff',
    borderRadius: 10,
    top: '40%',
    right: '20%',
    transform: [{ rotate: '-30deg' }],
  },
  heroContent: {
    paddingHorizontal: 20,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  playButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  coursesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 200,
  },
  courseImage: {
    height: 100,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseImageText: {
    fontSize: 32,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  courseInstructor: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseRating: {
    fontSize: 12,
    color: '#FFD700',
  },
  courseStudents: {
    fontSize: 12,
    color: '#999999',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '47%',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
