import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopCVScreen() {
  const cvTemplates = [
    { 
      id: 1, 
      title: 'Frontend Developer CV', 
      description: 'Modern and clean design for frontend developers',
      downloads: 1250,
      rating: 4.8,
      price: 'Free'
    },
    { 
      id: 2, 
      title: 'Full Stack Developer CV', 
      description: 'Comprehensive template for full stack developers',
      downloads: 980,
      rating: 4.7,
      price: 'Free'
    },
    { 
      id: 3, 
      title: 'Mobile Developer CV', 
      description: 'Professional template for mobile app developers',
      downloads: 750,
      rating: 4.9,
      price: 'Free'
    },
    { 
      id: 4, 
      title: 'Backend Developer CV', 
      description: 'Technical and detailed template for backend developers',
      downloads: 650,
      rating: 4.6,
      price: 'Free'
    },
    { 
      id: 5, 
      title: 'DevOps Engineer CV', 
      description: 'Specialized template for DevOps professionals',
      downloads: 420,
      rating: 4.8,
      price: 'Free'
    },
    { 
      id: 6, 
      title: 'UI/UX Designer CV', 
      description: 'Creative and visual template for designers',
      downloads: 890,
      rating: 4.9,
      price: 'Free'
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Top CV Templates</Text>
          <Text style={styles.subtitle}>Professional templates for developers</Text>
        </View>

        <View style={styles.templatesContainer}>
          {cvTemplates.map((template) => (
            <TouchableOpacity key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {template.rating}</Text>
                </View>
              </View>
              
              <Text style={styles.templateDescription}>{template.description}</Text>
              
              <View style={styles.templateFooter}>
                <View style={styles.statsContainer}>
                  <Text style={styles.downloads}>{template.downloads} downloads</Text>
                </View>
                <View style={styles.downloadButton}>
                  <Text style={styles.downloadText}>Download</Text>
                </View>
              </View>
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
  templatesContainer: {
    gap: 20,
  },
  templateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
    lineHeight: 20,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
  },
  downloads: {
    fontSize: 12,
    color: '#999999',
  },
  downloadButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
