'use client';

import React, { useState } from 'react';
import { authService } from '@/services/auth.service';
import { User, UserRole } from '@/types/user';
import {
  UserPlus,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  Wrench,
  Shield,
  Check
} from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [departement, setDepartement] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('demandeur');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

    setIsLoading(true);
    setError(null);

    try {
      await authService.createUser({
        nom: nom.trim(),
        email: email.trim(),
        departement: departement.trim(),
        password,
        role,
      });

      onSuccess();
      onClose();
      // Reset form
      setNom('');
      setEmail('');
      setDepartement('');
      setPassword('');
      setRole('demandeur');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5">
        
        {/* En-tête */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Créer un nouveau compte</h3>
              <p className="text-[11px] text-slate-500 font-medium">Attribuez directement un rôle et un département</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nom d'utilisateur */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Nom d&apos;utilisateur *
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                placeholder="Ex : moussa.traore"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Email professionnel *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="moussa@entreprise.com"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Département */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Département / Service
              </label>
              <input
                type="text"
                value={departement}
                onChange={(e) => setDepartement(e.target.value)}
                placeholder="Ex: RH, Comptabilité, IT..."
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            {/* Mot de passe temporaire */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Mot de passe temporaire *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 caractères"
                  disabled={isLoading}
                  className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Rôle à attribuer */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">
              Rôle initial
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('demandeur')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'demandeur'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-extrabold ring-1 ring-blue-500/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs'
                }`}
              >
                <UserIcon className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block truncate">Demandeur</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('technicien')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'technicien'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 font-extrabold ring-1 ring-orange-500/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs'
                }`}
              >
                <Wrench className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                <span className="text-[11px] block truncate">Intervenant</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-extrabold ring-1 ring-indigo-500/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-[11px] block truncate">Admin</span>
              </button>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5 active:scale-98 transition-all"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Créer l&apos;utilisateur</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
