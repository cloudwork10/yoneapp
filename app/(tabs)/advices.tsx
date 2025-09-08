import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdvicesScreen() {
  const advices = [
    { 
      id: 1, 
      title: 'How to Land Your First Developer Job', 
      category: 'Career',
      readTime: '6 min read',
      tips: 5
    },
    { 
      id: 2, 
      title: 'Building a Strong Portfolio', 
      category: 'Career',
      readTime: '8 min read',
      tips: 7
    },
    { 
      id: 3, 
      title: 'Remote Work Best Practices', 
      category: 'Workplace',
      readTime: '10 min read',
      tips: 6
    },
    { 
      id: 4, 
      title: 'Time Management for Developers', 
      category: 'Productivity',
      readTime: '7 min read',
      tips: 8
    },
    { 
      id: 5, 
      title: 'Networking in Tech Industry', 
      category: 'Career',
      readTime: '9 min read',
      tips: 4
    },
    { 
      id: 6, 
      title: 'Learning New Technologies Effectively', 
      category: 'Learning',
      readTime: '12 min read',
      tips: 10
    },
  ];

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Advice & Tips</Text>
          <Text style={styles.subtitle}>Expert guidance for your career</Text>
        </View>

        <View style={styles.advicesContainer}>
          {advices.map((advice) => (
            <TouchableOpacity key={advice.id} style={styles.adviceCard}>
              <View style={styles.adviceHeader}>
                <Text style={styles.adviceCategory}>{advice.category}</Text>
                <View style={styles.tipsBadge}>
                  <Text style={styles.tipsText}>{advice.tips} tips</Text>
                </View>
              </View>
              
              <Text style={styles.adviceTitle}>{advice.title}</Text>
              
              <View style={styles.adviceFooter}>
                <Text style={styles.readTime}>{advice.readTime}</Text>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>
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
  advicesContainer: {
    gap: 15,
  },
  adviceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  adviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adviceCategory: {
    fontSize: 12,
    color: '#E50914',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipsBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipsText: {
    fontSize: 12,
    color: '#E50914',
    fontWeight: '600',
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    lineHeight: 24,
  },
  adviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 14,
    color: '#999999',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
