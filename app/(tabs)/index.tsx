import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
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

  // Create a coding-themed background image using a gradient overlay
  const CodingBackground = () => (
    <View style={styles.backgroundContainer}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.backgroundGradient}
      />
      <View style={styles.codingOverlay}>
        <Text style={styles.codeLine1}>const developer = {`{`}</Text>
        <Text style={styles.codeLine2}>  skills: ['React', 'Node.js', 'MongoDB'],</Text>
        <Text style={styles.codeLine3}>  passion: 'Learning & Teaching',</Text>
        <Text style={styles.codeLine4}>  goal: 'Build Amazing Apps'</Text>
        <Text style={styles.codeLine5}>{`};`}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Netflix-style Hero Section */}
        <View style={styles.heroSection}>
          <CodingBackground />
          <View style={styles.heroContent}>
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
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
        </ScrollView>
      </View>
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
  // Netflix-style Hero Section
  heroSection: {
    height: height * 0.6,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    flex: 1,
  },
  codingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    opacity: 0.1,
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
  heroContent: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
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
  scrollView: {
    flex: 1,
    padding: 20,
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
