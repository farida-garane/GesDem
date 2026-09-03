'use client';

import React, { useState } from 'react';
import { CreateEscaladeDto, StatutEscalade } from '@/types/escalade';
import { escaladeService } from '@/services/escalade.service';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nomPrestataire, setNomPrestataire] = useState('');
  const [contactNom, setContactNom] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTelephone, setContactTelephone] = useState('');
  const [referenceExterne, setReferenceExterne] = useState('');
  const [motif, setMotif] = useState('');
  const [coutEstime, setCoutEstime] = useState<string>('');
  const [statut, setStatut] = useState<StatutEscalade>('en_cours_reparation');
  const [dateRetourPrevue, setDateRetourPrevue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomPrestataire.trim()) {
      setError('Veuillez renseigner le nom du prestataire ou du SAV.');
      return;
    }
    if (!motif.trim()) {
      setError('Veuillez préciser le motif de sous-traitance / délégation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateEscaladeDto = {
        demande: demandeId,
        nom_prestataire: nomPrestataire.trim(),
        contact_nom: contactNom.trim() || undefined,
        contact_email: contactEmail.trim() || undefined,
        contact_telephone: contactTelephone.trim() || undefined,
        reference_externe: referenceExterne.trim() || undefined,
        motif: motif.trim(),
        cout_estime: coutEstime ? parseFloat(coutEstime) : null,
        statut,
        date_envoi: new Date().toISOString(),
        date_retour_prevue: dateRetourPrevue ? new Date(dateRetourPrevue).toISOString() : undefined,
      };

      await escaladeService.createEscalade(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de l\'escalade.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071530]/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-100 shadow-[0_8px_32px_rgba(0,43,127,0.12)] p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* En-tête */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#002B7F]">
                Déléguer à un Prestataire / SAV Externe
              </h3>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-[#E8F1FF] text-[#002B7F]">
                {demandeRef}
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium mt-0.5">
              Enregistrez la prise en charge par un tiers (SAV Dell/HP, Opérateur Fibre, Mainteneur).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#071530] font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nom du Prestataire */}
          <div>
            <label className="block text-xs font-black text-[#071530] uppercase tracking-wider mb-1">
              Nom du Prestataire ou Service SAV *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: SAV Dell France, Orange Entreprise, Maintenance Canon..."
              value={nomPrestataire}
              onChange={(e) => setNomPrestataire(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all"
            />
          </div>

          {/* Référence externe & Statut initial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#071530] uppercase tracking-wider mb-1">
                N° Ticket externe / RMA
              </label>
              <input
                type="text"
                placeholder="Ex: RMA-DELL-98214"
                value={referenceExterne}
                onChange={(e) => setReferenceExterne(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#071530] uppercase tracking-wider mb-1">
                État initial
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as StatutEscalade)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all cursor-pointer"
              >
                <option value="en_cours_reparation">En cours de réparation / SAV</option>
                <option value="en_attente_devis">En attente de devis</option>
                <option value="en_attente_livraison">En attente de pièces / livraison</option>
              </select>
            </div>
          </div>

          {/* Motif de la sous-traitance */}
          <div>
            <label className="block text-xs font-black text-[#071530] uppercase tracking-wider mb-1">
              Motif & Diagnostic transmis au tiers *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ex: Carte mère défectueuse nécessitant remplacement sous garantie constructeur. Matériel expédié par coursier."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Contact (Nom, Email, Téléphone) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                Nom Interlocuteur
              </label>
              <input
                type="text"
                placeholder="Ex: M. Martin"
                value={contactNom}
                onChange={(e) => setContactNom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                Email SAV
              </label>
              <input
                type="email"
                placeholder="sav@support.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="Ex: 01 23 45 67 89"
                value={contactTelephone}
                onChange={(e) => setContactTelephone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Coût estimé & Date retour prévisionnelle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                Coût estimé / Devis (Optionnel)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Montant chiffré"
                value={coutEstime}
                onChange={(e) => setCoutEstime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                Date de retour prévue
              </label>
              <input
                type="date"
                value={dateRetourPrevue}
                onChange={(e) => setDateRetourPrevue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#071530] font-semibold focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071530] text-xs font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la délégation'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
