'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types/user';
import { 
  User, 
  Mail, 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [departement, setDepartement] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('demandeur');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.register({
        nom: nom.trim(),
        email: email.trim(),
        departement: departement.trim(),
        password,
        role,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'inscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Bannière Erreur */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl animate-fade-in">
          {error}
        </div>
      )}

      {/* Bannière Succès */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl animate-fade-in">
          Compte créé avec succès ! Redirection...
        </div>
      )}

      {/* 1. Nom d'utilisateur */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
          Nom complet / Identifiant *
        </label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          autoFocus
          placeholder="Ex : Jean Dupont"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
        />
      </div>

      {/* 2. Adresse email */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
          Adresse email professionnelle *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Ex : jean.dupont@entreprise.com"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
        />
      </div>

      {/* 3. Département / Service */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
          Département / Service
        </label>
        <input
          type="text"
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          placeholder="Ex : Comptabilité, RH, Logistique..."
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
        />
      </div>

      {/* 4. Mots de passe en 2 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mot de passe */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
            Mot de passe *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
          />
        </div>

        {/* Confirmation */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
            Confirmation *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
          />
        </div>
      </div>

      {/* 6. Bouton de Création de Compte : Orange Vif (#FF5E00) */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 active:scale-95 shadow-md"
        >
          {isLoading ? 'Création du compte...' : 'Créer mon compte'}
        </button>
      </div>

      {/* 7. Lien retour Connexion */}
      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-[#475569] font-medium">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-[#002B7F] font-black hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}
