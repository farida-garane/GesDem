'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, UserRole } from '@/types/user';
import { X, Loader2 } from 'lucide-react';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: number, newRole: UserRole, isActive: boolean) => Promise<void>;
}

export function UserRoleModal({ isOpen, onClose, user, onConfirm }: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'demandeur');
  const [isActive, setIsActive] = useState<boolean>(user?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when user changes
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setIsActive(user.is_active ?? true);
      setError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(user.id, selectedRole, isActive);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rôle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleConfig: Record<UserRole, { label: string; desc: string }> = {
    demandeur: {
      label: 'Collaborateur / Demandeur',
      desc: 'Peut créer et suivre ses demandes de matériel, RH, etc.',
    },
    technicien: {
      label: 'Intervenant / Gestionnaire (RH, Logistique, Support)',
      desc: 'Peut prendre en charge, instruire et résoudre les dossiers.',
    },
    admin: {
      label: 'Administrateur / Direction',
      desc: 'Supervise toute la plateforme, les statistiques et gère les rôles.',
    },
  };

  const displayName = [user.prenom, user.nom].filter(Boolean).join(' ') || user.nom || user.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] shadow-sm rounded-2xl p-6 sm:p-7 space-y-5">
        
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
          <div>
            <h3 className="text-sm font-bold text-[#0a1e42]">Gérer l&apos;utilisateur</h3>
            <p className="text-[11px] text-[#475569] font-medium truncate max-w-[200px]">{displayName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-[#475569] hover:text-[#0a1e42] hover:bg-[#f8fafc] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sélection du rôle */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              Attribuer un rôle
            </label>

            <div className="space-y-2">
              {(['demandeur', 'technicien', 'admin'] as UserRole[]).map((roleKey) => {
                const isSelected = selectedRole === roleKey;
                const config = roleConfig[roleKey];
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#c7dcfe] bg-[#eef4ff]'
                        : 'border-[#e2e8f0] hover:border-[#0b3b8f] bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#0b3b8f]' : 'text-[#0a1e42]'}`}>{config.label}</p>
                      <p className="text-[11px] text-[#475569] font-medium leading-relaxed">
                        {config.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-[#002B7F] font-bold text-xs">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* État du compte : Actif / Désactivé */}
          <div className="space-y-2 pt-2 border-t border-[#e2e8f0]">
            <label className="block text-xs font-bold text-[#0a1e42] uppercase tracking-wider">
              État du compte
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569] hover:bg-slate-200'
                }`}
              >
                ✓ Compte Actif
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  !isActive
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569] hover:bg-slate-200'
                }`}
              >
                ✕ Compte Désactivé
              </button>
            </div>
          </div>

          {/* Message de confirmation */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#0a1e42] leading-relaxed font-medium">
            Voulez-vous attribuer le rôle <strong>{roleConfig[selectedRole].label}</strong> à cet utilisateur ?
          </div>

          {/* Boutons d'action */}
          <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2.5">
            {/* Bouton secondaire */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-bold text-[#0a1e42] hover:border-[#0b3b8f] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            {/* Action principale unique */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#f26522] hover:bg-[#d94f0f] active:scale-98 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Enregistrer les modifications</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
