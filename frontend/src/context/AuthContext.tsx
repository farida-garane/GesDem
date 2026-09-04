'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types/user';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    credentials: { username: string; password: string },
    targetEspace?: 'demandeur' | 'technicien' | 'admin'
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('gesdem_token') : null;
      if (storedToken) {
        setToken(storedToken);
        const profile = await authService.getProfile();
        setUser(profile);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (
    credentials: { username: string; password: string },
    targetEspace?: 'demandeur' | 'technicien' | 'admin'
  ) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      const profile = await authService.getProfile();
      setUser(profile);

      // Contrôle strict de rôle selon l'espace de connexion choisi
      if (targetEspace === 'admin' && profile.role !== 'admin') {
        authService.logout();
        setUser(null);
        setToken(null);
        throw new Error("Accès refusé : Ce compte ne dispose pas des privilèges d'Administrateur.");
      }

      if (targetEspace === 'technicien' && profile.role !== 'technicien' && profile.role !== 'admin') {
        authService.logout();
        setUser(null);
        setToken(null);
        throw new Error("Accès refusé : Ce compte n'a pas le rôle Intervenant (Services Généraux). Veuillez vous connecter avec vos identifiants d'intervenant.");
      }

      if (targetEspace === 'demandeur' && profile.role !== 'demandeur') {
        authService.logout();
        setUser(null);
        setToken(null);
        throw new Error("Accès refusé : Ce compte n'est pas un compte Demandeur standard.");
      }

      // Redirection vers l'espace approprié
      if (targetEspace === 'admin' || (!targetEspace && profile.role === 'admin')) {
        router.push('/admin');
      } else if (targetEspace === 'technicien' || (!targetEspace && profile.role === 'technicien')) {
        router.push('/interventions');
      } else {
        router.push('/demandes');
      }
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
