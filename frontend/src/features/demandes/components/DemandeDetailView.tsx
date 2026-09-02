'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { demandeService } from '@/services/demande.service';
import { Demande, HistoriqueStatut, Commentaire, UrgenceLevel } from '@/types/demande';
import {
  ArrowLeft,
  Calendar,
  User,
  Paperclip,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  History,
  MessageSquare,
  Check,
  Star,
  Pencil,
  XCircle,
  Download,
  ExternalLink,
  Trash2,
  X,
  Sparkles,
  Info
} from 'lucide-react';

interface DemandeDetailViewProps {
  demandeId: string | number;
}

export function DemandeDetailView({ demandeId }: DemandeDetailViewProps) {
  const [demande, setDemande] = useState<Demande | null>(null);
  const [historique, setHistorique] = useState<HistoriqueStatut[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // New Comment
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Evaluation State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [avisComment, setAvisComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Modals (Annulation & Modification)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelMotif, setCancelMotif] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editObjet, setEditObjet] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUrgence, setEditUrgence] = useState<UrgenceLevel>('moyen');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [demandeData, historiqueData, commentairesData] = await Promise.all([
        demandeService.getDemandeById(demandeId),
        demandeService.getDemandeHistorique(demandeId),
        demandeService.getCommentaires(demandeId),
      ]);

      setDemande(demandeData);
      setHistorique(historiqueData);
      setCommentaires(commentairesData);

      if (demandeData) {
        setEditObjet(demandeData.objet);
        setEditDescription(demandeData.description);
        setEditUrgence(demandeData.urgence);
        if (demandeData.note_satisfaction) {
          setRating(demandeData.note_satisfaction);
        }
        if (demandeData.avis_satisfaction) {
          setAvisComment(demandeData.avis_satisfaction);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la demande.');
    } finally {
      setLoading(false);
    }
  }, [demandeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Envoi d'un commentaire
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim() || !demande) return;

    setSendingComment(true);
    try {
      const added = await demandeService.createCommentaire(demande.id, nouveauCommentaire.trim());
      setCommentaires((prev) => [...prev, added]);
      setNouveauCommentaire('');
      showToast('Commentaire publié avec succès !', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'envoi", 'error');
    } finally {
      setSendingComment(false);
    }
  };

  // Annulation de la demande
  const handleConfirmCancel = async () => {
    if (!demande) return;
    setIsCancelling(true);
    try {
      await demandeService.annulerDemande(demande.id, cancelMotif.trim());
      setIsCancelModalOpen(false);
      showToast('Votre demande a bien été annulée.', 'info');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'annulation", 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Modification de la demande
  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demande || !editObjet.trim() || !editDescription.trim()) return;

    setIsUpdating(true);
    try {
      await demandeService.updateDemande(demande.id, {
        objet: editObjet.trim(),
        description: editDescription.trim(),
        urgence: editUrgence,
        piece_jointe: editFile,
      });
      setIsEditModalOpen(false);
      showToast('Votre demande a été mise à jour !', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la modification', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Soumission de l'évaluation de satisfaction
  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demande) return;

    setIsSubmittingRating(true);
    try {
      const updated = await demandeService.evaluerDemande(demande.id, rating, avisComment.trim());
      setDemande((prev) => (prev ? { ...prev, note_satisfaction: rating, avis_satisfaction: avisComment.trim() } : updated));
      showToast('Merci pour votre retour d\'expérience !', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de votre avis', 'error');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold">Chargement du dossier de la demande...</p>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-900">Demande introuvable</p>
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à mes demandes</span>
        </Link>
      </div>
    );
  }

  const statutLibelle = demande.statut_details?.libelle || 'En attente';
  const statutCouleur = demande.statut_details?.couleur || '#64748b';
  const isResolueOrCloturee = statutLibelle.toLowerCase().includes('resolu') || statutLibelle.toLowerCase().includes('cloture') || demande.statut === 4 || demande.statut === 5;
  const isPending = !demande.technicien && (demande.statut === 1 || statutLibelle.toLowerCase().includes('attente'));

  // Calcul des étapes du traitement
  const steps = [
    { label: 'Demande créée', completed: true },
    { label: 'Demande assignée', completed: Boolean(demande.technicien) || demande.statut! >= 2 },
    { label: 'Intervention en cours', completed: demande.statut! >= 3, current: demande.statut === 3 },
    { label: 'Résolue', completed: demande.statut! >= 4, current: demande.statut === 4 },
    { label: 'Clôturée', completed: demande.statut === 5, current: demande.statut === 5 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16 relative">
      
      {/* TOAST FLOTTANT DE NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-blue-900 text-white border-blue-700'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Info className="w-4 h-4 text-blue-400" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. EN-TÊTE DE NAVIGATION & ACTIONS */}
      <div className="space-y-3">
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-300 shadow-2xs">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Retour aux demandes</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50/90 px-3 py-0.5 rounded-lg border border-blue-200/60">
                {demande.reference || `DEM-0${demande.id}`}
              </span>
              <PriorityBadge urgence={demande.urgence} />
              <span
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-xs font-bold border shadow-2xs"
                style={{
                  backgroundColor: `${statutCouleur}15`,
                  color: statutCouleur,
                  borderColor: `${statutCouleur}40`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: statutCouleur }}
                />
                {statutLibelle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
              {demande.objet}
            </h1>
          </div>

          {/* Boutons d'Action Rapides (Modification / Annulation si en attente) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isPending && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Annuler</span>
                </button>
              </>
            )}

            <div className="text-left sm:text-right text-xs text-slate-500 font-medium">
              <p>Créée le {formatDate(demande.date_creation)}</p>
              {demande.date_cloture && (
                <p className="text-emerald-700 font-bold mt-0.5">
                  Clôturée le {formatDate(demande.date_cloture)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROGRESSION DU TRAITEMENT (STEPPER) */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xs">
        <p className="text-xs font-black uppercase tracking-wider text-slate-800">
          Progression du traitement
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {steps.map((step, idx) => {
            const isDone = step.completed;
            const isCurrent = step.current;

            return (
              <div
                key={step.label}
                className={`flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950 font-semibold'
                    : 'border-slate-200/80 bg-slate-50/60 text-slate-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                </div>

                <div className="overflow-hidden">
                  <p className={`text-xs truncate ${isCurrent ? 'text-blue-950 font-extrabold' : isDone ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isCurrent ? 'En cours' : isDone ? 'Validé' : 'À venir'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BLOC ENCADRÉ SPÉCIAL : RÉSOLUTION & ÉVALUATION DE SATISFACTION */}
      {isResolueOrCloturee && (
        <div className="space-y-4">
          
          {/* Note de Résolution */}
          <div className="p-6 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 border border-emerald-200/80 shadow-xs rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-950 border-b border-emerald-100 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.2]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider">
                Dossier de Résolution
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Technicien ayant traité</p>
                <p className="text-slate-900 font-extrabold mt-0.5">
                  {demande.technicien?.nom || 'Équipe Technique Support'}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Date de résolution</p>
                <p className="text-slate-900 font-extrabold mt-0.5">
                  {demande.date_cloture ? formatDate(demande.date_cloture) : 'Récemment résolue'}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Statut final</p>
                <span className="inline-block text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg font-extrabold mt-0.5">
                  {statutLibelle}
                </span>
              </div>
            </div>

            {demande.note_resolution && (
              <div className="pt-2">
                <p className="text-slate-600 font-bold text-xs mb-1">Note de résolution du technicien :</p>
                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 text-xs text-slate-800 font-medium leading-relaxed">
                  « {demande.note_resolution} »
                </div>
              </div>
            )}
          </div>

          {/* Module d'Évaluation / Satisfaction ⭐⭐⭐⭐⭐ */}
          <div className="p-6 bg-white border border-amber-200 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500 stroke-[1.5]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Votre Évaluation &amp; Avis de Satisfaction
                </h3>
              </div>

              {demande.note_satisfaction && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs border border-amber-300 flex items-center gap-1">
                  <span>Note enregistrée : {demande.note_satisfaction}/5</span>
                </span>
              )}
            </div>

            {demande.note_satisfaction ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= demande.note_satisfaction!
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-extrabold text-slate-800">
                    {demande.note_satisfaction} sur 5
                  </span>
                </div>
                {demande.avis_satisfaction && (
                  <p className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    « {demande.avis_satisfaction} »
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitEvaluation} className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">
                  L&apos;intervention est terminée. Comment évaluez-vous la rapidité et l&apos;efficacité du support technique ?
                </p>

                {/* Sélecteur d'étoiles interactif */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-slate-200 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    ({rating}/5 étoiles)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Votre commentaire (facultatif)
                  </label>
                  <textarea
                    rows={2}
                    value={avisComment}
                    onChange={(e) => setAvisComment(e.target.value)}
                    placeholder="Ex: Technicien très réactif et problème résolu en moins de 10 minutes..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingRating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Valider mon avis</span>
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* 4. INFORMATIONS DE LA DEMANDE (CARTES ORGANISÉES) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Description & Contenu technique (2 colonnes) */}
        <div className="lg:col-span-2 p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 stroke-[2.2]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Détail du problème
              </h2>
            </div>
            {demande.categorie_details && (
              <span className="text-xs font-bold px-3 py-0.5 rounded-lg bg-slate-100/90 text-slate-800 border border-slate-200">
                {demande.categorie_details.libelle}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Description transmise
            </p>
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
              {demande.description}
            </div>
          </div>

          {/* Pièce jointe avec téléchargement et ouverture */}
          {demande.piece_jointe && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pièce jointe / Capture
              </p>
              <div className="inline-flex items-center gap-4 p-3.5 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Paperclip className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-extrabold text-slate-900 truncate max-w-xs">
                    {demande.piece_jointe.split('/').pop()}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={demande.piece_jointe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ouvrir l&apos;aperçu</span>
                    </a>
                    <a
                      href={demande.piece_jointe}
                      download
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-800 hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      <span>Télécharger</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contacts & Responsables (1 colonne) */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-6 shadow-xs">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Intervenants &amp; Contacts
            </h2>
          </div>

          {/* Demandeur */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Demandeur</p>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {demande.demandeur.nom || demande.demandeur.email}
                </p>
                {demande.demandeur.departement && (
                  <p className="text-[11px] text-slate-500 font-medium truncate">{demande.demandeur.departement}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technicien assigné */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Technicien assigné</p>
            {demande.technicien ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-extrabold text-slate-900 truncate">
                    {demande.technicien.nom || demande.technicien.email}
                  </p>
                  <p className="text-[11px] text-orange-600 font-bold">En charge du ticket</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                En attente d&apos;attribution à un technicien.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. HISTORIQUE & COMMENTAIRES / ÉCHANGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIMELINE DE L'HISTORIQUE */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-blue-600 stroke-[2.2]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Historique de la demande
            </h2>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
            {historique.map((item, idx) => (
              <div key={item.id || idx} className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-900">
                    Statut : <span className="text-blue-700">{item.nouveau_statut?.libelle || 'Enregistré'}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {formatDateTime(item.date_changement)}
                    {item.modifie_par && ` · par ${item.modifie_par.nom || item.modifie_par.email}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FIL DE DISCUSSION / COMMENTAIRES */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Commentaires &amp; Échanges
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {commentaires.length} message{commentaires.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {commentaires.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  Aucun message pour le moment. Vous pouvez poser une question ci-dessous.
                </div>
              ) : (
                commentaires.map((com) => {
                  const isTech = com.auteur_details?.role === 'technicien';

                  return (
                    <div
                      key={com.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        isTech
                          ? 'bg-blue-50/60 border-blue-200/70 text-slate-900'
                          : 'bg-slate-50/80 border-slate-200/80 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-slate-900">{com.auteur_details?.nom || `Utilisateur #${com.auteur}`}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-extrabold ${
                              isTech
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {isTech ? 'Technicien' : 'Demandeur'}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px] font-medium">
                          {formatDateTime(com.date_creation)}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                        {com.contenu}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Formulaire d'envoi de commentaire */}
          <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Écrire un message pour le support technique..."
              value={nouveauCommentaire}
              onChange={(e) => setNouveauCommentaire(e.target.value)}
              disabled={sendingComment}
              className="flex-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!nouveauCommentaire.trim() || sendingComment}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition-all active:scale-95"
            >
              {sendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

      </div>

      {/* ========================================================
          MODAL D'ANNULATION DE LA DEMANDE
          ======================================================== */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Annuler cette demande ?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Cette action fermera définitivement le ticket #{demande.id}. Le support technique ne prendra plus en charge cette demande.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase">
                Motif de l&apos;annulation (facultatif)
              </label>
              <textarea
                rows={2}
                value={cancelMotif}
                onChange={(e) => setCancelMotif(e.target.value)}
                placeholder="Ex: Problème résolu par moi-même, fausse manipulation..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Garder la demande
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmer l&apos;annulation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE MODIFICATION DE LA DEMANDE
          ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleConfirmEdit} className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">Modifier ma demande</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Objet de la demande</label>
                <input
                  type="text"
                  value={editObjet}
                  onChange={(e) => setEditObjet(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Niveau d&apos;urgence</label>
                <select
                  value={editUrgence}
                  onChange={(e) => setEditUrgence(e.target.value as UrgenceLevel)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="faible">Faible (Pas de blocage)</option>
                  <option value="moyen">Moyenne (Gênant pour le travail)</option>
                  <option value="eleve">Élevée (Arrêt complet de l&apos;activité)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description détaillée</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Remplacer la pièce jointe (optionnel)</label>
                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 flex items-center gap-1.5"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
