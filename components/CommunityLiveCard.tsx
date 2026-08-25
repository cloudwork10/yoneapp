import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type CommunityLiveData = {
  enabled?: boolean;
  dayName?: string;
  time?: string;
  title?: string;
  topic?: string;
  liveType?: 'talk' | 'guest';
  guestName?: string;
  platform?: 'youtube' | 'tiktok' | 'instagram';
  platformLabel?: string;
  liveState?: 'upcoming' | 'live' | 'done';
  link?: string;
  hasRecording?: boolean;
  recordingUrl?: string;
};

type Props = {
  communityLive?: CommunityLiveData | null;
  hasAccess: boolean;
  onRequireAccess: () => boolean;
};

function normalizeExternalUrl(raw?: string) {
  if (!raw) return '';
  const url = String(raw).trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('www.')) return `https://${url}`;
  return '';
}

async function openLink(url?: string, fallbackMsg?: string) {
  const normalized =
    normalizeExternalUrl(url) ||
    (url && /^https?:\/\//i.test(String(url).trim()) ? String(url).trim() : '');
  if (!normalized) {
    Alert.alert('No valid link', fallbackMsg || 'Ask admin to add the link in Club Management.');
    return;
  }
  try {
    await Linking.openURL(normalized);
  } catch {
    Alert.alert('Error', 'Could not open the link.');
  }
}

export default function CommunityLiveCard({ communityLive, hasAccess, onRequireAccess }: Props) {
  if (communityLive?.enabled === false) return null;

  const platformIcon =
    communityLive?.platform === 'instagram'
      ? 'logo-instagram'
      : communityLive?.platform === 'tiktok'
        ? 'logo-tiktok'
        : 'logo-youtube';

  return (
    <View style={styles.communityPanel}>
      <View style={styles.panelHead}>
        <Text style={styles.communityEyebrow}>COMMUNITY THURSDAY</Text>
        {communityLive?.liveState === 'live' ? (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>NOW</Text>
          </View>
        ) : (
          <View style={styles.platformPill}>
            <Text style={styles.platformPillText}>
              {communityLive?.platformLabel || 'YouTube'}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.communityTitle}>
        {communityLive?.title || 'Community Thursday'}
      </Text>
      <Text style={styles.communityMeta}>
        Every {communityLive?.dayName || 'Thursday'} · {communityLive?.time || '21:00'} ·{' '}
        {communityLive?.platformLabel || 'YouTube'}
      </Text>

      <Text style={styles.communityTopicLabel}>موضوع الأسبوع</Text>
      <Text style={styles.communityTopic}>
        {communityLive?.topic?.trim()
          ? communityLive.topic
          : 'سيتم إعلان الموضوع قريبًا'}
      </Text>

      {communityLive?.liveType === 'guest' && !!communityLive?.guestName ? (
        <Text style={styles.communityGuest}>Guest · {communityLive.guestName}</Text>
      ) : (
        <Text style={styles.communityGuest}>Talk · open for all subscribers</Text>
      )}

      {hasAccess ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            const link = communityLive?.link;
            if (!link) {
              Alert.alert(
                'Link coming soon',
                'Admin will add the YouTube / TikTok / Instagram link in Club Management.'
              );
              return;
            }
            openLink(link, 'Add community live link in Club Management');
          }}
        >
          <Ionicons name={platformIcon} size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>
            Join on {communityLive?.platformLabel || 'YouTube'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
          <Text style={styles.primaryBtnText}>Available for active subscribers</Text>
        </View>
      )}

      {hasAccess && communityLive?.hasRecording ? (
        <TouchableOpacity
          style={[styles.miniGhost, { alignSelf: 'flex-start', marginTop: 10 }]}
          onPress={() => openLink(communityLive?.recordingUrl)}
        >
          <Text style={styles.miniGhostText}>Watch Replay</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  communityPanel: {
    backgroundColor: '#14080a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E50914',
    marginBottom: 16,
  },
  communityEyebrow: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  communityTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  communityMeta: { color: '#999', fontSize: 13, marginBottom: 12 },
  communityTopicLabel: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  communityTopic: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  communityGuest: { color: '#aaa', fontSize: 13, marginBottom: 14 },
  platformPill: {
    backgroundColor: '#2a1215',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  platformPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229,9,20,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E50914' },
  livePillText: { color: '#E50914', fontSize: 10, fontWeight: '800' },
  primaryBtn: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  primaryBtnDisabled: { backgroundColor: '#3a3a3a' },
  miniGhost: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  miniGhostText: { color: '#ccc', fontSize: 12, fontWeight: '600' },
});
