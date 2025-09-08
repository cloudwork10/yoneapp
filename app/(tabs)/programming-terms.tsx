import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProgrammingTermsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
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
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
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
