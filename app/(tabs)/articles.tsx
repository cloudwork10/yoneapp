import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles from API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://192.168.100.41:3000/api/public/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.data.articles || []);
      } else {
        console.error('Failed to fetch articles:', response.status);
        // Fallback to sample data if API fails
        setArticles(getSampleArticles());
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Fallback to sample data if API fails
      setArticles(getSampleArticles());
    } finally {
      setLoading(false);
    }
  };

  const getSampleArticles = () => [
    {
      id: 1,
      title: 'Getting Started with React Native',
      description: 'Learn the basics of React Native development and build your first mobile app.',
      author: 'Ahmed Hassan',
      readTime: '8 min read',
      category: 'programming',
      views: 1250,
      likes: 89,
      image: 'https://via.placeholder.com/300x200/1a1a1a/4ECDC4?text=React+Native',
      icon: '💻',
      color: '#4ECDC4'
    },
    {
      id: 2,
      title: 'UI/UX Design Principles',
      description: 'Essential design principles every developer should know for better user experience.',
      author: 'Sarah Mohamed',
      readTime: '6 min read',
      category: 'design',
      views: 980,
      likes: 67,
      image: 'https://via.placeholder.com/300x200/1a1a1a/FF6B35?text=UI+UX',
      icon: '🎨',
      color: '#FF6B35'
    },
    {
      id: 3,
      title: 'Freelancing Success Tips',
      description: 'How to build a successful freelancing career in the tech industry.',
      author: 'Omar Ali',
      readTime: '10 min read',
      category: 'freelancing',
      views: 750,
      likes: 45,
      image: 'https://via.placeholder.com/300x200/1a1a1a/E50914?text=Freelancing',
      icon: '💼',
      color: '#E50914'
    }
  ];
  
  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'programming', name: 'Programming', icon: '💻' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'freelancing', name: 'Freelancing', icon: '💼' },
    { id: 'career', name: 'Start Your Career', icon: '🚀' },
  ];
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading articles...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
          {articles.length > 0 && (
            <View style={styles.featuredSection}>
              <TouchableOpacity 
                style={styles.featuredCard}
                onPress={() => router.push(`/article-details?articleId=${articles[0]._id || articles[0].id}`)}
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
          )}

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
                  key={`article-category-${category.id}`}
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
              {filteredArticles.map((article, index) => (
                <TouchableOpacity 
                  key={article._id || article.id || `article-${index}`} 
                  style={styles.articleCard}
                  onPress={() => router.push(`/article-details?articleId=${article._id || article.id}`)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
