import { useUser } from '@/contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MoreScreen() {
  const { user, isAdmin, logout } = useUser();
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  console.log('🔍 MoreScreen rendered, showAboutModal:', showAboutModal);

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
      title: 'برنامج خواطر مبرمج',
      description: '10 حلقات من الخبرات والتجارب البرمجية',
      icon: '💭',
      route: '/programmer-thoughts'
    },
    {
      id: 3,
      title: 'مواعيد الصلاة',
      description: 'Prayer times and notifications',
      icon: '🕌',
      route: '/prayer-times'
    },
    {
      id: 4,
      title: 'Movies',
      description: 'Best movies for programming and coding',
      icon: '🎬',
      route: '/movies'
    },
    {
      id: 5,
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: '⚙️',
      route: '/settings'
    },
    {
      id: 6,
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: '❓',
      route: '/help'
    },
    {
      id: 7,
      title: 'Notification Settings',
      description: 'Manage your notification preferences',
      icon: '🔔',
      route: '/notification-settings'
    },
    {
      id: 8,
      title: 'About',
      description: 'Learn more about YONE',
      icon: 'ℹ️',
      route: '/about'
    },
  ];

  // Add Dashboard only for admin users
  const adminMenuItems = [
    {
      id: 9,
      title: 'Admin Dashboard',
      description: 'Manage users and monitor system',
      icon: '👑',
      route: '/dashboard',
      isAdmin: true
    },
    {
      id: 10,
      title: 'Content Management',
      description: 'Manage courses, articles, and all content',
      icon: '📝',
      route: '/content-management',
      isAdmin: true
    }
  ];

  // Combine menu items based on user role
  const menuItems = isAdmin 
    ? [
        baseMenuItems[0], // Profile
        baseMenuItems[1], // برنامج خواطر مبرمج
        baseMenuItems[2], // Prayer Times
        baseMenuItems[3], // Movies
        ...adminMenuItems, // Admin Dashboard
        ...baseMenuItems.slice(4) // Settings, Help, About
      ]
    : baseMenuItems;

  const handleMenuPress = (route: string) => {
    if (route === '/profile') {
      router.push('/profile');
    } else if (route === '/programmer-thoughts') {
      router.push('/programmer-thoughts');
    } else if (route === '/prayer-times') {
      router.push('/prayer-times');
    } else if (route === '/movies') {
      router.push('/movies');
    } else if (route === '/dashboard') {
      if (isAdmin) {
        router.push('/dashboard');
      } else {
        Alert.alert('Access Denied', 'You need admin privileges to access the dashboard.');
      }
    } else if (route === '/content-management') {
      if (isAdmin) {
        router.push('/content-management');
      } else {
        Alert.alert('Access Denied', 'You need admin privileges to access content management.');
      }
    } else if (route === '/about') {
      console.log('🔍 About button pressed, opening modal...');
      setShowAboutModal(true);
      console.log('✅ Modal state set to true');
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
    <SafeAreaView style={styles.safeArea}>
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
              key={`menu-${item.id}`} 
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

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={() => {
          console.log('🔍 Modal close requested');
          setShowAboutModal(false);
        }}
      >
        {console.log('🔍 Modal rendering, visible:', showAboutModal)}
        <View style={styles.modalOverlay}>
          {console.log('🔍 Modal overlay rendering')}
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>About YONE</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    console.log('🔍 Close button pressed');
                    setShowAboutModal(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Simple Content */}
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.appInfo}>
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Y</Text>
                  </View>
                  <Text style={styles.appName}>YONE</Text>
                  <Text style={styles.appTagline}>Your Learning Companion</Text>
                  <Text style={styles.versionInfo}>Version 1.0.0</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎯 What is YONE?</Text>
                  <Text style={styles.sectionText}>
                    YONE is a comprehensive learning platform designed to help you grow in your programming journey. 
                    From courses and roadmaps to expert advice and programming terms, YONE provides everything you need 
                    to become a successful developer.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>✨ Key Features</Text>
                  <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>📚</Text>
                      <Text style={styles.featureText}>Interactive Courses with Challenges</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>🗺️</Text>
                      <Text style={styles.featureText}>Learning Roadmaps & Paths</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>🎧</Text>
                      <Text style={styles.featureText}>Audio Podcasts & Content</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>💡</Text>
                      <Text style={styles.featureText}>Expert Advice & Tips</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>📖</Text>
                      <Text style={styles.featureText}>Programming Terms Dictionary</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>💭</Text>
                      <Text style={styles.featureText}>Programmer Thoughts & Insights</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>🕌</Text>
                      <Text style={styles.featureText}>Prayer Times & Notifications</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>🎬</Text>
                      <Text style={styles.featureText}>Programming Movies & Content</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚡ Built With</Text>
                  <View style={styles.techList}>
                    <View style={styles.techItem}>
                      <Text style={styles.techIcon}>⚛️</Text>
                      <Text style={styles.techText}>React Native & Expo</Text>
                    </View>
                    <View style={styles.techItem}>
                      <Text style={styles.techIcon}>🟢</Text>
                      <Text style={styles.techText}>Node.js & Express</Text>
                    </View>
                    <View style={styles.techItem}>
                      <Text style={styles.techIcon}>🍃</Text>
                      <Text style={styles.techText}>MongoDB Database</Text>
                    </View>
                    <View style={styles.techItem}>
                      <Text style={styles.techIcon}>🔐</Text>
                      <Text style={styles.techText}>JWT Authentication</Text>
                    </View>
                    <View style={styles.techItem}>
                      <Text style={styles.techIcon}>🎵</Text>
                      <Text style={styles.techText}>Audio & Media Support</Text>
                    </View>
                    <View style={styles.techItem}>
                      <Text style={styles.techIcon}>🔔</Text>
                      <Text style={styles.techText}>Push Notifications</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🚀 Our Mission</Text>
                  <Text style={styles.sectionText}>
                    To democratize programming education and make quality learning resources accessible to everyone. 
                    We believe that with the right guidance, tools, and community support, anyone can become a 
                    successful developer and contribute to the tech world.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📱 App Features</Text>
                  <Text style={styles.sectionText}>
                    • <Text style={styles.boldText}>Interactive Learning:</Text> Hands-on courses with real-world projects{'\n'}
                    • <Text style={styles.boldText}>Personalized Paths:</Text> Custom roadmaps based on your goals{'\n'}
                    • <Text style={styles.boldText}>Audio Content:</Text> Listen to programming podcasts anywhere{'\n'}
                    • <Text style={styles.boldText}>Expert Advice:</Text> Tips from experienced developers{'\n'}
                    • <Text style={styles.boldText}>Term Dictionary:</Text> Learn programming concepts with audio{'\n'}
                    • <Text style={styles.boldText}>Thoughts & Insights:</Text> Video content from programming experts{'\n'}
                    • <Text style={styles.boldText}>Prayer Integration:</Text> Stay connected with your faith{'\n'}
                    • <Text style={styles.boldText}>Offline Support:</Text> Download content for offline learning
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎓 Learning Paths</Text>
                  <Text style={styles.sectionText}>
                    YONE offers structured learning paths for different skill levels:{'\n\n'}
                    <Text style={styles.boldText}>Beginner:</Text> Start with fundamentals and basic concepts{'\n'}
                    <Text style={styles.boldText}>Intermediate:</Text> Build projects and learn best practices{'\n'}
                    <Text style={styles.boldText}>Advanced:</Text> Master complex topics and architecture{'\n'}
                    <Text style={styles.boldText}>Expert:</Text> Contribute to open source and mentor others
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🌟 Why Choose YONE?</Text>
                  <Text style={styles.sectionText}>
                    • <Text style={styles.boldText}>Comprehensive:</Text> All-in-one learning platform{'\n'}
                    • <Text style={styles.boldText}>Practical:</Text> Real-world projects and challenges{'\n'}
                    • <Text style={styles.boldText}>Flexible:</Text> Learn at your own pace{'\n'}
                    • <Text style={styles.boldText}>Community:</Text> Connect with fellow learners{'\n'}
                    • <Text style={styles.boldText}>Updated:</Text> Latest technologies and trends{'\n'}
                    • <Text style={styles.boldText}>Free:</Text> No hidden costs or subscriptions
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📞 Contact & Support</Text>
                  <Text style={styles.sectionText}>
                    Need help or have suggestions? We're here for you!{'\n\n'}
                    <Text style={styles.boldText}>Email:</Text> support@yoneapp.com{'\n'}
                    <Text style={styles.boldText}>Website:</Text> www.yoneapp.com{'\n'}
                    <Text style={styles.boldText}>Community:</Text> Join our Discord server{'\n'}
                    <Text style={styles.boldText}>Feedback:</Text> Rate us on the App Store{'\n\n'}
                    We value your feedback and are constantly improving based on your suggestions!
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🔮 Future Updates</Text>
                  <Text style={styles.sectionText}>
                    We're constantly working on new features:{'\n\n'}
                    • AI-powered learning recommendations{'\n'}
                    • Live coding sessions and workshops{'\n'}
                    • Gamification and achievement system{'\n'}
                    • Collaborative projects and team learning{'\n'}
                    • Advanced analytics and progress tracking{'\n'}
                    • Integration with popular development tools
                  </Text>
                </View>

                <View style={styles.modalFooter}>
                  <Text style={styles.footerText}>Made with ❤️ for the programming community</Text>
                  <Text style={styles.copyrightText}>© 2025 YONE Learning Platform. All rights reserved.</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    zIndex: 10000,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#E50914',
    borderBottomWidth: 2,
    borderBottomColor: '#B8070F',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 15,
    color: '#B0B0B0',
    marginBottom: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  versionInfo: {
    fontSize: 14,
    color: '#999999',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  section: {
    marginBottom: 25,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E50914',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 16,
    color: '#E8E8E8',
    lineHeight: 26,
    fontWeight: '400',
  },
  boldText: {
    fontWeight: '700',
    color: '#E50914',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E50914',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  techList: {
    gap: 10,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
  },
  techIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  techText: {
    flex: 1,
    fontSize: 13,
    color: '#CCCCCC',
  },
  modalFooter: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 14,
    color: '#E50914',
    fontWeight: '600',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});
