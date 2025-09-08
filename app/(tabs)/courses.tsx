import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

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

  // Create a courses-themed background
  const CoursesBackground = () => (
    <View style={styles.backgroundContainer}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0f0f0f', '#000000']}
        style={styles.backgroundGradient}
      />
      <View style={styles.codingOverlay}>
        <Text style={styles.codeLine1}>// Available Courses</Text>
        <Text style={styles.codeLine2}>const courses = [</Text>
        <Text style={styles.codeLine3}>  'React Native',</Text>
        <Text style={styles.codeLine4}>  'Node.js',</Text>
        <Text style={styles.codeLine5}>  'MongoDB',</Text>
        <Text style={styles.codeLine6}>  'JavaScript',</Text>
        <Text style={styles.codeLine7}>  'TypeScript'</Text>
        <Text style={styles.codeLine8}>];</Text>
        <Text style={styles.codeLine9}>// Start your learning journey today!</Text>
      </View>
      {/* Add some geometric shapes for visual interest */}
      <View style={styles.geometricShapes}>
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
      </View>
    </View>
  );

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

  const handleCoursePress = (course: Course) => {
    Alert.alert(
      course.title,
      `Instructor: ${course.instructor}\nDuration: ${course.duration}\nLevel: ${course.level}\nRating: ${course.rating} ⭐\nStudents: ${course.students.toLocaleString()}\n\n${course.description}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Enroll', onPress: () => enrollInCourse(course) }
      ]
    );
  };

  const enrollInCourse = (course: Course) => {
    Alert.alert('Success!', `You have successfully enrolled in "${course.title}"!`);
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <View style={styles.courseHeader}>
        <Text style={styles.courseThumbnail}>{item.thumbnail}</Text>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.courseInstructor}>by {item.instructor}</Text>
        </View>
      </View>
      
      <Text style={styles.courseDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
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
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statText}>{item.duration}</Text>
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
        <TouchableOpacity style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>Enroll Free</Text>
        </TouchableOpacity>
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
      {/* Full-screen background */}
      <CoursesBackground />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Courses</Text>
          <Text style={styles.headerSubtitle}>Learn something new today</Text>
        </View>

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

        {/* Courses List */}
        <FlatList
          data={filteredCourses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.coursesList}
        />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Background styles
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundGradient: {
    flex: 1,
  },
  codingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    opacity: 0.08,
  },
  codeLine1: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  codeLine2: {
    fontSize: 16,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  codeLine3: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 4,
    marginLeft: 20,
  },
  codeLine4: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 4,
    marginLeft: 20,
  },
  codeLine5: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 4,
    marginLeft: 20,
  },
  codeLine6: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 4,
    marginLeft: 20,
  },
  codeLine7: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 8,
    marginLeft: 20,
  },
  codeLine8: {
    fontSize: 16,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  codeLine9: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 20,
  },
  geometricShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    opacity: 0.05,
  },
  shape1: {
    width: 80,
    height: 80,
    backgroundColor: '#E50914',
    borderRadius: 40,
    top: '15%',
    right: '15%',
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    width: 60,
    height: 60,
    backgroundColor: '#00ff00',
    top: '70%',
    left: '10%',
    transform: [{ rotate: '30deg' }],
  },
  shape3: {
    width: 100,
    height: 100,
    backgroundColor: '#0066ff',
    borderRadius: 15,
    top: '40%',
    right: '25%',
    transform: [{ rotate: '-30deg' }],
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
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseThumbnail: {
    fontSize: 32,
    marginRight: 15,
  },
  courseInfo: {
    flex: 1,
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
