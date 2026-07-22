import { useUser } from '@/contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import resolveMediaUrl from '../utils/mediaUrl';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

export default function ProfileScreen() {
  const { user, logout, isAdmin, isLoading, updateUser } = useUser();
  const [userStats, setUserStats] = useState({
    coursesCompleted: 0,
    totalHours: 0,
    currentStreak: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setUserStats({
      coursesCompleted: 12,
      totalHours: 45,
      currentStreak: 7,
    });
  }, []);

  useEffect(() => {
    const syncProfile = async () => {
      if (!user) return;
      try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/profile`);
        if (!response.ok) return;
        const data = await response.json();
        const remote = data?.data?.user;
        if (!remote) return;
        updateUser({
          name: remote.name || user.name,
          email: remote.email || user.email,
          avatar: remote.avatar || '',
          isAdmin: remote.isAdmin ?? user.isAdmin,
          adminLevel: remote.adminLevel || user.adminLevel,
          createdAt: remote.createdAt || user.createdAt,
        });
      } catch {
        // keep local session if sync fails
      }
    };
    syncProfile();
  }, [user?.id]);

  const pickAndUploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        // User cancelled, or picker closed due to missing permission
        if (Platform.OS !== 'web') {
          const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
          const blocked =
            !permission.granted &&
            permission.status !== 'granted' &&
            (permission as { accessPrivileges?: string }).accessPrivileges !== 'limited' &&
            permission.canAskAgain === false;

          if (blocked) {
            Alert.alert(
              'Permission needed',
              'Photo access is blocked. Enable it in Settings to set your profile picture.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
          }
        }
        return;
      }

      setUploadingAvatar(true);
      const asset = result.assets[0];
      const imageUri = asset.uri;
      const mimeType = asset.mimeType || 'image/jpeg';
      const extension = mimeType.includes('png')
        ? 'png'
        : mimeType.includes('webp')
          ? 'webp'
          : 'jpg';

      const uploadBody = new FormData();
      uploadBody.append('avatar', {
        uri: imageUri,
        type: mimeType,
        name: `avatar.${extension}`,
      } as any);

      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/avatar`, {
        method: 'POST',
        body: uploadBody,
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = { message: `Upload failed (${response.status})` };
      }

      if (!response.ok) {
        Alert.alert('Error', data?.message || 'Failed to upload profile photo');
        return;
      }

      const avatarUrl = data?.data?.avatar || data?.data?.user?.avatar || '';
      updateUser({ avatar: avatarUrl });
      Alert.alert('Done', 'Profile photo updated successfully');
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert(
        'Permission needed',
        'Please allow photo library access to set your profile picture.',
        Platform.OS === 'web'
          ? [{ text: 'OK' }]
          : [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const openChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswords(false);
    setShowPasswordModal(true);
  };

  const confirmChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing fields', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Same password', 'New password must be different from current password.');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        Alert.alert('Change failed', data.message || 'Could not change password.');
        return;
      }

      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Change failed', 'Network error. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const openDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account, reels, and related data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setDeletePassword('');
            setShowDeleteModal(true);
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      Alert.alert('Password required', 'Enter your password to confirm deletion.');
      return;
    }

    try {
      setDeleting(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/auth/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        Alert.alert('Delete failed', data.message || 'Could not delete your account.');
        return;
      }

      setShowDeleteModal(false);
      setDeletePassword('');
      await logout();
      Alert.alert('Account deleted', 'Your account has been permanently deleted.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Delete failed', 'Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Show loading while user data is being loaded
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Redirect to login if no user is found
  if (!user) {
    Alert.alert('Session Expired', 'Please login again.', [
      { text: 'OK', onPress: () => router.replace('/login') }
    ]);
    return null;
  }

  const stats = [
    { label: 'Courses Completed', value: userStats.coursesCompleted },
    { label: 'Total Hours', value: `${userStats.totalHours}h` },
    { label: 'Current Streak', value: `${userStats.currentStreak} days` },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
          <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickAndUploadAvatar}
            disabled={uploadingAvatar}
            activeOpacity={0.85}
          >
            {user.avatar ? (
              <Image
                source={{ uri: resolveMediaUrl(user.avatar) }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.avatarEditText}>📷</Text>
              )}
            </View>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>👑</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap photo to change</Text>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.joinDate}>Member since {formatJoinDate(user.createdAt || '')}</Text>
          {isAdmin && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Admin User</Text>
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={openChangePassword}>
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/notification-settings')}
          >
            <Text style={styles.actionButtonText}>Notification Settings</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={openDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => !changingPassword && setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Change password</Text>
              <Text style={styles.modalSubtitle}>
                Enter your current password and choose a new one (min 6 characters).
              </Text>

              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor="#777"
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                editable={!changingPassword}
              />
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor="#777"
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                editable={!changingPassword}
              />
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#777"
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                editable={!changingPassword}
              />

              <TouchableOpacity
                style={styles.showPasswordToggle}
                onPress={() => setShowPasswords((v) => !v)}
                disabled={changingPassword}
              >
                <Text style={styles.showPasswordToggleText}>
                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotFromModal}
                disabled={changingPassword}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  Alert.alert(
                    'Forgot current password?',
                    'You will be signed out so you can reset your password from the login screen.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Continue',
                        onPress: async () => {
                          await logout();
                          router.replace('/forgot-password');
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.forgotFromModalText}>Forgot current password?</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  disabled={changingPassword}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirm, changingPassword && styles.modalConfirmDisabled]}
                  disabled={changingPassword}
                  onPress={confirmChangePassword}
                >
                  {changingPassword ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => !deleting && setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Confirm deletion</Text>
              <Text style={styles.modalSubtitle}>
                Enter your password to permanently delete this account.
              </Text>
              <TextInput
                style={styles.modalInput}
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry
                autoCapitalize="none"
                editable={!deleting}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  disabled={deleting}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirm, deleting && styles.modalConfirmDisabled]}
                  disabled={deleting}
                  onPress={confirmDeleteAccount}
                >
                  {deleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#222222',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  avatarEditText: {
    fontSize: 14,
  },
  avatarHint: {
    color: '#888888',
    fontSize: 13,
    marginBottom: 12,
  },
  adminBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  adminBadgeText: {
    fontSize: 16,
  },
  roleBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    marginTop: 10,
  },
  roleBadgeText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: '#999999',
  },
  statsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  logoutText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 12,
    marginBottom: 30,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 80, 0.45)',
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#AAAAAA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 12,
  },
  showPasswordToggle: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  showPasswordToggleText: {
    color: '#E50914',
    fontSize: 13,
    fontWeight: '600',
  },
  forgotFromModal: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  forgotFromModalText: {
    color: '#AAAAAA',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalCancelText: {
    color: '#DDDDDD',
    fontWeight: '600',
  },
  modalConfirm: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#E50914',
    minHeight: 46,
  },
  modalConfirmDisabled: {
    opacity: 0.7,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
});
