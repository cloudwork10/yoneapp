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
        **Introduction to React Native Performance**

        React Native performance optimization is crucial for creating smooth, responsive mobile applications that provide an excellent user experience. In today's competitive mobile app market, users expect fast, fluid interactions, and poor performance can lead to negative reviews and user abandonment.

        **Understanding Performance Challenges**

        Mobile devices have limited resources compared to desktop computers. Memory constraints, CPU limitations, and battery life considerations all play a role in how your React Native app performs. Understanding these challenges is the first step toward building high-performance applications.

        **Essential Performance Optimization Strategies**

        **FlatList for Large Data Sets**
        When dealing with large lists of data, always use FlatList instead of ScrollView. FlatList provides virtualization, which means it only renders the items that are currently visible on screen. This dramatically reduces memory usage and improves scrolling performance, especially for lists with hundreds or thousands of items.

        **Image Optimization Techniques**
        Images are often the largest assets in mobile apps and can significantly impact performance. Use appropriate image formats like WebP for better compression, implement proper image sizing to avoid loading unnecessarily large images, and consider using image caching libraries to reduce network requests.

        **Function Optimization**
        Avoid creating inline functions in render methods as they cause unnecessary re-renders. Instead, extract these functions to class methods or use useCallback hook for functional components. This prevents the creation of new function instances on every render cycle.

        **Component Memoization**
        Use React.memo to wrap functional components that receive props that don't change frequently. This prevents unnecessary re-renders when parent components update but the props passed to the memoized component remain the same.

        **Bundle Size Optimization**
        Large bundle sizes lead to longer app startup times and increased memory usage. Remove unused dependencies, use dynamic imports for large libraries that aren't needed immediately, and consider code splitting to load only the necessary code for each screen.

        **Native Module Integration**
        For performance-critical operations like image processing, complex calculations, or heavy data manipulation, consider using native modules. These modules run on the native thread and can provide significant performance improvements for CPU-intensive tasks.

        **State Management Best Practices**
        Implement proper state management using Redux, Context API, or other solutions to avoid prop drilling and unnecessary re-renders. Keep your state as flat as possible and use selectors to compute derived state efficiently.

        **Performance Monitoring and Profiling**
        Use React Native's built-in profiler and tools like Flipper to identify performance bottlenecks. Regular performance testing helps you catch issues early and ensures your app maintains good performance as it grows.

        **Network Optimization**
        Implement proper caching strategies, use appropriate HTTP methods, and minimize the number of network requests. Consider using libraries like React Query for efficient data fetching and caching.

        **Real Device Testing**
        Always test your app's performance on actual devices, not just simulators. Real devices provide accurate performance metrics and help you identify issues that might not be apparent in development environments.

        **Conclusion**

        Optimizing React Native performance requires a comprehensive approach that considers all aspects of mobile app development. By implementing these strategies and continuously monitoring your app's performance, you can create applications that provide smooth, responsive user experiences that keep users engaged and satisfied.
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
        **Introduction to JavaScript Closures**

        JavaScript closures are one of the most powerful and often misunderstood concepts in the language. They represent a fundamental aspect of how JavaScript handles scope and function execution, making them essential for writing effective and sophisticated JavaScript code. Understanding closures opens the door to advanced programming patterns and helps developers write more maintainable and efficient applications.

        **What is a Closure?**

        A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. This means the inner function "closes over" the outer function's variables, creating a persistent reference to the lexical environment where it was defined. This behavior allows functions to maintain access to their surrounding context long after the outer function has finished executing.

        **How Closures Work**

        When a function is created in JavaScript, it captures the lexical environment in which it was defined. This includes all variables in the outer scope at the time of creation, creating a "closure" that preserves these references. The closure maintains this connection even when the outer function completes execution, allowing the inner function to access and modify these variables later.

        **The Lexical Scoping Mechanism**

        JavaScript uses lexical scoping, which means that the scope of a variable is determined by where it is declared in the code, not by where it is called. This is what makes closures possible - the inner function has access to the variables in the scope where it was written, regardless of when or where it is executed.

        **Practical Applications of Closures**

        **Data Privacy and Encapsulation**
        Closures provide a way to create private variables and methods in JavaScript, which doesn't have built-in privacy mechanisms. By returning an object with methods that have access to private variables through closures, you can create truly private data that cannot be accessed directly from outside the function.

        **Function Factories**
        Closures enable the creation of function factories - functions that generate other functions with specific configurations. This pattern is incredibly useful for creating specialized functions with preset parameters or behaviors, making your code more modular and reusable.

        **Event Handlers and Callbacks**
        Closures are essential for maintaining state in event handlers and callback functions. They allow you to preserve context and data between function calls, making it possible to create sophisticated event-driven applications with proper state management.

        **Module Pattern Implementation**
        The module pattern relies heavily on closures to create modules with private and public methods. This pattern helps organize code, prevent global namespace pollution, and create clean interfaces for your modules.

        **Asynchronous Operations**
        Closures are crucial for managing asynchronous operations in JavaScript. They help maintain context and state across asynchronous calls, making it possible to handle complex async workflows while preserving the necessary data and functionality.

        **Common Use Cases in Modern Development**

        **Creating Private Variables**
        One of the most common uses of closures is creating private variables that cannot be accessed directly from outside the function. This provides a level of data protection and encapsulation that's essential for building robust applications.

        **Implementing the Module Pattern**
        The module pattern uses closures to create self-contained modules with private and public interfaces. This helps organize code, reduce global namespace pollution, and create clean, maintainable codebases.

        **Building Function Factories**
        Function factories use closures to create specialized functions with preset configurations. This pattern is particularly useful in functional programming and when you need to create multiple similar functions with different parameters.

        **Managing Asynchronous Operations**
        Closures are essential for managing state and context in asynchronous operations. They help maintain data integrity across async calls and enable complex async workflows.

        **Creating Decorators and Higher-Order Functions**
        Closures enable the creation of decorators and higher-order functions that can modify or enhance the behavior of other functions. This is a powerful pattern for creating reusable, composable code.

        **Best Practices for Using Closures**

        **Memory Management**
        Be mindful of memory leaks when using closures. Since closures maintain references to their outer scope, they can prevent garbage collection of variables that might otherwise be cleaned up. Always consider the lifecycle of your closures and ensure they don't hold unnecessary references.

        **Judicious Use**
        While closures are powerful, they should be used judiciously. Overuse can lead to complex code that's difficult to debug and maintain. Use closures when they provide clear benefits and make your code more readable and maintainable.

        **Understanding the Scope Chain**
        It's crucial to understand how the scope chain works in JavaScript. This knowledge helps you predict closure behavior and avoid common pitfalls related to variable access and modification.

        **Thorough Testing**
        Always test your code thoroughly when using closures, especially in complex scenarios. Closures can create subtle bugs that are difficult to track down, so comprehensive testing is essential.

        **Conclusion**

        Closures are a fundamental concept in JavaScript that enables powerful programming patterns and sophisticated applications. By understanding how closures work and when to use them, developers can write more efficient, maintainable, and elegant code. The key is to use closures thoughtfully, understanding both their benefits and potential pitfalls, to create robust and scalable JavaScript applications.
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
          <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>📖 Article Content</Text>
            <View style={styles.contentDivider} />
          </View>
          
          <View style={styles.contentWrapper}>
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                // Bold headings
                const heading = paragraph.replace(/\*\*/g, '').trim();
                return (
                  <View key={index} style={styles.headingContainer}>
                    <Text style={styles.headingText}>{heading}</Text>
                    <View style={styles.headingUnderline} />
                  </View>
                );
              } else if (paragraph.trim().startsWith('**') && paragraph.includes('**')) {
                // Bold text within paragraph
                const parts = paragraph.split(/(\*\*.*?\*\*)/);
                return (
                  <View key={index} style={styles.paragraphContainer}>
                    <Text style={styles.paragraphText}>
                      {parts.map((part, partIndex) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return (
                            <Text key={partIndex} style={styles.boldText}>
                              {part.replace(/\*\*/g, '')}
                            </Text>
                          );
                        }
                        return part;
                      })}
                    </Text>
                  </View>
                );
              } else if (/^\d+\./.test(paragraph.trim())) {
                // Numbered list items
                return (
                  <View key={index} style={styles.listItemContainer}>
                    <View style={styles.listItemNumber}>
                      <Text style={styles.listItemNumberText}>
                        {paragraph.match(/^\d+/)?.[0] || index + 1}
                      </Text>
                    </View>
                    <Text style={styles.listItemText}>
                      {paragraph.replace(/^\d+\.\s*/, '')}
                    </Text>
                  </View>
                );
              } else if (paragraph.trim().length > 0) {
                // Regular paragraphs
                return (
                  <View key={index} style={styles.paragraphContainer}>
                    <Text style={styles.paragraphText}>{paragraph.trim()}</Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleIcon}>🏷️</Text>
            <Text style={styles.sectionTitle}>Related Tags</Text>
            <Text style={styles.sectionTitleAccent}>Explore</Text>
          </View>
          <View style={styles.tagsContainer}>
            {article.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text style={styles.tagIcon}>#</Text>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Author Section */}
        <View style={styles.authorSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleIcon}>👤</Text>
            <Text style={styles.sectionTitle}>Meet the Author</Text>
            <Text style={styles.sectionTitleAccent}>Expert</Text>
          </View>
          <View style={styles.authorCard}>
            <View style={styles.authorAvatarContainer}>
              <View style={styles.authorAvatar}>
                <Text style={styles.avatarText}>{article.author.charAt(0)}</Text>
              </View>
              <View style={styles.authorStatus}>
                <Text style={styles.statusText}>●</Text>
                <Text style={styles.statusLabel}>Online</Text>
              </View>
            </View>
            <View style={styles.authorInfo}>
              <View style={styles.authorNameContainer}>
                <Text style={styles.authorName}>{article.author}</Text>
                <Text style={styles.authorVerified}>✓</Text>
              </View>
              <Text style={styles.authorTitle}>Senior Developer & Technical Writer</Text>
              <Text style={styles.authorBio}>
                {article.author} is an experienced developer with over 8 years in the industry. 
                They specialize in {article.category} and are passionate about sharing knowledge 
                through technical writing and mentoring.
              </Text>
              <View style={styles.authorStats}>
                <View style={styles.authorStat}>
                  <Text style={styles.authorStatNumber}>8+</Text>
                  <Text style={styles.authorStatLabel}>Years Experience</Text>
                </View>
                <View style={styles.authorStat}>
                  <Text style={styles.authorStatNumber}>50+</Text>
                  <Text style={styles.authorStatLabel}>Articles Written</Text>
                </View>
                <View style={styles.authorStat}>
                  <Text style={styles.authorStatNumber}>10k+</Text>
                  <Text style={styles.authorStatLabel}>Readers</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Related Articles Section */}
        <View style={styles.relatedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleIcon}>📚</Text>
            <Text style={styles.sectionTitle}>You Might Also Like</Text>
            <Text style={styles.sectionTitleAccent}>Discover</Text>
          </View>
          <View style={styles.relatedContainer}>
            {articles.filter(a => a.id !== article.id).slice(0, 3).map((relatedArticle, index) => (
              <TouchableOpacity 
                key={relatedArticle.id} 
                style={styles.relatedCard}
                onPress={() => router.push(`/article-details?articleId=${relatedArticle.id}`)}
              >
                <View style={styles.relatedCardHeader}>
                  <Text style={styles.relatedCardNumber}>0{index + 1}</Text>
                  <View style={styles.relatedCardBadge}>
                    <Text style={styles.relatedCardBadgeText}>{relatedArticle.category}</Text>
                  </View>
                </View>
                <ImageBackground
                  source={{ uri: relatedArticle.image }}
                  style={styles.relatedImage}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                    style={styles.relatedGradient}
                  >
                    <Text style={styles.relatedTitle}>{relatedArticle.title}</Text>
                    <View style={styles.relatedMeta}>
                      <View style={styles.relatedMetaItem}>
                        <Text style={styles.relatedMetaIcon}>👤</Text>
                        <Text style={styles.relatedAuthor}>{relatedArticle.author}</Text>
                      </View>
                      <View style={styles.relatedMetaItem}>
                        <Text style={styles.relatedMetaIcon}>⏱️</Text>
                        <Text style={styles.relatedReadTime}>{relatedArticle.readTime}</Text>
                      </View>
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
  contentHeader: {
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'left',
  },
  contentDivider: {
    height: 3,
    backgroundColor: '#E50914',
    borderRadius: 2,
    width: 60,
    alignSelf: 'flex-start',
  },
  contentWrapper: {
    gap: 20,
  },
  headingContainer: {
    marginBottom: 16,
  },
  headingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 8,
    textAlign: 'left',
  },
  headingUnderline: {
    height: 2,
    backgroundColor: '#E50914',
    borderRadius: 1,
    width: 100,
    alignSelf: 'flex-start',
  },
  paragraphContainer: {
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 28,
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#E50914',
  },
  listItemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  listItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  listItemNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  // Tags Section
  tagsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  sectionTitleAccent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E50914',
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E50914',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tagIcon: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  tagText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Author Section
  authorSection: {
    padding: 20,
    paddingTop: 0,
  },
  authorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  authorAvatarContainer: {
    alignItems: 'center',
  },
  authorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  authorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#00FF00',
    fontSize: 12,
    marginRight: 4,
  },
  statusLabel: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  authorVerified: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorTitle: {
    fontSize: 16,
    color: '#E50914',
    marginBottom: 16,
    fontWeight: '600',
  },
  authorBio: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
    marginBottom: 20,
  },
  authorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  authorStat: {
    alignItems: 'center',
    flex: 1,
  },
  authorStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 4,
  },
  authorStatLabel: {
    fontSize: 10,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  // Related Articles Section
  relatedSection: {
    padding: 20,
    paddingTop: 0,
  },
  relatedContainer: {
    gap: 20,
  },
  relatedCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  relatedCardHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  relatedCardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  relatedCardBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relatedCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
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
    marginBottom: 12,
    lineHeight: 22,
  },
  relatedMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relatedMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedMetaIcon: {
    fontSize: 12,
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
