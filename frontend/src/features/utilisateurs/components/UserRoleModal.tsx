'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, UserRole } from '@/types/user';
import { ShieldCheck, AlertCircle, X, Check } from 'lucide-react';

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

  const roleLabels: Record<UserRole, string> = {
    demandeur: 'Demandeur',
    technicien: 'Technicien',
    admin: 'Administrateur',
  };

  const displayName = [user.prenom, user.nom].filter(Boolean).join(' ') || user.nom || user.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <Card className="w-full max-w-md bg-white border border-slate-200/90 shadow-2xl rounded-3xl p-6 space-y-6">
        
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Gérer l&apos;utilisateur</h3>
              <p className="text-[11px] text-slate-400 font-medium">{displayName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Sélection du rôle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Attribuer un rôle
            </label>

            <div className="space-y-2">
              {(['demandeur', 'technicien', 'admin'] as UserRole[]).map((roleKey) => {
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{roleLabels[roleKey]}</p>
                      <p className="text-[11px] text-slate-400">
                        {roleKey === 'demandeur' && 'Crée et consulte ses propres demandes'}
                        {roleKey === 'technicien' && 'Traite, assigne et résout les interventions'}
                        {roleKey === 'admin' && 'Supervise les utilisateurs et paramètres'}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* État du compte : Actif / Désactivé */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              État du compte
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✓ Compte Actif
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  !isActive
                    ? 'bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✕ Compte Désactivé
              </button>
            </div>
          </div>

          {/* Message de confirmation */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            Voulez-vous réellement attribuer le rôle <strong>{roleLabels[selectedRole]}</strong> à cet utilisateur ?
          </div>

          {/* Boutons d'action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Confirmer
            </Button>
          </div>

        </form>

      </Card>
    </div>
  );
}
