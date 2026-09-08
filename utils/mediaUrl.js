import API_BASE_URL from '../config/api';

/**
 * Rewrite local upload URLs to the current API host.
 * Fixes DB links saved as localhost / 127.0.0.1 / wrong ports.
 */
export default function resolveMediaUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Local device URIs only work on the phone that picked the file
  if (/^(file|ph|content|assets-library):/i.test(trimmed)) {
    return fallback;
  }

  // External CDN / YouTube / etc.
  if (/^https?:\/\//i.test(trimmed) && !trimmed.includes('/uploads/')) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  if (trimmed.includes('/uploads/')) {
    const path = trimmed.replace(/^https?:\/\/[^/]+/i, '');
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }

  return trimmed;
}
