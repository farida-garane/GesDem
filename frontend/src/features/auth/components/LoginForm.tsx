'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User as UserIcon,
  Wrench,
  Shield,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Building2,
  Sparkles
} from 'lucide-react';

type EspaceType = 'demandeur' | 'technicien' | 'admin';

export function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const urlEspace = (searchParams.get('espace') as EspaceType) || 'demandeur';
  const [selectedEspace, setSelectedEspace] = useState<EspaceType>(
    ['demandeur', 'technicien', 'admin'].includes(urlEspace) ? urlEspace : 'demandeur'
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (urlEspace && ['demandeur', 'technicien', 'admin'].includes(urlEspace)) {
      setSelectedEspace(urlEspace);
    }
  }, [urlEspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({ username, password }, selectedEspace);
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

  const espacesConfig = {
    demandeur: {
      title: 'Espace Collaborateur',
      subtitle: 'Déposez vos besoins et suivez vos requêtes',
      badge: 'Employé / Demandeur',
      badgeClass: 'bg-[#E8F1FF] text-[#002B7F]',
      activeTabClass: 'bg-[#002B7F] text-white shadow-xs',
      buttonClass: 'bg-[#FF5E00] hover:bg-[#E05200] text-white shadow-md',
      icon: UserIcon,
      placeholderUser: 'Ex: nom.prenom ou email',
    },
    technicien: {
      title: 'Espace Intervenant',
      subtitle: 'Support - Traitement & Résolution des requêtes',
      badge: 'Services Techniques',
      badgeClass: 'bg-[#E8F1FF] text-[#002B7F]',
      activeTabClass: 'bg-[#002B7F] text-white shadow-xs',
      buttonClass: 'bg-[#FF5E00] hover:bg-[#E05200] text-white shadow-md',
      icon: Wrench,
      placeholderUser: 'Identifiant Intervenant / Email',
    },
    admin: {
      title: 'Espace Administration',
      subtitle: 'Pilotage global, statistiques & gestion des rôles',
      badge: 'Supervision & Direction',
      badgeClass: 'bg-[#E8F1FF] text-[#002B7F]',
      activeTabClass: 'bg-[#002B7F] text-white shadow-xs',
      buttonClass: 'bg-[#FF5E00] hover:bg-[#E05200] text-white shadow-md',
      icon: Shield,
      placeholderUser: 'Identifiant Administrateur',
    },
  };

  const currentConfig = espacesConfig[selectedEspace];

  return (
    <div className="space-y-6">
      
      {/* 1. SÉLECTEUR DES 3 ESPACES DE CONNEXION */}
      <div className="space-y-2">
        <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider text-center">
          Choisissez votre espace d&apos;accès
        </label>
        
        <div className="grid grid-cols-3 p-1.5 bg-[#F4F7FB] rounded-2xl border border-slate-100 gap-1.5">
          
          {/* Espace 1 : Demandeur */}
          <button
            type="button"
            onClick={() => {
              setSelectedEspace('demandeur');
              setError(null);
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              selectedEspace === 'demandeur'
                ? espacesConfig.demandeur.activeTabClass
                : 'text-[#475569] hover:text-[#071530] hover:bg-white/70'
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">Collaborateur</span>
          </button>

          {/* Espace 2 : Intervenant */}
          <button
            type="button"
            onClick={() => {
              setSelectedEspace('technicien');
              setError(null);
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              selectedEspace === 'technicien'
                ? espacesConfig.technicien.activeTabClass
                : 'text-[#475569] hover:text-[#071530] hover:bg-white/70'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">Intervenant</span>
          </button>

          {/* Espace 3 : Admin */}
          <button
            type="button"
            onClick={() => {
              setSelectedEspace('admin');
              setError(null);
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              selectedEspace === 'admin'
                ? espacesConfig.admin.activeTabClass
                : 'text-[#475569] hover:text-[#071530] hover:bg-white/70'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span className="truncate">Direction</span>
          </button>

        </div>
      </div>

      {/* 2. BANNIÈRE D'INFORMATION SUR L'ESPACE SÉLECTIONNÉ */}
      <div className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-slate-100 flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#002B7F] shrink-0 shadow-xs">
            <currentConfig.icon className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-[#071530] truncate">
              {currentConfig.title}
            </p>
            <p className="text-[11px] text-[#475569] font-medium truncate">
              {currentConfig.subtitle}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 ${currentConfig.badgeClass}`}>
          {currentConfig.badge}
        </span>
      </div>

      {/* 3. FORMULAIRE DE CONNEXION */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl animate-fade-in flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Champ Identifiant / Email */}
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
            placeholder={currentConfig.placeholderUser}
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
                alert("Veuillez vous rapprocher de l'administrateur pour réinitialiser vos accès.");
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#071530] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bouton de Connexion thématique */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-2xl text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95 ${currentConfig.buttonClass}`}
          >
            <span>{isLoading ? 'Vérification des accès...' : `Accéder à l'${currentConfig.title}`}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Lien Inscription (uniquement pour l'espace Collaborateur) */}
        {selectedEspace === 'demandeur' ? (
          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-xs text-[#475569] font-medium">
              Nouveau collaborateur dans l&apos;entreprise ?{' '}
              <Link href="/register" className="text-[#002B7F] hover:underline font-extrabold">
                Créer mon compte employé
              </Link>
            </p>
          </div>
        ) : (
          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-[11px] text-[#475569] font-medium">
               Accès restreint. Seul l&apos;Administrateur peut accorder les privilèges de cet espace.
            </p>
          </div>
        )}
      </form>

    </div>
  );
}
