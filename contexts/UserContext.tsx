import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  adminLevel?: 'super' | 'admin' | 'moderator';
  role: string;
  avatar?: string;
  createdAt?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (userData: User, token?: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

async function clearAuthStorage() {
  await AsyncStorage.multiRemove(['user', 'token', 'refreshToken']);
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!userData || (!token && !refreshToken)) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(userData);

      // Validate access token with backend
      if (token) {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (verifyRes.ok) {
            setUser(parsedUser);
            return;
          }
        } catch {
          // network hiccup — keep session optimistically if we have tokens
        }
      }

      // Access token invalid/expired — try refresh quietly
      if (refreshToken) {
        try {
          const { refreshAuthToken } = require('../utils/tokenRefresh');
          const newToken = await refreshAuthToken();
          if (newToken) {
            setUser(parsedUser);
            return;
          }
        } catch {
          // fall through to clear
        }
      }

      // Stale session — clear without noisy errors
      await clearAuthStorage();
      setUser(null);
    } catch (error) {
      console.log('UserContext: session restore skipped');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, token?: string, refreshToken?: string) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
      // After login, register/sync push token so activation alerts reach this device
      try {
        const NotificationService = require('../services/NotificationService').default;
        const pushToken = await NotificationService.registerForPushNotifications();
        if (pushToken) {
          await NotificationService.syncPushTokenToServer(pushToken);
        } else {
          await NotificationService.syncPushTokenToServer();
        }
        await NotificationService.sendHeartbeat();
      } catch {
        // push optional on web/simulator
      }
    } catch (error) {
      console.log('UserContext: failed to save session');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await clearAuthStorage();
    } catch (error) {
      console.log('UserContext: logout cleanup failed');
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

const defaultContextValue: UserContextType = {
  user: null,
  isLoading: true,
  isAdmin: false,
  isSuperAdmin: false,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
};

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  return context ?? defaultContextValue;
}
