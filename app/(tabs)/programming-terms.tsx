import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ProgrammingTermsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create a programming terms-themed background
  const ProgrammingBackground = () => (
    <View style={styles.backgroundContainer}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0f0f0f', '#000000']}
        style={styles.backgroundGradient}
      />
      <View style={styles.codingOverlay}>
        <Text style={styles.codeLine1}>// Programming Terms Dictionary</Text>
        <Text style={styles.codeLine2}>const terms = {`{`}</Text>
        <Text style={styles.codeLine3}>  API: 'Application Programming Interface',</Text>
        <Text style={styles.codeLine4}>  DOM: 'Document Object Model',</Text>
        <Text style={styles.codeLine5}>  JSON: 'JavaScript Object Notation',</Text>
        <Text style={styles.codeLine6}>  REST: 'Representational State Transfer',</Text>
        <Text style={styles.codeLine7}>  CRUD: 'Create, Read, Update, Delete'</Text>
        <Text style={styles.codeLine8}>{`};`}</Text>
        <Text style={styles.codeLine9}>// Expand your programming vocabulary!</Text>
      </View>
      {/* Add some geometric shapes for visual interest */}
      <View style={styles.geometricShapes}>
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
      </View>
    </View>
  );
  
  const terms = [
    { 
      id: 1, 
      term: 'API', 
      definition: 'Application Programming Interface - a set of protocols and tools for building software applications',
      category: 'Web Development'
    },
    { 
      id: 2, 
      term: 'React Hooks', 
      definition: 'Functions that let you use state and other React features in functional components',
      category: 'React'
    },
    { 
      id: 3, 
      term: 'MongoDB', 
      definition: 'A NoSQL document database that stores data in flexible, JSON-like documents',
      category: 'Database'
    },
    { 
      id: 4, 
      term: 'Middleware', 
      definition: 'Software that acts as a bridge between different applications or services',
      category: 'Backend'
    },
    { 
      id: 5, 
      term: 'Async/Await', 
      definition: 'JavaScript syntax for handling asynchronous operations in a more readable way',
      category: 'JavaScript'
    },
    { 
      id: 6, 
      term: 'Git', 
      definition: 'A distributed version control system for tracking changes in source code',
      category: 'Version Control'
    },
    { 
      id: 7, 
      term: 'Docker', 
      definition: 'A platform for developing, shipping, and running applications in containers',
      category: 'DevOps'
    },
    { 
      id: 8, 
      term: 'REST', 
      definition: 'Representational State Transfer - an architectural style for designing web services',
      category: 'Web Development'
    },
  ];

  const filteredTerms = terms.filter(term => 
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Full-screen background */}
      <ProgrammingBackground />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Programming Terms</Text>
          <Text style={styles.subtitle}>Learn the language of coding</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search terms..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.termsContainer}>
          {filteredTerms.map((term) => (
            <View key={term.id} style={styles.termCard}>
              <View style={styles.termHeader}>
                <Text style={styles.termName}>{term.term}</Text>
                <Text style={styles.termCategory}>{term.category}</Text>
              </View>
              
              <Text style={styles.termDefinition}>{term.definition}</Text>
            </View>
          ))}
        </View>
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
    width: 70,
    height: 70,
    backgroundColor: '#E50914',
    borderRadius: 35,
    top: '20%',
    right: '20%',
    transform: [{ rotate: '60deg' }],
  },
  shape2: {
    width: 50,
    height: 50,
    backgroundColor: '#00ff00',
    top: '65%',
    left: '15%',
    transform: [{ rotate: '45deg' }],
  },
  shape3: {
    width: 90,
    height: 90,
    backgroundColor: '#0066ff',
    borderRadius: 20,
    top: '35%',
    right: '10%',
    transform: [{ rotate: '-45deg' }],
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
  searchContainer: {
    marginBottom: 25,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  termsContainer: {
    gap: 15,
  },
  termCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  termName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E50914',
    flex: 1,
  },
  termCategory: {
    fontSize: 12,
    color: '#CCCCCC',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  termDefinition: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
