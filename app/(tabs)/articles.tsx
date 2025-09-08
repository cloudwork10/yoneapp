import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ArticlesScreen() {
  const articles = [
    { 
      id: 1, 
      title: '10 React Native Performance Tips', 
      author: 'John Doe',
      readTime: '5 min read',
      category: 'Mobile Development',
      date: '2 days ago'
    },
    { 
      id: 2, 
      title: 'Understanding JavaScript Closures', 
      author: 'Jane Smith',
      readTime: '8 min read',
      category: 'Programming',
      date: '1 week ago'
    },
    { 
      id: 3, 
      title: 'MongoDB vs PostgreSQL: Which to Choose?', 
      author: 'Mike Johnson',
      readTime: '12 min read',
      category: 'Database',
      date: '2 weeks ago'
    },
    { 
      id: 4, 
      title: 'Building Scalable Node.js Applications', 
      author: 'Sarah Wilson',
      readTime: '15 min read',
      category: 'Backend',
      date: '3 weeks ago'
    },
    { 
      id: 5, 
      title: 'CSS Grid vs Flexbox: A Complete Guide', 
      author: 'Alex Brown',
      readTime: '10 min read',
      category: 'Frontend',
      date: '1 month ago'
    },
  ];

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Articles</Text>
          <Text style={styles.subtitle}>Latest insights and tutorials</Text>
        </View>

        <View style={styles.articlesContainer}>
          {articles.map((article) => (
            <TouchableOpacity key={article.id} style={styles.articleCard}>
              <View style={styles.articleHeader}>
                <Text style={styles.articleCategory}>{article.category}</Text>
                <Text style={styles.articleDate}>{article.date}</Text>
              </View>
              
              <Text style={styles.articleTitle}>{article.title}</Text>
              
              <View style={styles.articleFooter}>
                <Text style={styles.articleAuthor}>By {article.author}</Text>
                <Text style={styles.readTime}>{article.readTime}</Text>
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
  articlesContainer: {
    gap: 20,
  },
  articleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleCategory: {
    fontSize: 12,
    color: '#E50914',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleDate: {
    fontSize: 12,
    color: '#999999',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    lineHeight: 24,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  readTime: {
    fontSize: 14,
    color: '#999999',
  },
});
