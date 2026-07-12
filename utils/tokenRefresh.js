import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

let refreshPromise = null;

// Shared token refresh — deduped so parallel 401s don't spam refresh
export const refreshAuthToken = async (retryCount = 0) => {
  if (refreshPromise && retryCount === 0) {
    return refreshPromise;
  }

  const run = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!refreshToken) {
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        return null;
      }

      if (!refreshToken.startsWith('eyJ')) {
        await AsyncStorage.removeItem('refreshToken');
        return null;
      }

      if (retryCount > 0) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const newToken = refreshData?.data?.tokens?.accessToken;
        const newRefreshToken = refreshData?.data?.tokens?.refreshToken;

        if (!newToken) return null;

        await AsyncStorage.setItem('token', newToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }
        return newToken;
      }

      if (refreshResponse.status === 429 && retryCount < 3) {
        return await refreshAuthToken(retryCount + 1);
      }

      // Stale refresh token — clear quietly (no console.error → no Expo red toast)
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
      return null;
    } catch {
      if (retryCount < 2) {
        return await refreshAuthToken(retryCount + 1);
      }
      return null;
    } finally {
      if (retryCount === 0) {
        refreshPromise = null;
      }
    }
  };

  if (retryCount === 0) {
    refreshPromise = run();
    return refreshPromise;
  }
  return run();
};

export const makeAuthenticatedRequest = async (url, options = {}, retryCount = 0) => {
  try {
    let token = await AsyncStorage.getItem('token');
    const storedRefresh = await AsyncStorage.getItem('refreshToken');

    if (!token && !storedRefresh) {
      return {
        ok: false,
        status: 401,
        json: async () => ({
          status: 'error',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        }),
      };
    }

    if (!token && storedRefresh) {
      token = await refreshAuthToken();
      if (!token) {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            status: 'error',
            message: 'Authentication required',
            code: 'AUTH_REQUIRED',
          }),
        };
      }
    }

    const currentToken = token || (await AsyncStorage.getItem('token'));
    if (!currentToken || !currentToken.startsWith('eyJ')) {
      return {
        ok: false,
        status: 401,
        json: async () => ({
          status: 'error',
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        }),
      };
    }

    const isFormData = options.body instanceof FormData;
    const requestHeaders = {
      Authorization: `Bearer ${currentToken}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
    });

    if (response.ok) {
      return response;
    }

    if (response.status === 401 && retryCount === 0) {
      const newToken = await refreshAuthToken();
      if (newToken) {
        return await makeAuthenticatedRequest(url, options, retryCount + 1);
      }

      await AsyncStorage.multiRemove(['token', 'refreshToken']);
      return {
        ok: false,
        status: 401,
        json: async () => ({
          status: 'error',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        }),
      };
    }

    return response;
  } catch {
    return {
      ok: false,
      status: 500,
      json: async () => ({
        status: 'error',
        message: 'Network error',
        code: 'NETWORK_ERROR',
      }),
    };
  }
};
