import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useUser } from '@/contexts/UserContext';

export default function MoreScreen() {
  const { user, isAdmin, logout } = useUser();

  const baseMenuItems = [
    {
      id: 1,
      title: 'Profile',
      description: 'View and edit your profile',
      icon: '👤',
      route: '/profile'
    },
    {
      id: 2,
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: '⚙️',
      route: '/settings'
    },
    {
      id: 3,
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: '❓',
      route: '/help'
    },
    {
      id: 4,
      title: 'About',
      description: 'Learn more about YONE',
      icon: 'ℹ️',
      route: '/about'
    },
  ];

  // Add Dashboard only for admin users
  const adminMenuItems = [
    {
      id: 2,
      title: 'Admin Dashboard',
      description: 'Manage users and monitor system',
      icon: '👑',
      route: '/dashboard',
      isAdmin: true
    }
  ];

  // Combine menu items based on user role
  const menuItems = isAdmin 
    ? [
        baseMenuItems[0], // Profile
        ...adminMenuItems, // Admin Dashboard
        ...baseMenuItems.slice(1) // Settings, Help, About
      ]
    : baseMenuItems;

  const handleMenuPress = (route: string) => {
    if (route === '/profile') {
      router.push('/profile');
    } else if (route === '/dashboard') {
      if (isAdmin) {
        router.push('/dashboard');
      } else {
        Alert.alert('Access Denied', 'You need admin privileges to access the dashboard.');
      }
    } else {
      // For other routes, you can implement them later
      console.log(`Navigate to ${route}`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>Additional features and settings</Text>
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Welcome, {user.name}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>👑 Admin</Text>
                </View>
              )}
            </View>
          )}
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
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
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  adminBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  adminText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
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
  logoutButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
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
