import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonLoaderProps) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={['#2a2a2a', '#3a3a3a', '#2a2a2a']}
        style={styles.skeleton}
      >
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, 200],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

// Skeleton for Advice Card
export const AdviceCardSkeleton = () => {
  return (
    <View style={styles.adviceCardSkeleton}>
      <SkeletonLoader height={200} borderRadius={20} style={styles.thumbnailSkeleton} />
      <View style={styles.adviceContentSkeleton}>
        <SkeletonLoader width="80%" height={24} style={styles.titleSkeleton} />
        <SkeletonLoader width="60%" height={16} style={styles.authorSkeleton} />
        <SkeletonLoader width="100%" height={14} style={styles.contentSkeleton} />
        <SkeletonLoader width="100%" height={14} style={styles.contentSkeleton} />
        <View style={styles.footerSkeleton}>
          <SkeletonLoader width="30%" height={16} />
          <SkeletonLoader width="20%" height={16} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for Podcast Card
export const PodcastCardSkeleton = () => {
  return (
    <View style={styles.podcastCardSkeleton}>
      <SkeletonLoader width={80} height={80} borderRadius={12} />
      <View style={styles.podcastContentSkeleton}>
        <SkeletonLoader width="90%" height={20} style={styles.titleSkeleton} />
        <SkeletonLoader width="70%" height={16} style={styles.authorSkeleton} />
        <SkeletonLoader width="50%" height={14} style={styles.durationSkeleton} />
      </View>
    </View>
  );
};

// Skeleton for Article Card
export const ArticleCardSkeleton = () => {
  return (
    <View style={styles.articleCardSkeleton}>
      <SkeletonLoader height={150} borderRadius={16} style={styles.thumbnailSkeleton} />
      <View style={styles.articleContentSkeleton}>
        <SkeletonLoader width="85%" height={22} style={styles.titleSkeleton} />
        <SkeletonLoader width="65%" height={16} style={styles.authorSkeleton} />
        <SkeletonLoader width="100%" height={14} style={styles.contentSkeleton} />
        <SkeletonLoader width="80%" height={14} style={styles.contentSkeleton} />
        <View style={styles.tagsSkeletonContainer}>
          <SkeletonLoader width={60} height={24} borderRadius={12} />
          <SkeletonLoader width={80} height={24} borderRadius={12} />
          <SkeletonLoader width={70} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for Roadmap Card
export const RoadmapCardSkeleton = () => {
  return (
    <View style={styles.roadmapCardSkeleton}>
      <SkeletonLoader height={180} borderRadius={16} style={styles.thumbnailSkeleton} />
      <View style={styles.roadmapContentSkeleton}>
        <SkeletonLoader width="90%" height={24} style={styles.titleSkeleton} />
        <SkeletonLoader width="60%" height={16} style={styles.authorSkeleton} />
        <View style={styles.stepsSkeletonContainer}>
          {Array.from({ length: 3 }, (_, index) => (
            <View key={index} style={styles.stepSkeleton}>
              <SkeletonLoader width={30} height={30} borderRadius={15} />
              <SkeletonLoader width="80%" height={16} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    flex: 1,
    borderRadius: 8,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
  },
  shimmerGradient: {
    flex: 1,
  },
  // Advice Card Skeleton
  adviceCardSkeleton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  thumbnailSkeleton: {
    marginBottom: 0,
  },
  adviceContentSkeleton: {
    padding: 20,
  },
  titleSkeleton: {
    marginBottom: 12,
  },
  authorSkeleton: {
    marginBottom: 16,
  },
  contentSkeleton: {
    marginBottom: 8,
  },
  footerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  // Podcast Card Skeleton
  podcastCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  podcastContentSkeleton: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  durationSkeleton: {
    marginTop: 8,
  },
  // Article Card Skeleton
  articleCardSkeleton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  articleContentSkeleton: {
    padding: 20,
  },
  tagsSkeletonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  // Roadmap Card Skeleton
  roadmapCardSkeleton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  roadmapContentSkeleton: {
    padding: 20,
  },
  stepsSkeletonContainer: {
    marginTop: 16,
    gap: 12,
  },
  stepSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
