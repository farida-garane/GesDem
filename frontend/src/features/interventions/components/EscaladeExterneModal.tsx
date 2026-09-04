'use client';

import React, { useState } from 'react';
import { CreateEscaladeDto } from '@/types/escalade';
import { escaladeService } from '@/services/escalade.service';
import { useAuth } from '@/context/AuthContext';

interface EscaladeExterneModalProps {
  isOpen: boolean;
  onClose: () => void;
  demandeId: number;
  demandeRef: string;
  onSuccess: () => void;
}

export function EscaladeExterneModal({
  isOpen,
  onClose,
  demandeId,
  demandeRef,
  onSuccess,
}: EscaladeExterneModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Informations Prestataire
  const [nomPrestataire, setNomPrestataire] = useState('');
  const [prenomContact, setPrenomContact] = useState('');
  const [nomContact, setNomContact] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTelephone, setContactTelephone] = useState('');

  // 2. Modalités
  const [motif, setMotif] = useState('');
  const [coutEstime, setCoutEstime] = useState<string>('');
  const [dateRetourPrevue, setDateRetourPrevue] = useState('');

  // 3. Intervenant Services Généraux délégataire
  const [nomServiceGeneral, setNomServiceGeneral] = useState(user?.nom || user?.username || '');
  const [emailServiceGeneral, setEmailServiceGeneral] = useState(user?.email || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomPrestataire.trim()) {
      setError('Veuillez renseigner le nom du prestataire.');
      return;
    }
    if (!motif.trim()) {
      setError('Veuillez préciser le motif de la délégation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contactComplet = [prenomContact.trim(), nomContact.trim()].filter(Boolean).join(' ');

      const payload: CreateEscaladeDto = {
        demande: demandeId,
        nom_prestataire: nomPrestataire.trim(),
        contact_nom: contactComplet || undefined,
        contact_email: contactEmail.trim() || undefined,
        contact_telephone: contactTelephone.trim() || undefined,
        motif: motif.trim(),
        cout_estime: coutEstime ? parseFloat(coutEstime) : null,
        statut: 'en_cours_reparation',
        date_envoi: new Date().toISOString(),
        date_retour_prevue: dateRetourPrevue ? new Date(dateRetourPrevue).toISOString() : undefined,
      };

      await escaladeService.createEscalade(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de la délégation.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071530]/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-100 shadow-[0_8px_32px_rgba(0,43,127,0.12)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* En-tête épuré */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-[#002B7F]">
                Déléguer à un Prestataire
              </h3>
              <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
                {demandeRef}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1">
              Enregistrez la prise en charge et le suivi par un intervenant extérieur.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#071530] font-black text-base flex items-center justify-center transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1 : INFORMATIONS DU PRESTATAIRE */}
          <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-slate-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
              1. Informations du Prestataire
            </h4>

            {/* Nom du Prestataire */}
            <div>
              <label className="block text-xs font-black text-[#071530] uppercase tracking-wider mb-1.5">
                Nom du prestataire *
              </label>
              <input
                type="text"
                required
                placeholder="Ex : Dell France, Maintenance Climatisation, Orange..."
                value={nomPrestataire}
                onChange={(e) => setNomPrestataire(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] transition-all"
              />
            </div>

            {/* Prénom et Nom du contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">
                  Prénom du contact
                </label>
                <input
                  type="text"
                  placeholder="Ex : Jean"
                  value={prenomContact}
                  onChange={(e) => setPrenomContact(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">
                  Nom du contact
                </label>
                <input
                  type="text"
                  placeholder="Ex : Dupont"
                  value={nomContact}
                  onChange={(e) => setNomContact(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] transition-all"
                />
              </div>
            </div>

            {/* Email & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">
                  Email du prestataire
                </label>
                <input
                  type="email"
                  placeholder="contact@prestataire.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">
                  Téléphone du prestataire
                </label>
                <input
                  type="tel"
                  placeholder="Ex : 01 23 45 67 89"
                  value={contactTelephone}
                  onChange={(e) => setContactTelephone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 : MODALITÉS (COÛT, DATE, MOTIF) */}
          <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-slate-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
              2. Modalités de la Délégation
            </h4>

            {/* Motif */}
            <div>
              <label className="block text-xs font-black text-[#071530] uppercase tracking-wider mb-1.5">
                Motif &amp; Détail de la tâche déléguée *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex : Réparation carte mère sous garantie ou diagnostic spécialisé..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Coût estimé */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                Coût estimé (Devis)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex : 50000"
                value={coutEstime}
                onChange={(e) => setCoutEstime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] transition-all"
              />
            </div>
          </div>

          {/* SECTION 3 : INTERVENANT SERVICES GÉNÉRAUX QUI DÉLÈGUE */}
          <div className="p-5 rounded-2xl bg-[#E8F1FF] border border-[#B3D1FF] space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
              3. Services Généraux (Agent délégataire)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#002B7F] mb-1">
                  Nom de l&apos;intervenant (Services Généraux)
                </label>
                <input
                  type="text"
                  value={nomServiceGeneral}
                  onChange={(e) => setNomServiceGeneral(e.target.value)}
                  placeholder="Nom de l'agent"
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-bold focus:outline-none focus:border-[#002B7F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002B7F] mb-1">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={emailServiceGeneral}
                  onChange={(e) => setEmailServiceGeneral(e.target.value)}
                  placeholder="email@services-generaux.com"
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-2xl text-xs sm:text-sm text-[#071530] font-bold focus:outline-none focus:border-[#002B7F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#071530] text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la délégation'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

