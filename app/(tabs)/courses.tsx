import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  thumbnail: string;
  description: string;
  price: number;
  category: string;
}

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science'];

  const handleCoursePress = (course: Course) => {
    router.push({
      pathname: '/course-details',
      params: { courseId: course.id }
    });
  };

  // Sample courses data
  const sampleCourses: Course[] = [
    {
      id: '1',
      title: 'Complete React Native Development',
      instructor: 'John Smith',
      duration: '12 hours',
      level: 'Intermediate',
      rating: 4.8,
      students: 15420,
      thumbnail: '📱',
      description: 'Learn to build mobile apps with React Native from scratch',
      price: 0,
      category: 'Programming',
    },
    {
      id: '2',
      title: 'UI/UX Design Masterclass',
      instructor: 'Sarah Johnson',
      duration: '8 hours',
      level: 'Beginner',
      rating: 4.9,
      students: 8930,
      thumbnail: '🎨',
      description: 'Master the art of user interface and experience design',
      price: 0,
      category: 'Design',
    },
    {
      id: '3',
      title: 'JavaScript Fundamentals',
      instructor: 'Mike Chen',
      duration: '15 hours',
      level: 'Beginner',
      rating: 4.7,
      students: 25680,
      thumbnail: '⚡',
      description: 'Complete guide to JavaScript programming language',
      price: 0,
      category: 'Programming',
    },
    {
      id: '4',
      title: 'Digital Marketing Strategy',
      instructor: 'Emily Davis',
      duration: '10 hours',
      level: 'Intermediate',
      rating: 4.6,
      students: 12350,
      thumbnail: '📈',
      description: 'Learn effective digital marketing strategies for business growth',
      price: 0,
      category: 'Marketing',
    },
    {
      id: '5',
      title: 'Python for Data Science',
      instructor: 'Dr. Alex Kumar',
      duration: '20 hours',
      level: 'Advanced',
      rating: 4.9,
      students: 18750,
      thumbnail: '🐍',
      description: 'Advanced Python programming for data analysis and machine learning',
      price: 0,
      category: 'Data Science',
    },
    {
      id: '6',
      title: 'Business Analytics',
      instructor: 'Lisa Wang',
      duration: '14 hours',
      level: 'Intermediate',
      rating: 4.5,
      students: 9870,
      thumbnail: '📊',
      description: 'Transform data into business insights and decisions',
      price: 0,
      category: 'Business',
    },
  ];

  useEffect(() => {
    // Simulate loading courses from API
    setTimeout(() => {
      setCourses(sampleCourses);
      setFilteredCourses(sampleCourses);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory, courses]);

  const filterCourses = () => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };


  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <View style={styles.courseImageContainer}>
        <LinearGradient
          colors={['#E50914', '#FF6B6B', '#FF8E53']}
          style={styles.courseImageGradient}
        >
          <Text style={styles.courseThumbnail}>{item.thumbnail}</Text>
        </LinearGradient>
        <View style={styles.courseOverlay}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.courseInstructor}>by {item.instructor}</Text>
        
        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statText}>{item.students.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statText}>{item.level}</Text>
          </View>
        </View>
        
        <View style={styles.courseFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero Section with Background - Full Screen */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.heroBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          >
            <SafeAreaView style={styles.heroSafeArea}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Master New Skills</Text>
                <Text style={styles.heroSubtitle}>Discover thousands of courses from industry experts</Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>500+</Text>
                    <Text style={styles.heroStatLabel}>Courses</Text>
                  </View>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>50K+</Text>
                    <Text style={styles.heroStatLabel}>Students</Text>
                  </View>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>4.8</Text>
                    <Text style={styles.heroStatLabel}>Rating</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      </View>

        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Text style={styles.searchIcon}>🔍</Text>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>

        {/* Courses List */}
        <FlatList
          data={filteredCourses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          style={styles.scrollView}
          contentContainerStyle={styles.coursesList}
          showsVerticalScrollIndicator={false}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Hero Section Styles - Full Screen
  heroSection: {
    height: 350,
    position: 'relative',
  },
  heroSafeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  heroBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchSection: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '300',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  coursesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  courseImageContainer: {
    position: 'relative',
    height: 200,
  },
  courseImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseThumbnail: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  courseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#E50914',
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  courseContent: {
    padding: 15,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  courseDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 15,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
  },
  categoryBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  categoryText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  enrollButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
