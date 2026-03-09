import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import { useUser } from '../contexts/UserContext';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

const { width } = Dimensions.get('window');

interface UserProfile {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
  createdAt: string;
  isAdmin?: boolean;
  adminLevel?: string;
}

interface UserStats {
  totalReels: number;
  totalLikes: number;
  totalViews: number;
  followersCount: number;
  followingCount: number;
}

interface Reel {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  likes: number;
  views: number;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const { user: currentUser, isAdmin } = useUser();
  
  // Ensure userId is a string
  const userIdString = typeof userId === 'string' ? userId : Array.isArray(userId) ? userId[0] : '';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalReels: 0,
    totalLikes: 0,
    totalViews: 0,
    followersCount: 0,
    followingCount: 0,
  });
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (userIdString) {
      fetchUserProfile();
    }
  }, [userIdString]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Check if it's own profile
      const isOwn = currentUser?.id === userIdString;
      
      // Try to get token if user is logged in
      let token = null;
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {
        // User not logged in, continue without token
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (!userIdString) {
        console.error('No userId provided');
        setLoading(false);
        return;
      }

      // If it's own profile, fetch my-reels directly to get all videos (including pending)
      if (isOwn && token) {
        const myReelsResponse = await fetch(
          `${API_BASE_URL}/api/reels/my-reels`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (myReelsResponse.ok) {
          const myReelsData = await myReelsResponse.json();
          setReels(myReelsData.data.reels || []);
          // Set basic profile info from current user
          if (currentUser) {
            setProfile({
              _id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              createdAt: currentUser.createdAt || new Date().toISOString(),
              isAdmin: currentUser.isAdmin,
              adminLevel: currentUser.adminLevel,
            });
            setStats({
              totalReels: myReelsData.data.reels?.length || 0,
              totalLikes: 0,
              totalViews: 0,
              followersCount: 0,
              followingCount: 0,
            });
          }
          setLoading(false);
          return;
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users/${userIdString}/profile`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data.user);
        setStats(data.data.stats);
        setReels(data.data.reels || []);
        setIsFollowing(data.data.isFollowing || false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user profile:', errorData.message || response.status);
        if (response.status === 404) {
          // User not found - this is handled in the UI
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === userIdString;

  const deleteReel = async (reelId: string) => {
    Alert.alert(
      'حذف الفيديو',
      'هل أنت متأكد من حذف هذا الفيديو؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(
                `${API_BASE_URL}/api/reels/${reelId}`,
                {
                  method: 'DELETE',
                }
              );

              if (response.ok) {
                Alert.alert('نجح', 'تم حذف الفيديو بنجاح');
                // Remove the reel from the list
                setReels(prevReels => prevReels.filter(reel => reel._id !== reelId));
                // Update stats
                setStats(prev => ({
                  ...prev,
                  totalReels: prev.totalReels - 1
                }));
                // Refresh profile
                fetchUserProfile();
              } else {
                const data = await response.json();
                Alert.alert('خطأ', data.message || 'فشل حذف الفيديو');
              }
            } catch (error) {
              console.error('Error deleting reel:', error);
              Alert.alert('خطأ', 'فشل حذف الفيديو. يرجى المحاولة مرة أخرى.');
            }
          },
        },
      ]
    );
  };

  const handleFollow = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }

    try {
      setFollowLoading(true);
      if (!userIdString) {
        Alert.alert('Error', 'Invalid user ID');
        return;
      }

      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/users/${userIdString}/${endpoint}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(!isFollowing);
        setStats(prev => ({
          ...prev,
          followersCount: data.data.followersCount
        }));
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to follow/unfollow user');
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      Alert.alert('Error', 'Failed to follow/unfollow user');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {profile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {profile.isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>👑</Text>
                </View>
              )}
            </View>

            <Text style={styles.userName}>{profile.name}</Text>
            {profile.email && (
              <Text style={styles.userEmail}>{profile.email}</Text>
            )}
            <Text style={styles.joinDate}>
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Follow Button */}
          {!isOwnProfile && currentUser && (
            <View style={styles.followSection}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton
                ]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.followButtonText}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsSection}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalReels}</Text>
              <Text style={styles.statLabel}>Reels</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{stats.followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{stats.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalLikes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          {/* Reels Grid */}
          <View style={styles.reelsSection}>
            <Text style={styles.sectionTitle}>
              {isOwnProfile ? 'فيديوهاتي' : `${profile.name}'s Reels`}
            </Text>
            {isOwnProfile && reels.length > 0 && (
              <Text style={styles.sectionSubtitle}>
                يمكنك الضغط مطولاً على أي فيديو لحذفه
              </Text>
            )}
            {reels.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>لا توجد فيديوهات بعد</Text>
              </View>
            ) : (
              <View style={styles.reelsGrid}>
                {reels.map((reel) => (
                  <View key={reel._id} style={styles.reelThumbnailContainer}>
                  <TouchableOpacity
                    style={styles.reelThumbnail}
                    onPress={() => setSelectedReel(reel)}
                      onLongPress={() => {
                        if (isOwnProfile) {
                          deleteReel(reel._id);
                        }
                      }}
                  >
                    <Video
                      source={{ uri: reel.videoUrl }}
                      style={styles.thumbnailVideo}
                        resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                    />
                    <View style={styles.reelOverlay}>
                        <Text style={styles.reelLikes}>❤️ {reel.likes || 0}</Text>
                        <Text style={styles.reelViews}>👁️ {reel.views || 0}</Text>
                      </View>
                      {reel.status === 'pending' && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>⏳ قيد المراجعة</Text>
                        </View>
                      )}
                      {reel.status === 'rejected' && (
                        <View style={styles.rejectedBadge}>
                          <Text style={styles.rejectedBadgeText}>✕ مرفوض</Text>
                    </View>
                      )}
                    </TouchableOpacity>
                    {isOwnProfile && (
                      <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => deleteReel(reel._id)}
                      >
                        <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Reel Modal */}
      {selectedReel && (
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelectedReel(null)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          <Video
            source={{ uri: selectedReel.videoUrl }}
            style={styles.modalVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            useNativeControls
          />
          <View style={styles.modalInfo}>
            <Text style={styles.modalTitle}>{selectedReel.title || 'No title'}</Text>
            <Text style={styles.modalDescription}>{selectedReel.description}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E50914',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E50914',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E50914',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  adminBadgeText: {
    fontSize: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 5,
  },
  joinDate: {
    color: '#999999',
    fontSize: 12,
  },
  followSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  followButton: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#666666',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333333',
    marginHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  reelsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reelThumbnailContainer: {
    position: 'relative',
    width: (width - 60) / 3,
    marginBottom: 10,
  },
  reelThumbnail: {
    width: '100%',
    height: (width - 60) / 3 * 1.5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  thumbnailVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reelLikes: {
    color: '#FFFFFF',
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  reelViews: {
    color: '#FFFFFF',
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  pendingBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  rejectedBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  rejectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteIconButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteIcon: {
    fontSize: 16,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalVideo: {
    width: '100%',
    height: '70%',
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    color: '#CCCCCC',
    fontSize: 14,
  },
});

