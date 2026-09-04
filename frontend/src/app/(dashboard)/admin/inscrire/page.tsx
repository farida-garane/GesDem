'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types/user';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminInscrireUtilisateurPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login/admin');
      }
    }
  }, [user, authLoading, router]);

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [departement, setDepartement] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('demandeur');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (password.length < 4) {
      setError('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.createUser({
        nom: nom.trim(),
        email: email.trim(),
        departement: departement.trim(),
        password,
        role,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 p-8 sm:p-10 shadow-[0_4px_30px_rgba(0,43,127,0.04)] space-y-7 max-w-lg w-full mx-auto animate-fade-in my-4">
      
      {/* En-tête sobre et spacieux identique à la page register */}
      <div className="text-center space-y-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#002B7F] tracking-tight">
            Dem<span className="text-[#FF5E00]">Ops</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-medium">
            Inscrire un utilisateur 
          </p>
        </div>
      </div>

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
            Utilisateur inscrit avec succès ! Redirection...
          </div>
        )}

        {/* 1. Nom d'utilisateur */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
            Nom 
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            autoFocus
            placeholder=""
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
          />
        </div>

        {/* 2. Adresse email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
             Email 
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=""
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
            placeholder="Ex :  Logistique,"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
          />
        </div>

        {/* 4. Mots de passe en 2 colonnes avec boutons oeil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
              Mot de passe 
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=""
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

          {/* Confirmation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
              Confirmation 
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder=""
                disabled={isLoading}
                className="w-full px-4 pr-11 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#002B7F] p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 5. Le Champ RÔLE sous forme de balise select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
            Rôle 
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-100 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] focus:outline-none transition-all font-semibold cursor-pointer"
          >
            <option value="demandeur">Demandeur (Collaborateur)</option>
            <option value="technicien">Services Généraux</option>
            <option value="admin">Administrateur (Direction)</option>
          </select>
        </div>

        {/* 6. Bouton d'Inscription : Orange Vif (#FF5E00) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 active:scale-95 shadow-md"
          >
            {isLoading ? 'Inscription en cours...' : 'Inscrire cet utilisateur'}
          </button>
        </div>

        {/* 7. Lien retour Gestion Utilisateurs */}
        <div className="text-center pt-3 border-t border-slate-100">
          <Link href="/admin" className="text-xs text-[#002B7F] font-black hover:underline">
            &larr; Retour à la gestion des utilisateurs
          </Link>
        </div>
      </form>
    </div>
  );
}
