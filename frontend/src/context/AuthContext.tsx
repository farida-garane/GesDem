'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types/user';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('gesdem_token') : null;
      if (storedToken) {
        setToken(storedToken);
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } catch {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      const profile = await authService.getProfile();
      setUser(profile);
      router.push('/demandes');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        isAuthenticated: Boolean(token && user),
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
