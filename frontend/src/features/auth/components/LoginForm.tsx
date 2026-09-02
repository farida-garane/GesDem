'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({ username, password });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Identifiants incorrects ou serveur indisponible.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl animate-fade-in">
          {error}
        </div>
      )}

      {/* 1. Champ Identifiant / Email */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Nom d&apos;utilisateur ou Email
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          placeholder="Ex : jean.dupont"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
        />
      </div>

      {/* 2. Champ Mot de passe */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Mot de passe
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Veuillez contacter votre administrateur pour réinitialiser votre mot de passe.");
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=""
            disabled={isLoading}
            className="w-full px-4 pr-11 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Bouton de Connexion */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </div>

      {/* 4. Lien Inscription */}
      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </form>
  );
}
