import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../../config/api';
import { useUser } from '../../contexts/UserContext';
import { makeAuthenticatedRequest } from '../../utils/tokenRefresh';

const { width, height } = Dimensions.get('window');

interface Reel {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  uploadedBy: {
    _id: string;
    name: string;
    avatar?: string;
  } | string;
  uploadedByName?: string;
  uploadedByAvatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  category: string;
  createdAt: string;
  rejectedReason?: string;
}

export default function ReelsScreen() {
  const { user, isAdmin } = useUser();
  const [reels, setReels] = useState<Reel[]>([]);
  const [pendingReels, setPendingReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pausedVideos, setPausedVideos] = useState<Set<number>>(new Set());
  const [showPlayIcon, setShowPlayIcon] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: string]: any }>({});

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('other');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'programming', label: 'Programming' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    if (selectedCategory === 'following') {
      fetchFollowingReels();
    } else if (selectedCategory === 'my-videos') {
      fetchMyReels();
    } else {
      fetchReels();
    }
    if (isAdmin) {
      fetchPendingReels();
    }
  }, [selectedCategory, isAdmin]);

  // Pause all videos when screen is not focused
  useFocusEffect(
    useCallback(() => {
      // Screen is focused - resume current video if needed
      return () => {
        // Screen is unfocused - pause all videos
        Object.values(videoRefs.current).forEach((videoRef) => {
          if (videoRef) {
            videoRef.pauseAsync().catch(() => {
              // Ignore errors if video is already paused
            });
          }
        });
      };
    }, [])
  );

  // Pause videos when modals are open
  useEffect(() => {
    if (showUploadModal || showPendingModal) {
      // Pause all videos when modal opens
      Object.values(videoRefs.current).forEach((videoRef) => {
        if (videoRef) {
          videoRef.pauseAsync().catch(() => {
            // Ignore errors if video is already paused
          });
        }
      });
    }
  }, [showUploadModal, showPendingModal]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== 'all' && selectedCategory !== 'following' && selectedCategory !== 'my-videos'
        ? `?category=${selectedCategory}` 
        : '';
      
      // Try to get token if user is logged in
      let token = null;
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {
        // User not logged in
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/reels${categoryParam}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setReels(data.data.reels || []);
      } else {
        console.error('Failed to fetch reels:', response.status);
        setReels([]);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingReels = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/reels?feed=following`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReels(data.data.reels || []);
      } else {
        console.error('Failed to fetch following reels:', response.status);
        setReels([]);
      }
    } catch (error) {
      console.error('Error fetching following reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReels = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/reels/my-reels`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReels(data.data.reels || []);
      } else {
        console.error('Failed to fetch my reels:', response.status);
        setReels([]);
      }
    } catch (error) {
      console.error('Error fetching my reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReels = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/reels/pending`);
      if (response.ok) {
        const data = await response.json();
        setPendingReels(data.data.reels || []);
      }
    } catch (error) {
      console.error('Error fetching pending reels:', error);
    }
  };

  const pickVideo = async () => {
    try {
      // Use DocumentPicker - no permissions needed!
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const video = result.assets[0];
        if (video.uri) {
          setSelectedVideo(video.uri);
          console.log('Video selected:', video.name, video.uri);
        } else {
          Alert.alert('Error', 'Failed to get video URI');
        }
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  };

  const uploadReel = async () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login to upload reels');
      return;
    }

    try {
      setUploading(true);

      // Get file extension from URI
      const uriParts = selectedVideo.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `reel-${Date.now()}.${fileType}`;

      // Create form data
      const formData = new FormData();
      
      // Append video file - React Native FormData format
      formData.append('video', {
        uri: selectedVideo,
        type: `video/${fileType}`,
        name: fileName,
      } as any);
      
      // Append other fields
      if (uploadTitle.trim()) {
        formData.append('title', uploadTitle.trim());
      }
      if (uploadDescription.trim()) {
        formData.append('description', uploadDescription.trim());
      }
      formData.append('category', uploadCategory);

      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please login again');
        setUploading(false);
        return;
      }

      console.log('Uploading reel...', {
        videoUri: selectedVideo.substring(0, 50) + '...',
        title: uploadTitle,
        category: uploadCategory,
      });

      // Don't set Content-Type for FormData - let fetch set it automatically with boundary
      const response = await fetch(`${API_BASE_URL}/api/reels/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - React Native will set it with boundary
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok) {
        Alert.alert('Success', data.message || 'Reel uploaded successfully!');
        setShowUploadModal(false);
        setSelectedVideo(null);
        setUploadTitle('');
        setUploadDescription('');
        setUploadCategory('other');
        fetchReels();
        if (isAdmin) {
          fetchPendingReels();
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to upload reel. Please try again.');
      }
    } catch (error: any) {
      console.error('Error uploading reel:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to upload reel. Please check your connection and try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const approveReel = async (reelId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/reels/${reelId}/approve`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Reel approved successfully');
        fetchPendingReels();
        fetchReels();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to approve reel');
      }
    } catch (error) {
      console.error('Error approving reel:', error);
      Alert.alert('Error', 'Failed to approve reel');
    }
  };

  const rejectReel = async (reelId: string) => {
    Alert.prompt(
      'Reject Reel',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (reason) => {
            try {
              const response = await makeAuthenticatedRequest(
                `${API_BASE_URL}/api/reels/${reelId}/reject`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ reason: reason || 'Rejected by admin' }),
                }
              );

              if (response.ok) {
                Alert.alert('Success', 'Reel rejected successfully');
                fetchPendingReels();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.message || 'Failed to reject reel');
              }
            } catch (error) {
              console.error('Error rejecting reel:', error);
              Alert.alert('Error', 'Failed to reject reel');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const incrementView = async (reelId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reels/${reelId}/view`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        // Update views count dynamically
        setReels(prevReels => 
          prevReels.map(reel => 
            reel._id === reelId 
              ? { ...reel, views: data.data.views }
              : reel
          )
        );
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

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
                // Refresh the list based on current category
                if (selectedCategory === 'my-videos') {
                  fetchMyReels();
                } else if (selectedCategory === 'following') {
                  fetchFollowingReels();
                } else {
                  fetchReels();
                }
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

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        setShowPlayIcon(null); // Hide play icon when switching videos
        // Increment view count
        if (reels[newIndex]) {
          incrementView(reels[newIndex]._id);
        }
      }
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const togglePlayPause = async (index: number) => {
    if (pausedVideos.has(index)) {
      // Resume video
      setPausedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      setShowPlayIcon(null);
      const reel = reels[index];
      if (reel && videoRefs.current[reel._id]) {
        await videoRefs.current[reel._id].playAsync();
      }
    } else {
      // Pause video
      setPausedVideos(prev => new Set(prev).add(index));
      setShowPlayIcon(index);
      const reel = reels[index];
      if (reel && videoRefs.current[reel._id]) {
        await videoRefs.current[reel._id].pauseAsync();
      }
      // Hide play icon after 2 seconds
      setTimeout(() => {
        setShowPlayIcon(prev => prev === index ? null : prev);
      }, 2000);
    }
  };

  const renderReel = ({ item, index }: { item: Reel; index: number }) => {
    const isPlaying = currentIndex === index && !pausedVideos.has(index);
    const uploadedByName = typeof item.uploadedBy === 'object' 
      ? item.uploadedBy.name 
      : item.uploadedByName || 'Unknown';
    const uploadedByAvatar = typeof item.uploadedBy === 'object' 
      ? item.uploadedBy.avatar 
      : item.uploadedByAvatar;
    
    // Check if current user is the owner of this reel
    const uploadedById = typeof item.uploadedBy === 'object' 
      ? item.uploadedBy._id 
      : (typeof item.uploadedBy === 'string' ? item.uploadedBy : null);
    const isOwner = user && uploadedById && user.id === uploadedById.toString();

    return (
      <View style={styles.reelContainer}>
        <TouchableOpacity
          style={styles.videoTouchable}
          activeOpacity={1}
          onPress={() => togglePlayPause(index)}
        >
        <Video
          ref={(ref) => {
            if (ref) {
              videoRefs.current[item._id] = ref;
            }
          }}
          source={{ uri: item.videoUrl }}
          style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay={isPlaying}
          volume={1.0}
          isMuted={false}
          onLoad={() => {
            if (index === currentIndex) {
              incrementView(item._id);
            }
          }}
          onError={(error) => {
            console.error('Video error:', error);
          }}
        />
          
          {/* Play/Pause Icon Overlay */}
          {!isPlaying && index === currentIndex && showPlayIcon === index && (
            <View style={styles.playPauseOverlay}>
              <View style={styles.playPauseIcon}>
                <Text style={styles.playPauseIconText}>▶</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Overlay Content */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <View style={styles.reelContent}>
            {/* User Info */}
            <TouchableOpacity 
              style={styles.userInfo}
              onPress={() => {
                const userId = typeof item.uploadedBy === 'object' 
                  ? item.uploadedBy._id 
                  : (typeof item.uploadedBy === 'string' ? item.uploadedBy : null);
                
                if (userId) {
                  router.push({
                    pathname: '/user-profile',
                    params: { userId: userId.toString() }
                  });
                }
              }}
            >
              {uploadedByAvatar ? (
                <Image source={{ uri: uploadedByAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{uploadedByName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <Text style={styles.userName}>{uploadedByName}</Text>
            </TouchableOpacity>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description} numberOfLines={3}>
                {item.title || item.description || 'No description'}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <View style={styles.actionButton}>
                <Text style={styles.actionIcon}>👁️</Text>
                <Text style={styles.actionText}>{item.views || 0}</Text>
              </View>
              {isOwner && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteReel(item._id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ حذف</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading reels...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.pendingButton}
              onPress={() => setShowPendingModal(true)}
            >
              <Text style={styles.pendingButtonText}>
                ⏳ Pending ({pendingReels.length})
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Text style={styles.uploadButtonText}>+ Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed Toggle */}
      {user && (
        <View style={styles.feedToggleContainer}>
          <TouchableOpacity
            style={[
              styles.feedToggleButton,
              selectedCategory === 'all' && styles.feedToggleButtonActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.feedToggleText,
                selectedCategory === 'all' && styles.feedToggleTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.feedToggleButton,
              selectedCategory === 'following' && styles.feedToggleButtonActive,
            ]}
            onPress={() => setSelectedCategory('following')}
          >
            <Text
              style={[
                styles.feedToggleText,
                selectedCategory === 'following' && styles.feedToggleTextActive,
              ]}
            >
              Following
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.feedToggleButton,
              selectedCategory === 'my-videos' && styles.feedToggleButtonActive,
            ]}
            onPress={() => setSelectedCategory('my-videos')}
          >
            <Text
              style={[
                styles.feedToggleText,
                selectedCategory === 'my-videos' && styles.feedToggleTextActive,
              ]}
            >
              My Videos
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Button when viewing My Videos */}
      {user && selectedCategory === 'my-videos' && (
        <View style={styles.profileButtonContainer}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              router.push({
                pathname: '/user-profile',
                params: { userId: user.id }
              });
            }}
          >
            <Text style={styles.profileButtonText}>👤 عرض البروفايل الكامل</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryButton,
              selectedCategory === category.value && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.value)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.value && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reels Feed */}
      {reels.length > 0 ? (
        <FlatList
          data={reels}
          renderItem={renderReel}
          keyExtractor={(item) => item._id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          snapToInterval={height - 280}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(data, index) => ({
            length: height - 280,
            offset: (height - 280) * index,
            index,
          })}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reels available</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Text style={styles.uploadButtonText}>Upload First Reel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Reel</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableOpacity
              style={styles.videoPicker}
              onPress={pickVideo}
              disabled={uploading}
            >
              {selectedVideo ? (
                <View style={styles.videoSelectedContainer}>
                  <Text style={styles.videoPickerText}>✓ Video Selected</Text>
                  <Text style={styles.videoPickerSubtext}>
                    {selectedVideo.split('/').pop()?.substring(0, 30) || 'Video file'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.videoPickerText}>📹 Select Video</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Title (optional)"
              placeholderTextColor="#666"
              value={uploadTitle}
              onChangeText={setUploadTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#666"
              value={uploadDescription}
              onChangeText={setUploadDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.filter(c => c.value !== 'all').map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryChip,
                    uploadCategory === category.value && styles.categoryChipActive,
                  ]}
                  onPress={() => setUploadCategory(category.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      uploadCategory === category.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
              onPress={uploadReel}
              disabled={uploading || !selectedVideo}
            >
              {uploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Upload Reel</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Pending Reels Modal (Admin Only) */}
      {isAdmin && (
        <Modal
          visible={showPendingModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPendingModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pending Reels ({pendingReels.length})</Text>
              <TouchableOpacity onPress={() => setShowPendingModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {pendingReels.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No pending reels</Text>
                </View>
              ) : (
                pendingReels.map((reel) => (
                  <View key={reel._id} style={styles.pendingReelCard}>
                    <Video
                      source={{ uri: reel.videoUrl }}
                      style={styles.pendingVideo}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      useNativeControls
                    />
                    <View style={styles.pendingReelInfo}>
                      <Text style={styles.pendingReelTitle} numberOfLines={2}>
                        {reel.title || 'No title'}
                      </Text>
                      <Text style={styles.pendingReelUser}>
                        By: {typeof reel.uploadedBy === 'object' 
                          ? reel.uploadedBy.name 
                          : reel.uploadedByName || 'Unknown'}
                      </Text>
                      <View style={styles.pendingReelActions}>
                        <TouchableOpacity
                          style={[styles.approveButton, styles.actionButtonSmall]}
                          onPress={() => approveReel(reel._id)}
                        >
                          <Text style={styles.approveButtonText}>✓ Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.rejectButton, styles.actionButtonSmall]}
                          onPress={() => rejectReel(reel._id)}
                        >
                          <Text style={styles.rejectButtonText}>✕ Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  pendingButton: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pendingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    maxHeight: 50,
    backgroundColor: '#000000',
  },
  feedToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  feedToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  feedToggleButtonActive: {
    backgroundColor: '#E50914',
  },
  feedToggleText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  feedToggleTextActive: {
    color: '#FFFFFF',
  },
  profileButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileButton: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#E50914',
  },
  categoryButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  reelContainer: {
    width: width,
    height: height - 280,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoTouchable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  playPauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playPauseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  playPauseIconText: {
    color: '#FFFFFF',
    fontSize: 32,
    marginLeft: 4, // Slight offset to center the play icon visually
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    justifyContent: 'flex-end',
    zIndex: 50,
    paddingBottom: 20,
  },
  reelContent: {
    padding: 20,
    zIndex: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 15,
    marginBottom: 10,
    zIndex: 100,
    elevation: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    minWidth: 60,
    minHeight: 60,
    padding: 5,
    elevation: 10,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#CCCCCC',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  videoPicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E50914',
    borderStyle: 'dashed',
  },
  videoPickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  videoSelectedContainer: {
    alignItems: 'center',
  },
  videoPickerSubtext: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
    marginBottom: 15,
  },
  categoryChipActive: {
    backgroundColor: '#E50914',
  },
  categoryChipText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#E50914',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingReelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  pendingVideo: {
    width: '100%',
    height: 200,
    backgroundColor: '#000000',
  },
  pendingReelInfo: {
    padding: 15,
  },
  pendingReelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  pendingReelUser: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 15,
  },
  pendingReelActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonSmall: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

