import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MoreScreen() {
  const menuItems = [
    {
      id: 1,
      title: 'Profile',
      description: 'View and edit your profile',
      icon: '👤',
      route: '/profile'
    },
    {
      id: 2,
      title: 'Dashboard',
      description: 'Your learning analytics and progress',
      icon: '📊',
      route: '/dashboard'
    },
    {
      id: 3,
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: '⚙️',
      route: '/settings'
    },
    {
      id: 4,
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: '❓',
      route: '/help'
    },
    {
      id: 5,
      title: 'About',
      description: 'Learn more about YONE',
      icon: 'ℹ️',
      route: '/about'
    },
  ];

  const handleMenuPress = (route: string) => {
    if (route === '/profile') {
      router.push('/profile');
    } else if (route === '/dashboard') {
      router.push('/dashboard');
    } else {
      // For other routes, you can implement them later
      console.log(`Navigate to ${route}`);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>Additional features and settings</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>YONE Learning Platform</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  menuContainer: {
    gap: 15,
  },
  menuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#CCCCCC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
  },
});
