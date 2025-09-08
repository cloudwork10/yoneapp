import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PodcastsScreen() {
  const podcasts = [
    { id: 1, title: 'React Native Deep Dive', duration: '45 min', category: 'Mobile Development' },
    { id: 2, title: 'JavaScript Best Practices', duration: '38 min', category: 'Programming' },
    { id: 3, title: 'Node.js Architecture', duration: '52 min', category: 'Backend' },
    { id: 4, title: 'MongoDB Optimization', duration: '41 min', category: 'Database' },
    { id: 5, title: 'UI/UX Design Principles', duration: '35 min', category: 'Design' },
  ];

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Video Podcasts</Text>
          <Text style={styles.subtitle}>Learn from industry experts</Text>
        </View>

        <View style={styles.podcastsContainer}>
          {podcasts.map((podcast) => (
            <TouchableOpacity key={podcast.id} style={styles.podcastCard}>
              <View style={styles.podcastInfo}>
                <Text style={styles.podcastTitle}>{podcast.title}</Text>
                <Text style={styles.podcastCategory}>{podcast.category}</Text>
                <Text style={styles.podcastDuration}>{podcast.duration}</Text>
              </View>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  podcastsContainer: {
    gap: 15,
  },
  podcastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  podcastInfo: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  podcastCategory: {
    fontSize: 14,
    color: '#E50914',
    marginBottom: 3,
  },
  podcastDuration: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 3,
  },
});
