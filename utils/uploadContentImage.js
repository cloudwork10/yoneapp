import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import API_BASE_URL from '../config/api';
import { makeAuthenticatedRequest, refreshAuthToken } from './tokenRefresh';

const IMAGE_UPLOAD_URL = `${API_BASE_URL}/api/admin/content/upload-image`;

const guessMime = (uri, mimeType) => {
  if (mimeType && String(mimeType).startsWith('image/')) return mimeType;
  const ext = String(uri || '').split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
};

const guessName = (uri, mime, fileName) => {
  if (fileName) return fileName;
  const fromUri = String(uri || '').split('?')[0].split('/').pop();
  if (fromUri && fromUri.includes('.')) return fromUri;
  const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1] || 'jpg';
  return `image.${ext}`;
};

const parseImageUrl = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try {
      return parseImageUrl(JSON.parse(payload));
    } catch {
      return null;
    }
  }
  return payload?.data?.imageUrl || payload?.imageUrl || null;
};

/**
 * Upload a picked image to /api/admin/content/upload-image.
 * Uses native FileSystem on iOS/Android because RN 0.81 fetch + FormData
 * fails with "TypeError: Network request failed".
 */
export async function uploadContentImage(assetOrUri) {
  const asset = typeof assetOrUri === 'string' ? { uri: assetOrUri } : assetOrUri || {};
  const uri = asset.uri;
  const file = asset.file;

  if (!uri && !file) {
    throw new Error('No image selected');
  }

  let token = await AsyncStorage.getItem('token');
  if (!token || !token.startsWith('eyJ')) {
    token = await refreshAuthToken();
  }
  if (!token) {
    throw new Error('Please login again');
  }

  const type = guessMime(uri, asset.mimeType);
  const name = guessName(uri, type, asset.fileName);

  if (file && Platform.OS === 'web') {
    const form = new FormData();
    form.append('image', file, name);
    const response = await makeAuthenticatedRequest(IMAGE_UPLOAD_URL, {
      method: 'POST',
      body: form,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result?.message || `Upload failed (${response.status})`);
    }
    const imageUrl = parseImageUrl(result);
    if (!imageUrl) throw new Error('Upload succeeded but no image URL came back');
    return imageUrl;
  }

  if (uri && Platform.OS !== 'web') {
    const uploaded = await FileSystem.uploadAsync(IMAGE_UPLOAD_URL, uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType: type,
      sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (uploaded.status < 200 || uploaded.status >= 300) {
      const errorBody = parseImageUrl(uploaded.body);
      let message = `Upload failed (${uploaded.status})`;
      try {
        const parsed = JSON.parse(uploaded.body || '{}');
        message = parsed?.message || message;
      } catch {
        // keep status message
      }
      throw new Error(message || errorBody);
    }

    const imageUrl = parseImageUrl(uploaded.body);
    if (!imageUrl) throw new Error('Upload succeeded but no image URL came back');
    return imageUrl;
  }

  const form = new FormData();
  form.append('image', { uri, type, name });
  const response = await makeAuthenticatedRequest(IMAGE_UPLOAD_URL, {
    method: 'POST',
    body: form,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.message || `Upload failed (${response.status})`);
  }
  const imageUrl = parseImageUrl(result);
  if (!imageUrl) throw new Error('Upload succeeded but no image URL came back');
  return imageUrl;
}
