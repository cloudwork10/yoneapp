import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MoviesScreen() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const programmingMovies = [
    {
      id: 1,
      title: 'The Social Network',
      arabicTitle: 'الشبكة الاجتماعية',
      year: '2010',
      director: 'David Fincher',
      rating: '7.7/10',
      description: 'The story of how Mark Zuckerberg created Facebook and revolutionized social networking.',
      arabicDescription: 'قصة كيف أنشأ مارك زوكربيرج فيسبوك وأحدث ثورة في الشبكات الاجتماعية.',
      category: 'Startup & Innovation',
      duration: '2h 0m',
      image: 'https://m.media-amazon.com/images/M/MV5BOGUyZDUxZjEtMmIzMC00MzlmLTg4MGItZWJmMzBhZjE0Mjc1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
      whyWatch: 'Learn about startup culture, coding under pressure, and the tech industry dynamics.',
      arabicWhyWatch: 'تعلم عن ثقافة الشركات الناشئة والبرمجة تحت الضغط وديناميكيات صناعة التكنولوجيا.',
      lessons: [
        'Startup development process',
        'Team dynamics in tech companies',
        'Legal aspects of tech startups',
        'Innovation and competition'
      ]
    },
    {
      id: 2,
      title: 'The Imitation Game',
      arabicTitle: 'لعبة التقليد',
      year: '2014',
      director: 'Morten Tyldum',
      rating: '8.0/10',
      description: 'The story of Alan Turing, who helped break the Enigma code during WWII.',
      arabicDescription: 'قصة آلان تورينج الذي ساعد في كسر شفرة إنيجما خلال الحرب العالمية الثانية.',
      category: 'Cryptography & Algorithms',
      duration: '1h 54m',
      image: 'https://m.media-amazon.com/images/M/MV5BOTgwMzFiMWYtZDhlNS00ODNkLWJiODAtZDVhNzgyNzJhYjQ4L2ltYWdlXkEyXkFqcGdeQXVyNzEzOTYxNTQ@._V1_SX300.jpg',
      whyWatch: 'Understand the importance of algorithms, cryptography, and problem-solving in programming.',
      arabicWhyWatch: 'فهم أهمية الخوارزميات والتشفير وحل المشكلات في البرمجة.',
      lessons: [
        'Algorithm design and optimization',
        'Cryptography fundamentals',
        'Problem-solving methodologies',
        'Historical impact of computing'
      ]
    },
    {
      id: 3,
      title: 'Ex Machina',
      arabicTitle: 'إكس ماشينا',
      year: '2014',
      director: 'Alex Garland',
      rating: '7.7/10',
      description: 'A programmer is invited to test the human qualities of an AI robot.',
      arabicDescription: 'يُدعى مبرمج لاختبار الصفات الإنسانية لروبوت ذكي.',
      category: 'Artificial Intelligence',
      duration: '1h 48m',
      image: 'https://m.media-amazon.com/images/M/MV5BMTUxNzc0OTIxMV5BMl5BanBnXkFtZTgwNDI3NzU2NDE@._V1_SX300.jpg',
      whyWatch: 'Explore AI ethics, machine learning concepts, and the future of programming.',
      arabicWhyWatch: 'استكشف أخلاقيات الذكاء الاصطناعي ومفاهيم التعلم الآلي ومستقبل البرمجة.',
      lessons: [
        'AI and machine learning ethics',
        'Human-computer interaction',
        'Future of programming',
        'Technology and society'
      ]
    },
    {
      id: 4,
      title: 'Hackers',
      arabicTitle: 'الهاكرز',
      year: '1995',
      director: 'Iain Softley',
      rating: '6.2/10',
      description: 'A group of young hackers discover a plot to frame them for a crime.',
      arabicDescription: 'مجموعة من الهاكرز الشباب تكتشف مؤامرة لإلصاق جريمة بهم.',
      category: 'Cybersecurity',
      duration: '1h 47m',
      image: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
      whyWatch: 'Learn about cybersecurity, ethical hacking, and computer security principles.',
      arabicWhyWatch: 'تعلم عن الأمن السيبراني والاختراق الأخلاقي ومبادئ أمان الكمبيوتر.',
      lessons: [
        'Cybersecurity fundamentals',
        'Ethical hacking principles',
        'Network security',
        'Computer forensics'
      ]
    },
    {
      id: 5,
      title: 'WarGames',
      arabicTitle: 'ألعاب الحرب',
      year: '1983',
      director: 'John Badham',
      rating: '7.1/10',
      description: 'A young hacker accidentally accesses a military supercomputer.',
      arabicDescription: 'هاكر شاب يصل بالصدفة إلى حاسوب عسكري فائق.',
      category: 'Classic Programming',
      duration: '1h 54m',
      image: 'https://m.media-amazon.com/images/M/MV5BMjI1NTg3NzYxNV5BMl5BanBnXkFtZTcwNjk5NTQ5Mw@@._V1_SX300.jpg',
      whyWatch: 'Understand early computing, programming culture, and the evolution of technology.',
      arabicWhyWatch: 'فهم الحوسبة المبكرة وثقافة البرمجة وتطور التكنولوجيا.',
      lessons: [
        'Early computing history',
        'Programming culture evolution',
        'Technology and warfare',
        'Ethics in technology'
      ]
    },
    {
      id: 6,
      title: 'The Matrix',
      arabicTitle: 'المصفوفة',
      year: '1999',
      director: 'The Wachowskis',
      rating: '8.7/10',
      description: 'A computer programmer discovers reality is a simulation.',
      arabicDescription: 'مبرمج كمبيوتر يكتشف أن الواقع محاكاة.',
      category: 'Virtual Reality & Simulation',
      duration: '2h 16m',
      image: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
      whyWatch: 'Explore concepts of virtual reality, simulation, and the nature of reality in programming.',
      arabicWhyWatch: 'استكشف مفاهيم الواقع الافتراضي والمحاكاة وطبيعة الواقع في البرمجة.',
      lessons: [
        'Virtual reality concepts',
        'Simulation programming',
        'Reality vs. virtual worlds',
        'Philosophy of technology'
      ]
    },
    {
      id: 7,
      title: 'Tron',
      arabicTitle: 'ترون',
      year: '1982',
      director: 'Steven Lisberger',
      rating: '6.8/10',
      description: 'A computer programmer is transported into a digital world.',
      arabicDescription: 'مبرمج كمبيوتر يُنقل إلى عالم رقمي.',
      category: 'Digital Worlds',
      duration: '1h 36m',
      image: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Tron_poster.jpg',
      whyWatch: 'Visualize programming concepts, digital environments, and computer graphics.',
      arabicWhyWatch: 'تصور مفاهيم البرمجة والبيئات الرقمية ورسومات الكمبيوتر.',
      lessons: [
        'Computer graphics programming',
        'Digital world concepts',
        'User interface design',
        'Game development basics'
      ]
    },
    {
      id: 8,
      title: 'Sneakers',
      arabicTitle: 'المراوغون',
      year: '1992',
      director: 'Phil Alden Robinson',
      rating: '7.1/10',
      description: 'A team of security experts is hired to test security systems.',
      arabicDescription: 'فريق من خبراء الأمن يُوظف لاختبار أنظمة الأمان.',
      category: 'Security & Cryptography',
      duration: '2h 6m',
      image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Sneakers_ver1.jpg',
      whyWatch: 'Learn about security testing, cryptography, and ethical hacking practices.',
      arabicWhyWatch: 'تعلم عن اختبار الأمان والتشفير وممارسات الاختراق الأخلاقي.',
      lessons: [
        'Security system testing',
        'Cryptographic methods',
        'Penetration testing',
        'Information security'
      ]
    }
  ];

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Programming Movies</Text>
              <Text style={styles.subtitle}>Best movies for programmers and developers</Text>
            </View>
          </View>

          {/* Featured Movie */}
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Movie</Text>
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => openModal(programmingMovies[0])}
            >
              <ImageBackground
                source={{ uri: programmingMovies[0].image }}
                style={styles.featuredImage}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle}>{programmingMovies[0].title}</Text>
                    <Text style={styles.featuredYear}>{programmingMovies[0].year}</Text>
                    <Text style={styles.featuredDescription}>{programmingMovies[0].description}</Text>
                    <View style={styles.featuredMeta}>
                      <Text style={styles.featuredRating}>⭐ {programmingMovies[0].rating}</Text>
                      <Text style={styles.featuredCategory}>{programmingMovies[0].category}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Movies Grid */}
          <View style={styles.moviesSection}>
            <Text style={styles.sectionTitle}>All Movies</Text>
            <View style={styles.moviesGrid}>
              {programmingMovies.map((movie) => (
                <TouchableOpacity 
                  key={movie.id} 
                  style={styles.movieCard}
                  onPress={() => openModal(movie)}
                >
                  <ImageBackground
                    source={{ uri: movie.image }}
                    style={styles.movieImage}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                      style={styles.movieGradient}
                    >
                      <View style={styles.movieContent}>
                        <Text style={styles.movieTitle}>{movie.title}</Text>
                        <Text style={styles.movieYear}>{movie.year}</Text>
                        <Text style={styles.movieRating}>⭐ {movie.rating}</Text>
                        <Text style={styles.movieCategory}>{movie.category}</Text>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Movie Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedMovie && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Movie Details</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.movieInfoSection}>
                      <Text style={styles.movieTitleLarge}>{selectedMovie.title}</Text>
                      <Text style={styles.movieTitleArabic}>{selectedMovie.arabicTitle}</Text>
                      <Text style={styles.movieYearLarge}>{selectedMovie.year}</Text>
                    </View>

                    <View style={styles.detailsSection}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Director:</Text>
                        <Text style={styles.detailValue}>{selectedMovie.director}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Rating:</Text>
                        <Text style={styles.detailValue}>⭐ {selectedMovie.rating}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Duration:</Text>
                        <Text style={styles.detailValue}>{selectedMovie.duration}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Category:</Text>
                        <Text style={styles.detailValue}>{selectedMovie.category}</Text>
                      </View>
                    </View>

                    <View style={styles.descriptionSection}>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.descriptionText}>{selectedMovie.description}</Text>
                      <Text style={styles.descriptionArabic}>{selectedMovie.arabicDescription}</Text>
                    </View>

                    <View style={styles.whyWatchSection}>
                      <Text style={styles.sectionTitle}>Why Watch?</Text>
                      <Text style={styles.whyWatchText}>{selectedMovie.whyWatch}</Text>
                      <Text style={styles.whyWatchArabic}>{selectedMovie.arabicWhyWatch}</Text>
                    </View>

                    <View style={styles.lessonsSection}>
                      <Text style={styles.sectionTitle}>Programming Lessons</Text>
                      {selectedMovie.lessons.map((lesson, index) => (
                        <View key={index} style={styles.lessonItem}>
                          <Text style={styles.lessonNumber}>{index + 1}</Text>
                          <Text style={styles.lessonText}>{lesson}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  featuredSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  featuredCard: {
    height: 200,
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
    alignItems: 'flex-start',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  featuredYear: {
    fontSize: 16,
    color: '#E50914',
    marginBottom: 10,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  featuredRating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  featuredCategory: {
    fontSize: 12,
    color: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moviesSection: {
    marginBottom: 30,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieCard: {
    width: '48%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  movieImage: {
    flex: 1,
  },
  movieGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  movieContent: {
    alignItems: 'flex-start',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  movieYear: {
    fontSize: 12,
    color: '#E50914',
    marginBottom: 5,
  },
  movieRating: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 2,
  },
  movieCategory: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '95%',
    height: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  movieInfoSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  movieTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  movieTitleArabic: {
    fontSize: 18,
    color: '#E50914',
    marginBottom: 10,
    textAlign: 'center',
  },
  movieYearLarge: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 10,
  },
  descriptionArabic: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  whyWatchSection: {
    marginBottom: 20,
  },
  whyWatchText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 10,
  },
  whyWatchArabic: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  lessonsSection: {
    marginBottom: 20,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
  },
  lessonNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E50914',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  lessonText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
