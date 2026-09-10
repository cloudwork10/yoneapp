import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import API_BASE_URL from '../config/api';
import { useUser } from '../contexts/UserContext';
import { showSignInAlert } from '../hooks/useAuthGuard';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

function watchStorageKey(userId: string, kind: string, parentId: string, itemKey: string) {
  return `yone_watch_v1:${userId}:${kind}:${parentId}:${itemKey}`;
}

export default function RemindMeButton({
  kind,
  parentId,
  itemKey,
  title,
  parentTitle,
  watching: watchingProp,
}: {
  kind: 'course_lesson' | 'podcast_episode';
  parentId: string;
  itemKey: string;
  title?: string;
  parentTitle?: string;
  watching?: boolean;
}) {
  const { user } = useUser();
  const userId = String((user as any)?._id || (user as any)?.id || 'guest');
  const storageKey = useMemo(
    () => watchStorageKey(userId, kind, String(parentId || ''), String(itemKey || '')),
    [userId, kind, parentId, itemKey]
  );
  const [watching, setWatching] = useState(!!watchingProp);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled) return;
        if (raw === '1') setWatching(true);
        else if (raw === '0') setWatching(false);
        else if (watchingProp) setWatching(true);
      })
      .catch(() => {
        if (!cancelled && watchingProp) setWatching(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey, watchingProp]);

  useEffect(() => {
    if (watchingProp) setWatching(true);
  }, [watchingProp]);

  const persist = (next: boolean) => {
    setWatching(next);
    AsyncStorage.setItem(storageKey, next ? '1' : '0').catch(() => {});
  };

  const syncServer = async (next: boolean) => {
    if (!user || !parentId || !itemKey) return;
    try {
      if (next) {
        await makeAuthenticatedRequest(`${API_BASE_URL}/api/content-watches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, parentId, itemKey, title, parentTitle }),
        });
      } else {
        await makeAuthenticatedRequest(
          `${API_BASE_URL}/api/content-watches?kind=${encodeURIComponent(kind)}&parentId=${encodeURIComponent(parentId)}&itemKey=${encodeURIComponent(itemKey)}`,
          { method: 'DELETE' }
        );
      }
    } catch {
      // Local watching state still stands until the reminder API is live.
    }
  };

  const toggle = () => {
    if (!user) {
      showSignInAlert('reminders');
      return;
    }
    const next = !watching;
    persist(next);
    syncServer(next);
  };

  return (
    <View
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
    >
      <Pressable
        onPress={toggle}
        hitSlop={12}
        style={({ pressed }) => [
          styles.button,
          watching && styles.buttonOn,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.icon}>{watching ? '✓' : '🔔'}</Text>
        <Text style={styles.label}>{watching ? 'Watching' : 'Remind me'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E50914',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonOn: {
    backgroundColor: '#2E7D32',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  icon: {
    color: '#fff',
    fontSize: 12,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
