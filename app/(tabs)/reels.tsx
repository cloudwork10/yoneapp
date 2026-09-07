import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Dimensions,
  Easing,
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
import resolveMediaUrl from '../../utils/mediaUrl';
import {
  REEL_LINK_TYPES,
  fetchReelLinkOptions,
  getReelLinkMeta,
  getReelLinkRoute,
  hydrateReels,
  saveReelLinkOverride,
} from '../../utils/reelLinks';
import { makeAuthenticatedRequest } from '../../utils/tokenRefresh';

const { width, height } = Dimensions.get('window');

function ReelPromoCta({
  linkType,
  remainingMs,
  onPress,
}: {
  linkType?: Reel['linkType'];
  remainingMs: number;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const isEnding = remainingMs <= 2000 && remainingMs >= 0;
  const label = getReelLinkMeta(linkType).cta || 'See more';

  useEffect(() => {
    if (!isEnding) {
      pulse.setValue(1);
      spin.setValue(0);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ])
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    pulseLoop.start();
    spinLoop.start();
    return () => {
      pulseLoop.stop();
      spinLoop.stop();
    };
  }, [isEnding, pulse, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.promoWrap, { transform: [{ scale: pulse }] }]}>
      {isEnding ? (
        <Animated.View style={[styles.promoLoaderRing, { transform: [{ rotate }] }]} />
      ) : null}
      <TouchableOpacity
        style={[styles.promoLink, isEnding && styles.promoLinkEnding]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {isEnding ? (
          <ActivityIndicator color="#FFFFFF" size="small" style={styles.promoLoader} />
        ) : (
          <Text style={styles.promoPlay}>▶</Text>
        )}
        <Text style={styles.promoLinkText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
  linkType?: 'none' | 'course' | 'thought' | 'podcast' | 'roadmap' | 'article' | 'news';
  linkId?: string;
  linkLabel?: string;
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
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const isScreenFocusedRef = useRef(true);
  const iosReelHeight = height - 280;
  const [androidFeedHeight, setAndroidFeedHeight] = useState(0);
  const reelHeight =
    Platform.OS === 'android' && androidFeedHeight > 0
      ? androidFeedHeight
      : iosReelHeight;
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
  const [uploadProgress, setUploadProgress] = useState('');
  const [linkType, setLinkType] = useState<(typeof REEL_LINK_TYPES)[number]['value']>('none');
  const [linkId, setLinkId] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkOptions, setLinkOptions] = useState<Record<string, { id: string; title: string }[]>>({});

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

  useEffect(() => {
    if (!showUploadModal) return;

    fetchReelLinkOptions().then(setLinkOptions);
  }, [showUploadModal]);

  const pauseAllVideos = useCallback(() => {
    Object.values(videoRefs.current).forEach((videoRef) => {
      if (videoRef) {
        videoRef.pauseAsync().catch(() => {});
      }
    });
  }, []);

  const resumeCurrentVideo = useCallback(() => {
    const current = reels[currentIndex];
    if (
      current &&
      isScreenFocusedRef.current &&
      !pausedVideos.has(currentIndex) &&
      !showUploadModal &&
      !showPendingModal &&
      !showCommentsModal
    ) {
      videoRefs.current[current._id]?.playAsync().catch(() => {});
    }
  }, [reels, currentIndex, pausedVideos, showUploadModal, showPendingModal, showCommentsModal]);

  // Pause all videos when screen is not focused, and resume on return.
  // shouldPlay is also tied to isScreenFocused so a re-render cannot restart audio.
  useFocusEffect(
    useCallback(() => {
      isScreenFocusedRef.current = true;
      setIsScreenFocused(true);
      resumeCurrentVideo();

      return () => {
        isScreenFocusedRef.current = false;
        setIsScreenFocused(false);
        pauseAllVideos();
      };
    }, [resumeCurrentVideo, pauseAllVideos])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        pauseAllVideos();
        return;
      }
      resumeCurrentVideo();
    });
    return () => sub.remove();
  }, [pauseAllVideos, resumeCurrentVideo]);

  useEffect(() => {
    if (showUploadModal || showPendingModal || showCommentsModal) {
      pauseAllVideos();
    }
  }, [showUploadModal, showPendingModal, showCommentsModal, pauseAllVideos]);

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
        setReels(await hydrateReels(data.data.reels || []));
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
        setReels(await hydrateReels(data.data.reels || []));
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
        setReels(await hydrateReels(data.data.reels || []));
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
        setPendingReels(await hydrateReels(data.data.reels || []));
      }
    } catch (error) {
      console.error('Error fetching pending reels:', error);
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('خطأ', 'فشل اختيار الفيديو. حاول تاني.');
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
      setUploadProgress('جاري الرفع…');

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login again');
        setUploading(false);
        setUploadProgress('');
        return;
      }

      const selectedLink =
        linkId && linkType !== 'none'
          ? { linkType, linkId, linkLabel: linkLabel.trim() }
          : null;
      const meta: Record<string, string> = {
        category: uploadCategory,
        linkType: selectedLink ? linkType : 'none',
        description: uploadDescription.trim(),
      };
      if (uploadTitle.trim()) meta.title = uploadTitle.trim();
      if (selectedLink) {
        meta.linkId = selectedLink.linkId;
        meta.linkLabel = selectedLink.linkLabel;
      }

      let videoUri = selectedVideo;
      if (videoUri.startsWith('ph://') || videoUri.startsWith('assets-library://')) {
        const localCopy = `${FileSystem.cacheDirectory}reel-src-${Date.now()}.mov`;
        await FileSystem.copyAsync({ from: videoUri, to: localCopy });
        videoUri = localCopy;
      }

      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      const fileSize = Number((fileInfo as any).size || 0);
      const chunkSize = 1.5 * 1024 * 1024;
      const shouldTryChunks = fileSize > 8 * 1024 * 1024;

      const uploadSingle = async () => {
        const formData = new FormData();
        formData.append('video', {
          uri: videoUri,
          type: 'video/mp4',
          name: `reel-${Date.now()}.mp4`,
        } as any);
        Object.entries(meta).forEach(([key, value]) => formData.append(key, value));
        return fetch(`${API_BASE_URL}/api/reels/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      };

      let response: Response;

      if (shouldTryChunks) {
        const totalChunks = Math.ceil(fileSize / chunkSize);
        const initRes = await fetch(`${API_BASE_URL}/api/reels/upload/init`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ totalChunks }),
        });
        const initData = await initRes.json().catch(() => ({}));

        if (initRes.ok && initData?.data?.uploadId) {
          const uploadId = initData.data.uploadId;
          for (let index = 0; index < totalChunks; index += 1) {
            setUploadProgress(`رفع ${index + 1} من ${totalChunks}`);
            const start = index * chunkSize;
            const length = Math.min(chunkSize, fileSize - start);
            const base64 = await FileSystem.readAsStringAsync(videoUri, {
              encoding: FileSystem.EncodingType.Base64,
              position: start,
              length,
            });
            const chunkPath = `${FileSystem.cacheDirectory}reel-chunk-${index}.bin`;
            await FileSystem.writeAsStringAsync(chunkPath, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const chunkForm = new FormData();
            chunkForm.append('uploadId', uploadId);
            chunkForm.append('index', String(index));
            chunkForm.append('chunk', {
              uri: chunkPath,
              type: 'application/octet-stream',
              name: `chunk-${index}.bin`,
            } as any);
            const chunkRes = await fetch(`${API_BASE_URL}/api/reels/upload/chunk`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: chunkForm,
            });
            await FileSystem.deleteAsync(chunkPath, { idempotent: true });
            if (!chunkRes.ok) {
              const chunkData = await chunkRes.json().catch(() => ({}));
              throw new Error(chunkData.message || 'فشل رفع جزء من الفيديو');
            }
          }

          setUploadProgress('جاري حفظ الريل…');
          response = await fetch(`${API_BASE_URL}/api/reels/upload/complete`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uploadId, ...meta }),
          });
        } else {
          setUploadProgress('جاري الرفع…');
          response = await uploadSingle();
        }
      } else {
        response = await uploadSingle();
      }

      const data = await response.json();
      if (response.ok) {
        const uploadedReel = data.data?.reel;
        if (uploadedReel?._id && selectedLink) {
          await saveReelLinkOverride(uploadedReel._id, selectedLink);
        }
        Alert.alert('تم', data.message || 'تم رفع الريل بنجاح');
        setShowUploadModal(false);
        setSelectedVideo(null);
        setUploadTitle('');
        setUploadDescription('');
        setUploadCategory('other');
        setLinkType('none');
        setLinkId('');
        setLinkLabel('');
        fetchReels();
        if (isAdmin) {
          fetchPendingReels();
        }
      } else {
        Alert.alert('خطأ', data.message || 'فشل رفع الريل. حاول تاني.');
      }
    } catch (error: any) {
      console.error('Error uploading reel:', error);
      Alert.alert('خطأ', error.message || 'فشل رفع الريل. تحقق من النت وحاول تاني.');
    } finally {
      setUploading(false);
      setUploadProgress('');
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

  // --- App Store guideline 1.2: report content, block abusive users ---

  const REPORT_REASONS: { key: string; label: string }[] = [
    { key: 'spam', label: 'Spam or misleading' },
    { key: 'harassment', label: 'Harassment or bullying' },
    { key: 'hate', label: 'Hate speech' },
    { key: 'violence', label: 'Violence or dangerous acts' },
    { key: 'sexual', label: 'Nudity or sexual content' },
    { key: 'copyright', label: 'Copyright infringement' },
    { key: 'other', label: 'Something else' },
  ];

  const submitReport = async (reelId: string, reason: string, commentId?: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/reels/${reelId}/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentId ? { reason, commentId } : { reason }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        // Don't leave the reporter staring at what they just flagged while
        // it awaits admin review — same treatment as blocking a user.
        if (commentId) {
          setComments((prev) => prev.filter((c) => c._id !== commentId));
        } else {
          setReels((prev) => prev.filter((r) => r._id !== reelId));
        }
      }
      Alert.alert(
        response.ok ? 'Report received' : 'Report failed',
        data.message || (response.ok ? 'Our team will review this content.' : 'Please try again.')
      );
    } catch {
      Alert.alert('Report failed', 'Network error. Please try again.');
    }
  };

  const chooseReportReason = (reelId: string, commentId?: string) => {
    Alert.alert(
      'Report content',
      'Why are you reporting this?',
      [
        ...REPORT_REASONS.map((r) => ({
          text: r.label,
          onPress: () => submitReport(reelId, r.key, commentId),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  const blockUser = async (userId: string, name: string) => {
    Alert.alert(
      `Block ${name}?`,
      'You will no longer see their reels or comments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(
                `${API_BASE_URL}/api/users/block/${userId}`,
                { method: 'POST' }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                Alert.alert('Block failed', data.message || 'Please try again.');
                return;
              }
              // Drop their content from the current feed immediately.
              setReels((prev) =>
                prev.filter((r) => {
                  const uploader =
                    typeof r.uploadedBy === 'string' ? r.uploadedBy : r.uploadedBy?._id;
                  return String(uploader) !== String(userId);
                })
              );
              Alert.alert('Blocked', data.message || `You will no longer see content from ${name}.`);
            } catch {
              Alert.alert('Block failed', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openCommentModeration = (comment: ReelComment) => {
    if (!user || !activeCommentReelId) return;
    const authorId = comment.user?._id ? String(comment.user._id) : null;
    const authorName = comment.user?.name || 'this user';

    const options: any[] = [
      {
        text: 'Report this comment',
        onPress: () => chooseReportReason(activeCommentReelId, comment._id),
      },
    ];

    if (authorId) {
      options.push({
        text: `Block ${authorName}`,
        style: 'destructive',
        onPress: async () => {
          await blockUser(authorId, authorName);
          // Hide their comments from the open thread straight away.
          setComments((prev) =>
            prev.filter((c) => String(c.user?._id) !== authorId)
          );
        },
      });
    }

    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Options', 'Report this comment or block its author.', options);
  };

  const openReelModeration = (reel: Reel) => {
    if (!user) return requireLogin();

    const uploaderId =
      typeof reel.uploadedBy === 'string' ? reel.uploadedBy : reel.uploadedBy?._id;
    const uploaderName =
      (typeof reel.uploadedBy === 'object' ? reel.uploadedBy?.name : '') ||
      reel.uploadedByName ||
      'this user';

    const options: any[] = [
      { text: 'Report this reel', onPress: () => chooseReportReason(reel._id) },
    ];

    if (uploaderId) {
      options.push({
        text: `Block ${uploaderName}`,
        style: 'destructive',
        onPress: () => blockUser(String(uploaderId), uploaderName),
      });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Options', 'Report this content or block the person who posted it.', options);
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
    const isPlaying =
      isScreenFocused &&
      currentIndex === index &&
      !pausedVideos.has(index) &&
      !showUploadModal &&
      !showPendingModal &&
      !showCommentsModal;
    const uploadedByName = typeof item.uploadedBy === 'object' 
      ? item.uploadedBy.name 
      : item.uploadedByName || 'Unknown';
    const rawAvatar =
      typeof item.uploadedBy === 'object'
        ? item.uploadedBy.avatar
        : item.uploadedByAvatar;
    const uploadedById = typeof item.uploadedBy === 'object' 
      ? item.uploadedBy._id 
      : (typeof item.uploadedBy === 'string' ? item.uploadedBy : null);
    const isOwner = user && uploadedById && user.id === uploadedById.toString();
    const uploadedByAvatar = resolveMediaUrl(rawAvatar || (isOwner ? user.avatar : '') || '');
    
    const fit = videoFit[item._id] || 'portrait';
    const isLandscape = fit === 'landscape';

    return (
      <View style={[styles.reelContainer, { height: reelHeight }]}>
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

            {item.title || item.description ? (
              <Text style={styles.description} numberOfLines={3}>
                {item.title || item.description}
              </Text>
            ) : null}
            {item.linkType && item.linkType !== 'none' && item.linkId ? (
              <ReelPromoCta
                linkType={item.linkType}
                remainingMs={
                  progressById[item._id]?.duration
                    ? progressById[item._id].duration - (progressById[item._id].position || 0)
                    : Number.POSITIVE_INFINITY
                }
                onPress={() => {
                  const route = getReelLinkRoute(item.linkType, item.linkId);
                  if (route) router.push(route as any);
                }}
              />
            ) : null}
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

            {isOwner ? (
              <TouchableOpacity style={styles.sideAction} onPress={() => deleteReel(item._id)}>
                <Text style={styles.sideActionIcon}>🗑️</Text>
                <Text style={styles.sideActionText}>Delete</Text>
              </TouchableOpacity>
            ) : (
              /* App Store guideline 1.2: user-generated content needs a way to
                 report it and to block the person who posted it. */
              <TouchableOpacity
                style={styles.sideAction}
                onPress={() => openReelModeration(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.sideActionIcon}>⋯</Text>
                <Text style={styles.sideActionText}>More</Text>
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
        <View
          style={styles.feedWrap}
          onLayout={(event) => {
            if (Platform.OS !== 'android') return;
            const next = Math.round(event.nativeEvent.layout.height);
            if (next > 0 && Math.abs(next - androidFeedHeight) > 1) {
              setAndroidFeedHeight(next);
            }
          }}
        >
          <FlatList
            data={reels}
            renderItem={renderReel}
            keyExtractor={(item) => item._id}
            extraData={reelHeight}
            pagingEnabled
            scrollEnabled={scrubbingId === null}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            snapToInterval={reelHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            getItemLayout={(data, index) => ({
              length: reelHeight,
              offset: reelHeight * index,
              index,
            })}
          />
        </View>
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
                  <Text style={styles.videoPickerText}>✓ الفيديو جاهز</Text>
                  <Text style={styles.videoPickerSubtext}>هيترفع بنفس الجودة</Text>
                </View>
              ) : (
                <Text style={styles.videoPickerText}>📹 اختار فيديو</Text>
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

            <Text style={[styles.label, { marginTop: 8 }]}>رابط تسويقي (اختياري)</Text>
            <View style={styles.linkTypeRow}>
              {REEL_LINK_TYPES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryChip,
                    linkType === option.value && styles.categoryChipActive,
                  ]}
                  onPress={() => {
                    setLinkType(option.value);
                    setLinkId('');
                    setLinkLabel('');
                  }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      linkType === option.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {linkType !== 'none' ? (
              <>
                <Text style={styles.linkHint}>
                  {getReelLinkMeta(linkType).hint}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(linkOptions[linkType] || []).map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.categoryChip,
                        linkId === option.id && styles.categoryChipActive,
                      ]}
                      onPress={() => {
                        setLinkId(option.id);
                        setLinkLabel(getReelLinkMeta(linkType).cta);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          linkId === option.id && styles.categoryChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {option.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
              onPress={uploadReel}
              disabled={uploading || !selectedVideo}
            >
              {uploading ? (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>{uploadProgress || 'جاري الرفع…'}</Text>
                </View>
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
                    {/* Comments are not pre-moderated, so each one needs its
                        own report/block affordance (App Store 1.2). */}
                    {user && item.user?._id && String(item.user._id) !== String(user.id) ? (
                      <TouchableOpacity
                        style={styles.commentMoreBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => openCommentModeration(item)}
                      >
                        <Text style={styles.commentMoreText}>⋯</Text>
                      </TouchableOpacity>
                    ) : null}
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
  feedWrap: {
    flex: 1,
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
  commentMoreBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  commentMoreText: {
    color: '#888888',
    fontSize: 18,
    fontWeight: '700',
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
  linkTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  linkHint: {
    color: '#999999',
    fontSize: 13,
    marginBottom: 10,
  },
  promoWrap: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
    justifyContent: 'center',
  },
  promoLoaderRing: {
    position: 'absolute',
    left: -6,
    right: -6,
    top: -6,
    bottom: -6,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E50914',
    borderTopColor: '#FFFFFF',
    borderRightColor: 'rgba(255,255,255,0.25)',
  },
  promoLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  promoLinkEnding: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#E50914',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  promoPlay: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  promoLoader: {
    marginRight: 2,
  },
  promoLinkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  promoLinkAttach: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E50914',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  promoLinkAttachText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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

