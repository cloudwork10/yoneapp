// API Configuration
// Default: production API (MongoDB Atlas + Railway uploads).
// Local backend only when EXPO_PUBLIC_USE_LOCAL_API=true in .env (dev only).
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PRODUCTION_API_URL = 'https://yone-api-production-20e7.up.railway.app';

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

  const useLocal =
    __DEV__ &&
    typeof process !== 'undefined' &&
    process.env.EXPO_PUBLIC_USE_LOCAL_API === 'true';

  if (useLocal) {
    const lanHost = getLanHostFromExpo();
    if (lanHost) {
      return `http://${lanHost}:3000`;
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    return 'http://127.0.0.1:3000';
  }

  return PRODUCTION_API_URL;
};

const API_BASE_URL = getApiBaseUrl();

if (__DEV__) {
  console.log('🔗 API_BASE_URL:', API_BASE_URL);
}

export default API_BASE_URL;
