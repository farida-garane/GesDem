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

// Utilisateur fictif par défaut pour naviguer librement sans connexion
const DEFAULT_GUEST_USER: User = {
  id: 1,
  nom: 'Utilisateur Démo',
  email: 'demo@gesdem.local',
  role: 'admin', // Permet d'afficher tous les blocs (Demandeur, Technicien, Admin)
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_GUEST_USER);
  const [token, setToken] = useState<string | null>('mock-token');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('gesdem_token');
      if (storedToken) {
        setToken(storedToken);
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } catch {
      // Garder l'utilisateur démo par défaut
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
    setUser(DEFAULT_GUEST_USER);
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
        isAuthenticated: true,
        role: user?.role || 'admin',
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
