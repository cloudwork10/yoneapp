import AsyncStorage from '@react-native-async-storage/async-storage';

// Shared token refresh function with retry logic
export const refreshAuthToken = async (retryCount = 0) => {
  try {
    console.log(`🔄 Refreshing authentication token... (attempt ${retryCount + 1})`);
    
    // Add delay for rate limiting
    if (retryCount > 0) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const refreshResponse = await fetch('http://192.168.100.42:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@yoneapp.com',
        password: 'admin123'
      })
    });
    
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      const newToken = refreshData.data.tokens.accessToken;
      await AsyncStorage.setItem('token', newToken);
      console.log('✅ Token refreshed successfully');
      return newToken;
    } else if (refreshResponse.status === 429 && retryCount < 3) {
      // Rate limited, retry with exponential backoff
      console.log('⏳ Rate limited, retrying...');
      return await refreshAuthToken(retryCount + 1);
    } else {
      console.error('❌ Failed to refresh token:', refreshResponse.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    if (retryCount < 2) {
      console.log('🔄 Retrying token refresh...');
      return await refreshAuthToken(retryCount + 1);
    }
    return null;
  }
};

// Helper function to make authenticated requests with auto-retry
export const makeAuthenticatedRequest = async (url, options = {}, retryCount = 0) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No token found');
      return null;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.ok) {
      return response;
    } else if (response.status === 401 && retryCount === 0) {
      // Token expired, try to refresh
      console.log('🔄 Token expired, attempting to refresh...');
      const newToken = await refreshAuthToken();
      
      if (newToken) {
        // Retry the request with new token
        return await makeAuthenticatedRequest(url, options, retryCount + 1);
      } else {
        console.error('❌ Failed to refresh token');
        return response;
      }
    } else {
      return response;
    }
  } catch (error) {
    console.error('❌ Request error:', error);
    return null;
  }
};
