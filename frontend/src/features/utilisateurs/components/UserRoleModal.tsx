'use client';

import React, { useState } from 'react';
import { User, UserRole, UpdateUserAdminPayload } from '@/types/user';
import { Eye, EyeOff } from 'lucide-react';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: number, payload: UpdateUserAdminPayload) => Promise<void>;
  onDelete?: (userId: number) => Promise<void>;
}

export function UserRoleModal({ isOpen, onClose, user, onConfirm, onDelete }: UserRoleModalProps) {
  const [nom, setNom] = useState(user?.nom || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [departement, setDepartement] = useState(user?.departement || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'demandeur');
  const [isActive, setIsActive] = useState<boolean>(user?.is_active ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when user changes
  React.useEffect(() => {
    if (user) {
      setNom(user.nom || user.username || '');
      setEmail(user.email || '');
      setDepartement(user.departement || '');
      setPassword('');
      setShowPassword(false);
      setSelectedRole(user.role);
      setIsActive(user.is_active ?? true);
      setConfirmDelete(false);
      setError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim()) {
      setError('Veuillez renseigner le nom et l’adresse email.');
      return;
    }

    if (password && password.length < 4) {
      setError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: UpdateUserAdminPayload = {
        nom: nom.trim(),
        email: email.trim(),
        departement: departement.trim(),
        role: selectedRole,
        is_active: isActive,
        ...(password.trim() ? { password: password.trim() } : {}),
      };

      await onConfirm(user.id, payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du compte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(user.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du compte.');
    } finally {
      setIsDeleting(false);
    }
  };

  const displayName = nom || [user.prenom, user.nom].filter(Boolean).join(' ') || user.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-[#CBD5E1] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5 my-8">
        
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-[#002B7F]">Gérer le compte</h3>
            <p className="text-xs text-[#475569] font-medium truncate max-w-[280px] mt-0.5">
              Modification des accès de {displayName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isDeleting}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-[#071530] hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center font-bold text-lg"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            <span>{error}</span>
          </div>
        )}

        {/* SECTION CONFIRMATION DE SUPPRESSION */}
        {confirmDelete ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-fade-in">
            <div className="space-y-1">
              <p className="text-xs font-black text-rose-950 uppercase tracking-wider">
                Confirmation de suppression définitive
              </p>
              <p className="text-xs text-rose-800 font-medium leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>{displayName}</strong> ? Cette action est irréversible.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Nom complet / Identifiant */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                  Nom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-200 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] focus:outline-none transition-all font-semibold"
                />
              </div>

              {/* 2. Email professionnel */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                   Email 
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-200 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] focus:outline-none transition-all font-semibold"
                />
              </div>
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
                
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-200 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] focus:outline-none transition-all font-semibold"
              />
            </div>

            {/* 4. Mot de passe attribué (avec option Afficher / Masquer) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                  Mot de passe 
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-[#002B7F] hover:underline"
                >
                  {showPassword ? 'Masquer' : 'Afficher le mot de passe'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Laisser vide pour conserver le mot de passe actuel"
                  disabled={isSubmitting}
                  className="w-full px-4 pr-11 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-200 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none transition-all font-semibold"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* 5. Sélection du rôle sous forme de balise select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Rôle
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#F4F7FB] hover:bg-white focus:bg-white border border-slate-200 hover:border-[#B3D1FF] focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-[#071530] focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="demandeur">Demandeur</option>
                  <option value="technicien">Services Généraux</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {/* 6. État du compte : Actif / Désactivé */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                  Accès au compte 
                </label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-2xl text-xs sm:text-sm font-black focus:outline-none transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 focus:border-emerald-500'
                      : 'bg-rose-50/50 border-rose-300 text-rose-950 focus:border-rose-500'
                  }`}
                >
                  <option value="true"> Compte Actif</option>
                  <option value="false"> Compte Désactivé</option>
                </select>
              </div>
            </div>

            {/* Boutons d'action et suppression */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isSubmitting}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                >
                  Supprimer ce compte
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#FF5E00] hover:bg-[#E05200] text-white rounded-2xl text-xs font-black cursor-pointer transition-all shadow-md active:scale-95"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
