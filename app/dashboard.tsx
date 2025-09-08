import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, FlatList } from 'react-native';
import { useUser } from '@/contexts/UserContext';

export default function DashboardScreen() {
  const { user, isAdmin } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersToday: 0,
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You need admin privileges to access this dashboard.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Fetch users
      const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
        setStats({
          totalUsers: usersData.data?.length || 0,
          activeUsers: usersData.data?.filter((u: any) => u.lastLogin)?.length || 0,
          adminUsers: usersData.data?.filter((u: any) => u.isAdmin)?.length || 0,
          newUsersToday: usersData.data?.filter((u: any) => {
            const today = new Date();
            const userDate = new Date(u.createdAt);
            return userDate.toDateString() === today.toDateString();
          })?.length || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    Alert.alert(
      'User Action',
      `What would you like to do with this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => viewUserDetails(userId) },
        { text: 'Send Message', onPress: () => sendMessage(userId) },
      ]
    );
  };

  const viewUserDetails = (userId: string) => {
    const user = users.find((u: any) => u._id === userId);
    if (user) {
      Alert.alert(
        'User Details',
        `Name: ${user.name}\nEmail: ${user.email}\nAdmin: ${user.isAdmin ? 'Yes' : 'No'}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}\nLast Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}`
      );
    }
  };

  const sendMessage = (userId: string) => {
    Alert.alert('Send Message', 'Message feature coming soon!');
  };

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserAction(item._id, 'view')}
    >
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userBadges}>
            {item.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>👑 Admin</Text>
              </View>
            )}
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>
                Joined: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isAdmin) {
    return null; // Will redirect due to useEffect
  }

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{stats.totalUsers}</Text>
              <Text style={styles.overviewLabel}>Total Users</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{stats.activeUsers}</Text>
              <Text style={styles.overviewLabel}>Active Users</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{stats.adminUsers}</Text>
              <Text style={styles.overviewLabel}>Admin Users</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{stats.newUsersToday}</Text>
              <Text style={styles.overviewLabel}>New Today</Text>
            </View>
          </View>
        </View>

        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <Text style={styles.sectionSubtitle}>Tap on any user to view details or take actions</Text>
          
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item: any) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.usersList}
          />
        </View>

        <View style={styles.adminActions}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={fetchAdminData}>
              <Text style={styles.actionButtonText}>🔄 Refresh Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Export', 'Export feature coming soon!')}>
              <Text style={styles.actionButtonText}>📊 Export Users</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  overviewSection: {
    marginBottom: 30,
  },
  overviewCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  overviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  activitySection: {
    marginBottom: 30,
  },
  activityContainer: {
    gap: 15,
  },
  activityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  activityTime: {
    fontSize: 12,
    color: '#CCCCCC',
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  usersSection: {
    marginBottom: 30,
  },
  usersList: {
    gap: 10,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  adminBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  adminBadgeText: {
    color: '#E50914',
    fontSize: 10,
    fontWeight: '600',
  },
  dateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  adminActions: {
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
  },
});
