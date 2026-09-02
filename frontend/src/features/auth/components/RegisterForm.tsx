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
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Nom d&apos;utilisateur *
        </label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          autoFocus
          placeholder=""
          disabled={isLoading}
          className="w-full px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
        />
      </div>

      {/* 2. Adresse email */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Adresse email professionnelle *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder=""
          disabled={isLoading}
          className="w-full px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
        />
      </div>

      {/* 3. Département / Service */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Département / Service
        </label>
        <input
          type="text"
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          placeholder="Ex : Icomptabilite.."
          disabled={isLoading}
          className="w-full px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
        />
      </div>

      {/* 4. Mots de passe en 2 colonnes avec espace généreux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mot de passe */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Mot de passe *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=""
              disabled={isLoading}
              className="w-full px-4 pr-11 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
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

        {/* Confirmation */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Confirmation *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder=""
              disabled={isLoading}
              className="w-full px-4 pr-11 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 6. Bouton de Création de Compte */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
        >
          {isLoading ? 'Création du compte...' : 'Créer mon compte'}
        </button>
      </div>

      {/* 7. Lien retour Connexion */}
      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}
