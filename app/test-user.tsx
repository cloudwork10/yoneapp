import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '@/contexts/UserContext';

export default function TestUserScreen() {
  const { user, isLoading, isAdmin } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Context Test</Text>
      
      <Text style={styles.label}>Is Loading:</Text>
      <Text style={styles.value}>{isLoading ? 'Yes' : 'No'}</Text>
      
      <Text style={styles.label}>User:</Text>
      <Text style={styles.value}>{user ? JSON.stringify(user, null, 2) : 'No user'}</Text>
      
      <Text style={styles.label}>Is Admin:</Text>
      <Text style={styles.value}>{isAdmin ? 'Yes' : 'No'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
});
