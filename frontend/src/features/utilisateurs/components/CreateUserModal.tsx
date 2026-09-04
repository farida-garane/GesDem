'use client';

import React, { useState } from 'react';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types/user';

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

    if (password.length < 4) {
      setError('Le mot de passe doit comporter au moins 4 caractères.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200/90 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* En-tête */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-[#002B7F] tracking-tight">Inscrire un nouvel utilisateur</h3>
            <p className="text-xs text-[#475569] font-medium mt-0.5">Attribuez directement le rôle Demandeur ou Intervenant</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-[#071530] hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center font-bold text-lg"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nom complet / Identifiant */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                Identifiant ou Nom complet *
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                placeholder="Ex : Kevin ou kevin.support"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#F4F7FB] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] focus:bg-white focus:outline-none focus:border-[#002B7F] font-semibold"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                Email professionnel *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="kevin@entreprise.com"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#F4F7FB] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] focus:bg-white focus:outline-none focus:border-[#002B7F] font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Département */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                Département / Service
              </label>
              <input
                type="text"
                value={departement}
                onChange={(e) => setDepartement(e.target.value)}
                placeholder="Ex: Services Généraux, Informatique, RH..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#F4F7FB] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] focus:bg-white focus:outline-none focus:border-[#002B7F] font-semibold"
              />
            </div>

            {/* Mot de passe temporaire */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                  Mot de passe *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-[#002B7F] hover:underline"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mot de passe de connexion"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#F4F7FB] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] focus:bg-white focus:outline-none focus:border-[#002B7F] font-semibold"
              />
            </div>
          </div>

          {/* Attribution du Rôle par l'Administrateur sous forme de balise select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
              Rôle *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-200 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] focus:outline-none transition-all font-semibold cursor-pointer"
            >
              <option value="demandeur">Demandeur (Collaborateur)</option>
              <option value="technicien">Services Généraux</option>
              <option value="admin">Administrateur (Direction)</option>
            </select>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#FF5E00] hover:bg-[#E05200] text-white rounded-2xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
            >
              {isLoading ? 'Création en cours...' : 'Inscrire cet utilisateur'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
