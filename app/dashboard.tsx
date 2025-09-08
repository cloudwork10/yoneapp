import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const dashboardData = {
    totalCourses: 25,
    completedCourses: 12,
    inProgressCourses: 3,
    totalHours: 45,
    weeklyGoal: 10,
    currentWeekHours: 7,
    streak: 7,
    certificates: 8,
  };

  const recentActivity = [
    { id: 1, title: 'Completed React Native Basics', time: '2 hours ago', type: 'course' },
    { id: 2, title: 'Started Node.js Advanced', time: '1 day ago', type: 'course' },
    { id: 3, title: 'Earned JavaScript Certificate', time: '3 days ago', type: 'certificate' },
    { id: 4, title: 'Watched MongoDB Tutorial', time: '5 days ago', type: 'video' },
  ];

  const progressPercentage = Math.round((dashboardData.completedCourses / dashboardData.totalCourses) * 100);
  const weeklyProgressPercentage = Math.round((dashboardData.currentWeekHours / dashboardData.weeklyGoal) * 100);

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{dashboardData.completedCourses}</Text>
              <Text style={styles.overviewLabel}>Courses Completed</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{dashboardData.totalHours}h</Text>
              <Text style={styles.overviewLabel}>Total Hours</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{dashboardData.streak}</Text>
              <Text style={styles.overviewLabel}>Day Streak</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{dashboardData.certificates}</Text>
              <Text style={styles.overviewLabel}>Certificates</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Course Completion</Text>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {dashboardData.completedCourses} of {dashboardData.totalCourses} courses completed
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Weekly Goal</Text>
              <Text style={styles.progressPercentage}>{weeklyProgressPercentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${weeklyProgressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {dashboardData.currentWeekHours} of {dashboardData.weeklyGoal} hours this week
            </Text>
          </View>
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>
                    {activity.type === 'course' ? '📚' : 
                     activity.type === 'certificate' ? '🏆' : '🎥'}
                  </Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  overviewSection: {
    marginBottom: 30,
  },
  overviewCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  overviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  activitySection: {
    marginBottom: 30,
  },
  activityContainer: {
    gap: 15,
  },
  activityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  activityTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});
