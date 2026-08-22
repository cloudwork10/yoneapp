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
  Platform,
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
  likes?: number;
  reposts?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isRepostItem?: boolean;
  category: string;
  createdAt: string;
  rejectedReason?: string;
}

interface ReelComment {
  _id: string;
  text: string;
  createdAt: string;
  user: { _id: string | null; name: string; avatar?: string };
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
  /** portrait = fill height · landscape = fill width */
  const [videoFit, setVideoFit] = useState<Record<string, 'portrait' | 'landscape'>>({});
  const [progressById, setProgressById] = useState<
    Record<string, { position: number; duration: number }>
  >({});
  const [scrubbingId, setScrubbingId] = useState<string | null>(null);
  const [scrubRatio, setScrubRatio] = useState(0);
  const seekTrackWidth = useRef(width);
  const wasPlayingBeforeScrub = useRef(false);
  const scrubbingIdRef = useRef<string | null>(null);
  const scrubRatioRef = useRef(0);
  const videoRefs = useRef<{ [key: string]: any }>({});
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activeCommentReelId, setActiveCommentReelId] = useState<string | null>(null);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

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

  // Pause all videos when screen is not focused, and resume on return.
  // Without the resume the surface stays paused after coming back from another
  // tab, which renders as a black frame (usePoster is off, so there is no
  // fallback image).
  useFocusEffect(
    useCallback(() => {
      const current = reels[currentIndex];
      if (current && !pausedVideos.has(currentIndex)) {
        videoRefs.current[current._id]?.playAsync().catch(() => {
          // Ignore if the ref is gone or the source is still loading
        });
      }

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
    }, [reels, currentIndex, pausedVideos])
  );

  // Pause videos when modals are open
  useEffect(() => {
    if (showUploadModal || showPendingModal || showCommentsModal) {
      Object.values(videoRefs.current).forEach((videoRef) => {
        if (videoRef) {
          videoRef.pauseAsync().catch(() => {});
        }
      });
    }
  }, [showUploadModal, showPendingModal, showCommentsModal]);

  const fetchReels = async () => {
    try {
      if (reels.length === 0) setLoading(true);
      const categoryParam = selectedCategory !== 'all' && selectedCategory !== 'following' && selectedCategory !== 'my-videos'
        ? `?category=${selectedCategory}` 
        : '';
      
      let token = null;
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {}

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
      if (reels.length === 0) setLoading(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/reels?feed=following`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReels(data.data.reels || []);
      } else {
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
      if (reels.length === 0) setLoading(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/reels/my-reels`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReels(data.data.reels || []);
      } else {
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

  const requireLogin = () => {
    Alert.alert('Login required', 'Please login to interact with reels.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Login', onPress: () => router.push('/login') },
    ]);
  };

  const updateReelLocal = (reelId: string, patch: Partial<Reel>) => {
    setReels((prev) => prev.map((r) => (r._id === reelId ? { ...r, ...patch } : r)));
  };

  const toggleLike = async (reel: Reel) => {
    if (!user) return requireLogin();
    const prevLiked = !!reel.isLiked;
    const prevLikes = reel.likes || 0;
    const nextLiked = !prevLiked;
    const nextLikes = nextLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1);

    // Optimistic UI
    updateReelLocal(reel._id, { isLiked: nextLiked, likes: nextLikes });

    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/reels/${reel._id}/like`, {
        method: 'POST',
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.data && typeof data.data.isLiked === 'boolean') {
        updateReelLocal(reel._id, {
          isLiked: data.data.isLiked,
          likes: typeof data.data.likes === 'number' ? data.data.likes : nextLikes,
        });
      } else if (response.status === 401) {
        updateReelLocal(reel._id, { isLiked: prevLiked, likes: prevLikes });
        requireLogin();
      } else {
        updateReelLocal(reel._id, { isLiked: prevLiked, likes: prevLikes });
      }
    } catch (error) {
      console.error('Like error:', error);
      updateReelLocal(reel._id, { isLiked: prevLiked, likes: prevLikes });
    }
  };

  const toggleRepost = async (reel: Reel) => {
    if (!user) return requireLogin();
    const prevReposted = !!reel.isReposted;
    const prevReposts = reel.reposts || 0;
    updateReelLocal(reel._id, {
      isReposted: !prevReposted,
      reposts: prevReposted ? Math.max(0, prevReposts - 1) : prevReposts + 1,
    });
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/reels/${reel._id}/repost`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        updateReelLocal(reel._id, {
          isReposted: data.data.isReposted,
          reposts: data.data.reposts,
        });
        if (data.data.isReposted) {
          Alert.alert('Reposted', 'Added to your profile on the app');
        }
      } else {
        updateReelLocal(reel._id, { isReposted: prevReposted, reposts: prevReposts });
      }
    } catch (error) {
      console.error('Repost error:', error);
      updateReelLocal(reel._id, { isReposted: prevReposted, reposts: prevReposts });
    }
  };

  const openComments = async (reelId: string) => {
    setActiveCommentReelId(reelId);
    setShowCommentsModal(true);
    setComments([]);
    setCommentText('');
    setCommentsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reels/${reelId}/comments`);
      if (response.ok) {
        const data = await response.json();
        const list = (data.data?.comments || []).filter(
          (c: any) => c && (c._id || c.text)
        );
        setComments(list);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const postComment = async () => {
    if (!user) return requireLogin();
    if (!activeCommentReelId || !commentText.trim()) return;
    setPostingComment(true);
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/reels/${activeCommentReelId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText.trim() }),
        }
      );
      const data = await response.json().catch(() => null);
      if (response.ok && data?.data?.comment?._id) {
        setComments((prev) => [data.data.comment, ...prev.filter(Boolean)]);
        updateReelLocal(activeCommentReelId, {
          commentsCount: data.data.commentsCount,
        });
        setCommentText('');
      } else if (response.status === 401) {
        requireLogin();
      } else {
        Alert.alert('Error', data?.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Post comment error:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const detectVideoFit = (reelId: string, naturalSize?: {
    width?: number;
    height?: number;
    orientation?: string;
  }) => {
    if (!naturalSize) return;
    const nw = Number(naturalSize.width) || 0;
    const nh = Number(naturalSize.height) || 0;
    const orient = String(naturalSize.orientation || '').toLowerCase();

    let fit: 'portrait' | 'landscape' = 'portrait';
    if (orient === 'landscape' || (nw > 0 && nh > 0 && nw > nh)) {
      fit = 'landscape';
    } else if (orient === 'portrait' || (nw > 0 && nh > 0 && nh >= nw)) {
      fit = 'portrait';
    }

    setVideoFit((prev) => (prev[reelId] === fit ? prev : { ...prev, [reelId]: fit }));
  };

  const seekVideoToRatio = async (reelId: string, ratio: number) => {
    const ref = videoRefs.current[reelId];
    const duration = progressById[reelId]?.duration || 0;
    if (!ref || duration <= 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    try {
      await ref.setPositionAsync(Math.floor(clamped * duration));
    } catch (e) {
      console.warn('Seek failed', e);
    }
  };

  const onSeekGrant = async (reelId: string, index: number, locationX: number) => {
    const ratio = Math.max(0, Math.min(1, locationX / Math.max(1, seekTrackWidth.current)));
    wasPlayingBeforeScrub.current = currentIndex === index && !pausedVideos.has(index);
    scrubbingIdRef.current = reelId;
    scrubRatioRef.current = ratio;
    setScrubbingId(reelId);
    setScrubRatio(ratio);
    const ref = videoRefs.current[reelId];
    if (ref) {
      try {
        await ref.pauseAsync();
      } catch {}
    }
    await seekVideoToRatio(reelId, ratio);
  };

  const onSeekMove = async (reelId: string, locationX: number) => {
    if (scrubbingIdRef.current !== reelId) return;
    const ratio = Math.max(0, Math.min(1, locationX / Math.max(1, seekTrackWidth.current)));
    scrubRatioRef.current = ratio;
    setScrubRatio(ratio);
    await seekVideoToRatio(reelId, ratio);
  };

  const onSeekRelease = async (reelId: string, index: number) => {
    if (scrubbingIdRef.current !== reelId) return;
    await seekVideoToRatio(reelId, scrubRatioRef.current);
    scrubbingIdRef.current = null;
    setScrubbingId(null);
    if (wasPlayingBeforeScrub.current) {
      setPausedVideos((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      const ref = videoRefs.current[reelId];
      if (ref) {
        try {
          await ref.playAsync();
        } catch {}
      }
    }
  };

  const formatSeekTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
    const fit = videoFit[item._id] || 'portrait';
    const isLandscape = fit === 'landscape';

    return (
      <View style={styles.reelContainer}>
        <TouchableOpacity
          style={[
            styles.videoTouchable,
            isLandscape && styles.videoTouchableLandscape,
          ]}
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
          style={[
            styles.video,
            isLandscape ? styles.videoLandscape : styles.videoPortrait,
            styles.videoDimmed,
          ]}
          // Portrait: fill height. Landscape: fit full width (letterbox top/bottom).
          resizeMode={isLandscape ? ResizeMode.CONTAIN : ResizeMode.COVER}
          isLooping
          shouldPlay={isPlaying}
          volume={1.0}
          isMuted={Platform.OS === 'web'}
          usePoster={false}
          progressUpdateIntervalMillis={250}
          onPlaybackStatusUpdate={(status: any) => {
            if (!status?.isLoaded) return;
            if (scrubbingIdRef.current === item._id) return;
            const position = status.positionMillis || 0;
            const duration = status.durationMillis || 0;
            if (duration <= 0) return;
            setProgressById((prev) => {
              const cur = prev[item._id];
              if (
                cur &&
                Math.abs(cur.position - position) < 180 &&
                cur.duration === duration
              ) {
                return prev;
              }
              return { ...prev, [item._id]: { position, duration } };
            });
          }}
          onReadyForDisplay={(event: any) => {
            detectVideoFit(item._id, event?.naturalSize);
          }}
          onLoad={(status: any) => {
            // Fallback when onReadyForDisplay is missing (some web/native builds)
            const size =
              status?.naturalSize ||
              status?.androidImplementation?.naturalSize ||
              undefined;
            if (size) detectVideoFit(item._id, size);
            if (index === currentIndex) {
              incrementView(item._id);
            }
          }}
          onError={(error) => {
            console.error('Video error:', item.videoUrl, error);
          }}
        />

          {/* Play/Pause Icon Overlay */}
          {!isPlaying && index === currentIndex && showPlayIcon === index ? (
            <View style={styles.playPauseOverlay}>
              <View style={styles.playPauseIcon}>
                <Text style={styles.playPauseIconText}>▶</Text>
              </View>
            </View>
          ) : null}
        </TouchableOpacity>
        
        {/* Overlay Content — TikTok style */}
        <View style={styles.overlay} pointerEvents="box-none">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.overlayGradient}
            pointerEvents="none"
          />

          <View style={styles.bottomMeta} pointerEvents="box-none">
            {item.isRepostItem && (
              <Text style={styles.repostBadge}>↻ Reposted by you</Text>
            )}
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

            <Text style={styles.description} numberOfLines={3}>
              {item.title || item.description || 'No description'}
            </Text>
            <Text style={styles.viewsInline}>👁 {item.views || 0} views</Text>
          </View>

          {/* TikTok-style seek bar — drag to scrub */}
          {index === currentIndex ? (
            <View
              style={[
                styles.seekWrap,
                scrubbingId === item._id && styles.seekWrapActive,
              ]}
              onLayout={(e) => {
                seekTrackWidth.current = e.nativeEvent.layout.width;
              }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={(e) => {
                onSeekGrant(item._id, index, e.nativeEvent.locationX);
              }}
              onResponderMove={(e) => {
                onSeekMove(item._id, e.nativeEvent.locationX);
              }}
              onResponderRelease={() => {
                onSeekRelease(item._id, index);
              }}
              onResponderTerminate={() => {
                onSeekRelease(item._id, index);
              }}
            >
              {scrubbingId === item._id ? (
                <View style={styles.seekTimeRow}>
                  <Text style={styles.seekTimeText}>
                    {`${formatSeekTime(
                      scrubRatio * (progressById[item._id]?.duration || 0)
                    )} / ${formatSeekTime(progressById[item._id]?.duration || 0)}`}
                  </Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.seekTrack,
                  scrubbingId === item._id && styles.seekTrackActive,
                ]}
              >
                <View
                  style={[
                    styles.seekFill,
                    {
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          (scrubbingId === item._id
                            ? scrubRatio
                            : progressById[item._id]?.duration
                              ? (progressById[item._id].position || 0) /
                                progressById[item._id].duration
                              : 0) * 100
                        )
                      )}%`,
                    },
                    scrubbingId === item._id && styles.seekFillActive,
                  ]}
                />
                {scrubbingId === item._id ? <View style={styles.seekThumb} /> : null}
              </View>
            </View>
          ) : null}

          {/* Right side actions */}
          <View style={styles.sideActions}>
            <TouchableOpacity
              style={styles.sideAction}
              onPress={(e) => {
                e?.stopPropagation?.();
                toggleLike(item);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[styles.likeBubble, item.isLiked && styles.likeBubbleActive]}>
                <Text style={[styles.sideActionIcon, item.isLiked && { color: '#E50914' }]}>
                  {item.isLiked ? '♥' : '♡'}
                </Text>
              </View>
              <Text style={styles.sideActionText}>{item.likes || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideAction} onPress={() => openComments(item._id)}>
              <Text style={styles.sideActionIcon}>💬</Text>
              <Text style={styles.sideActionText}>{item.commentsCount || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideAction} onPress={() => toggleRepost(item)}>
              <Text style={[styles.sideActionIcon, item.isReposted && styles.repostedIcon]}>
                {item.isReposted ? '🔁' : '↪️'}
              </Text>
              <Text style={styles.sideActionText}>{item.reposts || 0}</Text>
            </TouchableOpacity>

            {isOwner && (
              <TouchableOpacity style={styles.sideAction} onPress={() => deleteReel(item._id)}>
                <Text style={styles.sideActionIcon}>🗑️</Text>
                <Text style={styles.sideActionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

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

      {/* Reels Feed */}
      {reels.length > 0 ? (
        <FlatList
          data={reels}
          renderItem={renderReel}
          keyExtractor={(item) => item._id}
          pagingEnabled
          scrollEnabled={scrubbingId === null}
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
      ) : loading ? (
        <View style={styles.reelsSoftLoading}>
          <ActivityIndicator size="small" color="#E50914" />
        </View>
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

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.commentsOverlay}>
          <TouchableOpacity
            style={styles.commentsBackdrop}
            activeOpacity={1}
            onPress={() => setShowCommentsModal(false)}
          />
          <View style={styles.commentsSheet}>
            <View style={styles.commentsHandle} />
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {commentsLoading ? (
              <ActivityIndicator color="#E50914" style={{ marginTop: 30 }} />
            ) : (
              <FlatList
                data={comments.filter(Boolean)}
                keyExtractor={(item, index) => item?._id?.toString?.() || `comment-${index}`}
                style={styles.commentsList}
                contentContainerStyle={{ paddingBottom: 16 }}
                ListEmptyComponent={
                  <Text style={styles.commentsEmpty}>No comments yet. Be the first!</Text>
                }
                renderItem={({ item }) => {
                  if (!item) return null;
                  return (
                  <View style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {(item.user?.name || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentBody}>
                      <Text style={styles.commentAuthor}>{item.user?.name || 'User'}</Text>
                      <Text style={styles.commentText}>{item.text}</Text>
                    </View>
                  </View>
                  );
                }}
              />
            )}

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder={user ? 'Add a comment...' : 'Login to comment'}
                placeholderTextColor="#777"
                value={commentText}
                onChangeText={setCommentText}
                editable={!!user && !postingComment}
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.commentSendBtn, (!commentText.trim() || postingComment) && { opacity: 0.5 }]}
                onPress={postComment}
                disabled={!commentText.trim() || postingComment}
              >
                <Text style={styles.commentSendText}>{postingComment ? '...' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  reelsSoftLoading: {
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
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  videoTouchableLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    backgroundColor: '#000000',
  },
  videoPortrait: {
    width: '100%',
    height: '100%',
  },
  videoLandscape: {
    width: '100%',
    height: '100%',
  },
  /** Darken the video pixels only (not a screen-wide overlay) */
  videoDimmed: {
    opacity: 0.78,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  overlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
  },
  bottomMeta: {
    position: 'absolute',
    left: 14,
    right: 78,
    bottom: 28,
  },
  seekWrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 6,
    zIndex: 80,
    paddingTop: 14,
    paddingBottom: 4,
    justifyContent: 'flex-end',
  },
  seekWrapActive: {
    bottom: 10,
    paddingTop: 8,
  },
  seekTimeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  seekTimeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  seekTimeSep: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  seekTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  seekTrackActive: {
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  seekFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 2,
  },
  seekFillActive: {
    backgroundColor: '#E50914',
    borderRadius: 4,
  },
  seekThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E50914',
  },
  repostBadge: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 15,
    fontWeight: '700',
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 6,
  },
  viewsInline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  sideActions: {
    position: 'absolute',
    right: 10,
    bottom: 90,
    alignItems: 'center',
    gap: 18,
  },
  sideAction: {
    alignItems: 'center',
    minWidth: 48,
  },
  sideActionIcon: {
    fontSize: 26,
    marginBottom: 2,
    color: '#FFFFFF',
  },
  likeBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 2,
  },
  likeBubbleActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.35)',
  },
  likedIcon: {
    color: '#E50914',
  },
  repostedIcon: {
    opacity: 1,
  },
  sideActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  commentsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  commentsBackdrop: {
    flex: 1,
  },
  commentsSheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  commentsHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
    marginTop: 8,
    marginBottom: 4,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  commentsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  commentsList: {
    paddingHorizontal: 16,
    minHeight: 160,
  },
  commentsEmpty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    color: '#ddd',
    fontSize: 13,
    lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  commentSendBtn: {
    backgroundColor: '#E50914',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  commentSendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

