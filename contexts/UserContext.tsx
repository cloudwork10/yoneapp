import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  adminLevel?: 'super' | 'admin' | 'moderator';
  role: string;
  createdAt?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      console.log('UserContext: Loading user from storage...');
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      console.log('UserContext: Raw user data from storage:', userData);
      console.log('UserContext: Token exists:', !!token);
      console.log('UserContext: Refresh token exists:', !!refreshToken);
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        console.log('UserContext: Parsed user data:', parsedUser);
        setUser(parsedUser);
      } else if (userData && refreshToken && !token) {
        // User data exists but no access token, try to refresh
        console.log('UserContext: User data exists but no access token, attempting refresh...');
        try {
          const { refreshAuthToken } = require('../utils/tokenRefresh');
          const newToken = await refreshAuthToken();
          if (newToken) {
            const parsedUser = JSON.parse(userData);
            console.log('UserContext: Token refreshed successfully, setting user');
            setUser(parsedUser);
          } else {
            console.log('UserContext: Token refresh failed, clearing user data');
            setUser(null);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refreshToken');
          }
        } catch (error) {
          console.error('UserContext: Token refresh error:', error);
          setUser(null);
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('refreshToken');
        }
      } else {
        console.log('UserContext: No user data or tokens found in storage');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      setUser(null);
    } finally {
      console.log('UserContext: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const login = async (userData: User, token?: string, refreshToken?: string) => {
    try {
      console.log('UserContext: Login called with user data:', userData);
      console.log('UserContext: Token received:', token ? token.substring(0, 20) + '...' : 'No token');
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      if (token) {
        await AsyncStorage.setItem('token', token);
        console.log('UserContext: Token saved to storage');
      }
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
        console.log('UserContext: Refresh token saved to storage');
      }
      console.log('UserContext: User data saved to storage');
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('UserContext: Logout called');
      setUser(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      console.log('UserContext: User data and tokens cleared from storage');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = user?.isAdmin || user?.role === 'admin' || false;
  const isSuperAdmin = user?.adminLevel === 'super' || user?.adminLevel === 'admin' || user?.role === 'admin';

  const value: UserContextType = {
    user,
    isLoading,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
