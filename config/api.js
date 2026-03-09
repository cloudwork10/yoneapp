// API Configuration
// - Android emulator: 10.0.2.2 is the host machine's localhost
// - iOS simulator: localhost works
// - Physical device: set EXPO_PUBLIC_API_URL in .env (e.g. http://192.168.1.5:3000)
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;


