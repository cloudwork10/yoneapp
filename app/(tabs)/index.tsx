import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Netflix-style Background */}
        <View style={styles.backgroundContainer}>
          <LinearGradient
            colors={['#000000', '#1a0a0a', '#2d1b1b', '#000000']}
            style={styles.backgroundGradient}
          />
          
          {/* Floating geometric shapes */}
          <View style={styles.floatingShapes}>
            <View style={[styles.shape, styles.shape1]} />
            <View style={[styles.shape, styles.shape2]} />
            <View style={[styles.shape, styles.shape3]} />
            <View style={[styles.shape, styles.shape4]} />
            <View style={[styles.shape, styles.shape5]} />
          </View>
          
          {/* Subtle grid pattern */}
          <View style={styles.gridPattern}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={[styles.gridLine, { 
                top: (i * height / 20) + 'px',
                opacity: 0.03 + (i % 3) * 0.01
              }]} />
            ))}
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.subtitle}>Continue your learning journey</Text>
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
    position: 'relative',
  },
  // Netflix-style Background
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Floating geometric shapes
  floatingShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    opacity: 0.08,
  },
  shape1: {
    width: 120,
    height: 120,
    backgroundColor: '#E50914',
    borderRadius: 60,
    top: '15%',
    right: '10%',
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    width: 80,
    height: 80,
    backgroundColor: '#FF6B6B',
    top: '60%',
    left: '15%',
    transform: [{ rotate: '30deg' }],
  },
  shape3: {
    width: 100,
    height: 100,
    backgroundColor: '#FF8E53',
    borderRadius: 20,
    top: '40%',
    right: '20%',
    transform: [{ rotate: '-30deg' }],
  },
  shape4: {
    width: 60,
    height: 60,
    backgroundColor: '#E50914',
    borderRadius: 30,
    top: '75%',
    right: '40%',
    transform: [{ rotate: '60deg' }],
  },
  shape5: {
    width: 90,
    height: 90,
    backgroundColor: '#FF4757',
    top: '25%',
    left: '25%',
    transform: [{ rotate: '45deg' }],
  },
  // Grid pattern
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E50914',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 200,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
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
