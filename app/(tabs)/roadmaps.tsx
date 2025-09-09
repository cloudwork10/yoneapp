import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function RoadmapsScreen() {
  const router = useRouter();
  
  const roadmaps = [
    { 
      id: 1, 
      title: 'Frontend Developer', 
      description: 'Complete path to becoming a frontend developer',
      progress: 65,
      totalSteps: 20,
      completedSteps: 13
    },
    { 
      id: 2, 
      title: 'Backend Developer', 
      description: 'Master server-side development',
      progress: 40,
      totalSteps: 25,
      completedSteps: 10
    },
    { 
      id: 3, 
      title: 'Full Stack Developer', 
      description: 'End-to-end development expertise',
      progress: 30,
      totalSteps: 35,
      completedSteps: 10
    },
    { 
      id: 4, 
      title: 'Mobile Developer', 
      description: 'React Native and mobile app development',
      progress: 80,
      totalSteps: 15,
      completedSteps: 12
    },
    { 
      id: 5, 
      title: 'DevOps Engineer', 
      description: 'Infrastructure and deployment mastery',
      progress: 20,
      totalSteps: 30,
      completedSteps: 6
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Learning Roadmaps</Text>
          <Text style={styles.subtitle}>Structured paths to mastery</Text>
        </View>

        <View style={styles.roadmapsContainer}>
          {roadmaps.map((roadmap) => (
            <TouchableOpacity 
              key={roadmap.id} 
              style={styles.roadmapCard}
              onPress={() => router.push(`/roadmap-details?roadmapId=${roadmap.id}`)}
            >
              <View style={styles.roadmapHeader}>
                <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
                <Text style={styles.progressText}>{roadmap.progress}%</Text>
              </View>
              
              <Text style={styles.roadmapDescription}>{roadmap.description}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${roadmap.progress}%` }
                    ]} 
                  />
                </View>
              </View>
              
              <Text style={styles.stepsText}>
                {roadmap.completedSteps} of {roadmap.totalSteps} steps completed
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  roadmapsContainer: {
    gap: 20,
  },
  roadmapCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
  },
  roadmapDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  stepsText: {
    fontSize: 12,
    color: '#999999',
  },
});
