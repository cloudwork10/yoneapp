// API Configuration
// - iOS simulator: localhost works
// - Android emulator: 10.0.2.2 maps to the host machine
// - Physical device / Expo Go: use EXPO_PUBLIC_API_URL (your Mac's LAN IP)
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const stripTrailingSlash = (url) => url.replace(/\/$/, '');

const getLanHostFromExpo = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.linkingUri ||
      Constants.experienceUrl ||
      '';
    // e.g. "192.168.100.90:8081" or "exp://192.168.100.90:8081"
    const match = String(hostUri).match(/(\d{1,3}(?:\.\d{1,3}){3})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return stripTrailingSlash(process.env.EXPO_PUBLIC_API_URL);
  }

  // When Expo serves over LAN (physical device / Expo Go), reuse that host for the API
  const lanHost = getLanHostFromExpo();
  if (lanHost && lanHost !== '127.0.0.1' && lanHost !== 'localhost') {
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
