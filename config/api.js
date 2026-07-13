// API Configuration
// - Prefer EXPO_PUBLIC_API_URL from .env
// - Else reuse Expo LAN host (physical device / Expo Go)
// - Android emulator: 10.0.2.2
// - iOS simulator fallback: 127.0.0.1
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const stripTrailingSlash = (url) => url.replace(/\/$/, '');

const getLanHostFromExpo = () => {
  try {
    const candidates = [
      Constants.expoConfig?.hostUri,
      Constants.expoGoConfig?.debuggerHost,
      Constants.manifest2?.extra?.expoClient?.hostUri,
      Constants.manifest?.debuggerHost,
      Constants.linkingUri,
      Constants.experienceUrl,
    ];

    for (const value of candidates) {
      const match = String(value || '').match(/(\d{1,3}(?:\.\d{1,3}){3})/);
      if (match && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
    return null;
  } catch {
    return null;
  }
};

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return stripTrailingSlash(process.env.EXPO_PUBLIC_API_URL);
  }

  const lanHost = getLanHostFromExpo();
  if (lanHost) {
    return `http://${lanHost}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://127.0.0.1:3000';
};

const API_BASE_URL = getApiBaseUrl();

if (__DEV__) {
  console.log('🔗 API_BASE_URL:', API_BASE_URL);
}

export default API_BASE_URL;
