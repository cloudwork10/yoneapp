import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

const DEFAULT_MESSAGE = 'Please sign in to access this section.\nسجّل دخول للوصول لهذا القسم.';

/**
 * Sign-in prompt for guests. Standalone (not a hook) so it can be called from
 * event handlers that already have `user` from useUser().
 *
 * Use this *before* showPremiumGateAlert: a guest should be told to sign in,
 * not to subscribe.
 */
export function showSignInAlert(contentWord = 'content') {
  Alert.alert(
    'Sign in required',
    `Please sign in to open ${contentWord}.\nسجّل دخول عشان تفتح المحتوى.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: () => router.push('/login') },
    ]
  );
}

export function useAuthGuard() {
  const { user } = useUser();

  const requireAuth = useCallback(
    (action: () => void, message: string = DEFAULT_MESSAGE) => {
      if (user) {
        action();
        return;
      }
      Alert.alert('Sign in required', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
    },
    [user]
  );

  return { requireAuth, isGuest: !user };
}
