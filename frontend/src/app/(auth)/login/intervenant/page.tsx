'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Wrench, Eye, EyeOff, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function LoginIntervenantPage() {
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
      await login({ username: username.trim(), password }, 'technicien');
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
    <div className="bg-white rounded-3xl border border-slate-100/90 p-7 sm:p-9 shadow-[0_4px_30px_rgba(0,43,127,0.04)] space-y-6 max-w-md w-full mx-auto animate-fade-in">
      
      {/* En-tête Intervenant */}
      <div className="text-center space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#002B7F] tracking-tight">
              Dem<span className="text-[#FF5E00]">Ops</span>
            </h1>
          </div>
          <p className="text-xs text-[#475569] font-medium">
            Support — Traitement &amp; Résolution des requêtes
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl animate-fade-in">
            {error}
          </div>
        )}

        {/* Champ Identifiant */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
            Identifiant ou Email
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            placeholder="Ex : joel ou joel@gmail.com"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
          />
        </div>

        {/* Champ Mot de passe */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
              Mot de passe
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Veuillez vous rapprocher de l'administrateur pour réinitialiser vos accès intervenant.");
              }}
              className="text-xs font-bold text-[#002B7F] hover:underline"
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
              disabled={isLoading}
              className="w-full px-4 pr-11 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#002B7F] p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bouton de Connexion : Orange Vif (#FF5E00) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 active:scale-95 shadow-md"
          >
            <span>{isLoading ? 'Vérification des accès...' : "Accéder à l'Espace Intervenant"}</span>
          </button>
        </div>

        {/* Note de sécurité */}
        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-[11px] text-[#475569] font-medium">
            Accès réservé aux gestionnaires de traitement habilités.
          </p>
        </div>
      </form>

    </div>
  );
}
