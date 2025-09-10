import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ArticlesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'programming', name: 'Programming', icon: '💻' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'freelancing', name: 'Freelancing', icon: '💼' },
    { id: 'career', name: 'Start Your Career', icon: '🚀' },
  ];
  
  const articles = [
    { 
      id: 1, 
      title: '10 React Native Performance Tips', 
      description: 'Learn essential techniques to optimize your React Native apps for better performance and user experience',
      author: 'John Doe',
      readTime: '5 min read',
      category: 'programming',
      date: '2 days ago',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FF6B6B',
      icon: '📱',
      views: '2.3k'
    },
    { 
      id: 2, 
      title: 'Understanding JavaScript Closures', 
      description: 'Master one of JavaScript\'s most powerful concepts with practical examples and real-world applications',
      author: 'Jane Smith',
      readTime: '8 min read',
      category: 'programming',
      date: '1 week ago',
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#4ECDC4',
      icon: '⚡',
      views: '5.1k'
    },
    { 
      id: 3, 
      title: 'MongoDB vs PostgreSQL: Which to Choose?', 
      description: 'A comprehensive comparison of two popular databases to help you make the right choice for your project',
      author: 'Mike Johnson',
      readTime: '12 min read',
      category: 'programming',
      date: '2 weeks ago',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#45B7D1',
      icon: '🗄️',
      views: '3.7k'
    },
    { 
      id: 4, 
      title: 'Building Scalable Node.js Applications', 
      description: 'Best practices and patterns for creating robust, scalable Node.js applications that can handle growth',
      author: 'Sarah Wilson',
      readTime: '15 min read',
      category: 'programming',
      date: '3 weeks ago',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#96CEB4',
      icon: '🚀',
      views: '4.2k'
    },
    { 
      id: 5, 
      title: 'CSS Grid vs Flexbox: A Complete Guide', 
      description: 'When to use CSS Grid and when to use Flexbox - a complete guide with examples and best practices',
      author: 'Alex Brown',
      readTime: '10 min read',
      category: 'design',
      date: '1 month ago',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FF9F43',
      icon: '🎨',
      views: '6.8k'
    },
    { 
      id: 6, 
      title: 'UI/UX Design Principles for Mobile Apps', 
      description: 'Essential design principles that every mobile app developer should know for better user experience',
      author: 'Emma Davis',
      readTime: '7 min read',
      category: 'design',
      date: '5 days ago',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#6C5CE7',
      icon: '📱',
      views: '3.2k'
    },
    { 
      id: 7, 
      title: 'Digital Marketing Strategies for 2024', 
      description: 'Latest trends and strategies in digital marketing to help your business grow in the current market',
      author: 'David Lee',
      readTime: '9 min read',
      category: 'marketing',
      date: '1 week ago',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#00B894',
      icon: '📈',
      views: '4.5k'
    },
    { 
      id: 8, 
      title: 'Content Marketing: A Beginner\'s Guide', 
      description: 'Learn how to create compelling content that engages your audience and drives business results',
      author: 'Lisa Chen',
      readTime: '6 min read',
      category: 'marketing',
      date: '3 days ago',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#E17055',
      icon: '✍️',
      views: '2.9k'
    },
    { 
      id: 9, 
      title: 'How to Start Your Freelance Web Development Business', 
      description: 'Step-by-step guide to building a successful freelance web development business from scratch',
      author: 'Tom Wilson',
      readTime: '11 min read',
      category: 'freelancing',
      date: '2 weeks ago',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#A29BFE',
      icon: '💼',
      views: '5.6k'
    },
    { 
      id: 10, 
      title: 'Freelance Design: Pricing Your Services', 
      description: 'Learn how to price your design services competitively while ensuring you\'re fairly compensated',
      author: 'Maria Garcia',
      readTime: '8 min read',
      category: 'freelancing',
      date: '1 week ago',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FD79A8',
      icon: '🎨',
      views: '3.4k'
    },
    { 
      id: 11, 
      title: 'Career Tips for New Developers', 
      description: 'Essential advice for developers starting their career journey in the tech industry',
      author: 'Chris Taylor',
      readTime: '5 min read',
      category: 'career',
      date: '4 days ago',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#FDCB6E',
      icon: '🚀',
      views: '7.2k'
    },
    { 
      id: 12, 
      title: 'Building Your Professional Network', 
      description: 'Strategies for networking and building meaningful professional relationships in tech',
      author: 'Rachel Kim',
      readTime: '6 min read',
      category: 'career',
      date: '6 days ago',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: '#74B9FF',
      icon: '🤝',
      views: '4.1k'
    },
  ];

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Articles</Text>
            <Text style={styles.subtitle}>Latest insights and tutorials</Text>
          </View>

          {/* Featured Article */}
          <View style={styles.featuredSection}>
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => router.push(`/article-details?articleId=${articles[0].id}`)}
            >
              <ImageBackground
                source={{ uri: articles[0].image }}
                style={styles.featuredImage}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>FEATURED</Text>
                    </View>
                    <Text style={styles.featuredTitleText}>{articles[0].title}</Text>
                    <Text style={styles.featuredDescription}>{articles[0].description}</Text>
                    <View style={styles.featuredMeta}>
                      <View style={styles.featuredMetaItem}>
                        <Text style={styles.featuredMetaIcon}>👤</Text>
                        <Text style={styles.featuredMetaText}>{articles[0].author}</Text>
                      </View>
                      <View style={styles.featuredMetaItem}>
                        <Text style={styles.featuredMetaIcon}>⏱️</Text>
                        <Text style={styles.featuredMetaText}>{articles[0].readTime}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search articles..."
                placeholderTextColor="#666666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScrollView}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.name && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* All Articles */}
          <View style={styles.articlesSection}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Articles' : `${selectedCategory} Articles`}
            </Text>
            <View style={styles.articlesContainer}>
              {filteredArticles.map((article) => (
                <TouchableOpacity 
                  key={article.id} 
                  style={styles.articleCard}
                  onPress={() => router.push(`/article-details?articleId=${article.id}`)}
                >
                  <View style={styles.articleImageContainer}>
                    <ImageBackground
                      source={{ uri: article.image }}
                      style={styles.articleImage}
                      resizeMode="cover"
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                        style={styles.articleImageGradient}
                      >
                        <View style={styles.articleIcon}>
                          <Text style={styles.articleIconText}>{article.icon}</Text>
                        </View>
                        <View style={styles.articleViewsContainer}>
                          <Text style={styles.articleViewsText}>{article.views}</Text>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </View>
                  
                  <View style={styles.articleContent}>
                    <View style={styles.articleHeader}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <View style={[styles.articleCategoryBadge, { backgroundColor: article.color }]}>
                        <Text style={styles.articleCategoryText}>{article.category}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.articleDescription}>{article.description}</Text>
                    
                    <View style={styles.articleMeta}>
                      <View style={styles.articleMetaItem}>
                        <Text style={styles.articleMetaIcon}>👤</Text>
                        <Text style={styles.articleMetaText}>{article.author}</Text>
                      </View>
                      <View style={styles.articleMetaItem}>
                        <Text style={styles.articleMetaIcon}>⏱️</Text>
                        <Text style={styles.articleMetaText}>{article.readTime}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  // Header Styles
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  // Featured Section
  featuredSection: {
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  featuredCard: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuredImage: {
    flex: 1,
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredContent: {
    gap: 8,
  },
  featuredBadge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuredTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaIcon: {
    fontSize: 14,
  },
  featuredMetaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  // Search Section
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#CCCCCC',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Categories Section
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  categoriesScrollView: {
    marginTop: 10,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Articles Section
  articlesSection: {
    marginBottom: 20,
  },
  articlesContainer: {
    gap: 16,
  },
  articleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  articleImageContainer: {
    height: 120,
  },
  articleImage: {
    flex: 1,
  },
  articleImageGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  articleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleIconText: {
    fontSize: 20,
  },
  articleViewsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  articleViewsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  articleCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  articleCategoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  articleDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  articleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleMetaIcon: {
    fontSize: 12,
  },
  articleMetaText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
});
