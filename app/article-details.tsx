import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ArticleDetailsScreen() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams();

  // Mock article data - in a real app, this would come from an API
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
      views: '2.3k',
      content: `
        React Native performance optimization is crucial for creating smooth, responsive mobile applications. Here are 10 essential tips to improve your app's performance:

        1. **Use FlatList Instead of ScrollView**
        For large lists, FlatList provides better performance with virtualization and lazy loading.

        2. **Optimize Images**
        Use appropriate image formats and sizes. Consider using WebP format for better compression.

        3. **Avoid Inline Functions**
        Inline functions in render methods cause unnecessary re-renders. Extract them to class methods or use useCallback.

        4. **Use React.memo**
        Wrap functional components with React.memo to prevent unnecessary re-renders.

        5. **Optimize Bundle Size**
        Remove unused dependencies and use dynamic imports for large libraries.

        6. **Use Native Modules**
        For performance-critical operations, consider using native modules.

        7. **Implement Proper State Management**
        Use Redux, Context API, or other state management solutions to avoid prop drilling.

        8. **Profile Your App**
        Use React Native's built-in profiler to identify performance bottlenecks.

        9. **Optimize Network Requests**
        Implement proper caching and use appropriate request methods.

        10. **Test on Real Devices**
        Always test performance on actual devices, not just simulators.
      `,
      tags: ['React Native', 'Performance', 'Mobile Development', 'Optimization']
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
      views: '5.1k',
      content: `
        JavaScript closures are one of the most powerful and often misunderstood concepts in the language. Understanding closures is essential for writing effective JavaScript code.

        **What is a Closure?**
        A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. This means the inner function "closes over" the outer function's variables.

        **How Closures Work**
        When a function is created, it captures the lexical environment in which it was defined. This includes all variables in the outer scope at the time of creation.

        **Practical Examples**
        1. **Data Privacy**: Closures can be used to create private variables and methods.
        2. **Function Factories**: Create functions that generate other functions with specific configurations.
        3. **Event Handlers**: Maintain state in event handlers.
        4. **Module Pattern**: Create modules with private and public methods.

        **Common Use Cases**
        - Creating private variables
        - Implementing the module pattern
        - Building function factories
        - Managing asynchronous operations
        - Creating decorators and higher-order functions

        **Best Practices**
        - Be mindful of memory leaks
        - Use closures judiciously
        - Understand the scope chain
        - Test your code thoroughly
      `,
      tags: ['JavaScript', 'Closures', 'Programming', 'Web Development']
    },
    // Add more articles as needed...
  ];

  const article = articles.find(a => a.id === parseInt(articleId as string)) || articles[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: article.image }}
            style={styles.heroBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            >
              {/* Back Button */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              {/* Article Info - Better positioned */}
              <View style={styles.articleInfoFixed}>
                <View style={styles.articleBadge}>
                  <Text style={styles.articleBadgeText}>{article.category.toUpperCase()}</Text>
                </View>
                <Text style={styles.articleTitleFixed}>{article.title}</Text>
                <Text style={styles.articleDescriptionFixed}>{article.description}</Text>
                <View style={styles.articleMetaFixed}>
                  <View style={styles.metaItemFixed}>
                    <Text style={styles.metaIconFixed}>👤</Text>
                    <Text style={styles.metaTextFixed}>{article.author}</Text>
                  </View>
                  <View style={styles.metaItemFixed}>
                    <Text style={styles.metaIconFixed}>⏱️</Text>
                    <Text style={styles.metaTextFixed}>{article.readTime}</Text>
                  </View>
                  <View style={styles.metaItemFixed}>
                    <Text style={styles.metaIconFixed}>👁️</Text>
                    <Text style={styles.metaTextFixed}>{article.views}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Article Content */}
        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{article.content}</Text>
        </View>

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {article.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Author Section */}
        <View style={styles.authorSection}>
          <Text style={styles.sectionTitle}>About the Author</Text>
          <View style={styles.authorCard}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarText}>{article.author.charAt(0)}</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{article.author}</Text>
              <Text style={styles.authorTitle}>Senior Developer & Technical Writer</Text>
              <Text style={styles.authorBio}>
                {article.author} is an experienced developer with over 8 years in the industry. 
                They specialize in {article.category} and are passionate about sharing knowledge 
                through technical writing and mentoring.
              </Text>
            </View>
          </View>
        </View>

        {/* Related Articles Section */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Articles</Text>
          <View style={styles.relatedContainer}>
            {articles.filter(a => a.id !== article.id).slice(0, 3).map((relatedArticle) => (
              <TouchableOpacity 
                key={relatedArticle.id} 
                style={styles.relatedCard}
                onPress={() => router.push(`/article-details?articleId=${relatedArticle.id}`)}
              >
                <ImageBackground
                  source={{ uri: relatedArticle.image }}
                  style={styles.relatedImage}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                    style={styles.relatedGradient}
                  >
                    <Text style={styles.relatedTitle}>{relatedArticle.title}</Text>
                    <View style={styles.relatedMeta}>
                      <Text style={styles.relatedAuthor}>{relatedArticle.author}</Text>
                      <Text style={styles.relatedReadTime}>{relatedArticle.readTime}</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.6,
    position: 'relative',
  },
  heroBackground: {
    flex: 1,
    resizeMode: 'cover',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Fixed positioning for better layout
  articleInfoFixed: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    paddingBottom: 20,
  },
  articleBadge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  articleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  articleTitleFixed: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  articleDescriptionFixed: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  articleMetaFixed: {
    flexDirection: 'row',
    gap: 25,
  },
  metaItemFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  metaIconFixed: {
    fontSize: 18,
  },
  metaTextFixed: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Content Section
  contentSection: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 28,
    textAlign: 'justify',
  },
  // Tags Section
  tagsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
  },
  // Author Section
  authorSection: {
    padding: 20,
    paddingTop: 0,
  },
  authorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
  },
  authorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  authorTitle: {
    fontSize: 14,
    color: '#E50914',
    marginBottom: 12,
  },
  authorBio: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  // Related Articles Section
  relatedSection: {
    padding: 20,
    paddingTop: 0,
  },
  relatedContainer: {
    gap: 16,
  },
  relatedCard: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  relatedImage: {
    flex: 1,
  },
  relatedGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  relatedMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relatedAuthor: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  relatedReadTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});
