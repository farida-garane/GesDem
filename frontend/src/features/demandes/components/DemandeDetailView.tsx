'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { demandeService } from '@/services/demande.service';
import { Demande, HistoriqueStatut, Commentaire } from '@/types/demande';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Building2,
  Paperclip,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  History,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Check
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

  // New Comment
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la demande.');
    } finally {
      setLoading(false);
    }
  }, [demandeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim() || !demande) return;

    setSendingComment(true);
    try {
      const added = await demandeService.createCommentaire(demande.id, nouveauCommentaire.trim());
      setCommentaires((prev) => [...prev, added]);
      setNouveauCommentaire('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setSendingComment(false);
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
        month: 'long',
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
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
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

  // Calcul des étapes du traitement
  const steps = [
    { label: 'Demande créée', completed: true },
    { label: 'Demande assignée', completed: Boolean(demande.technicien) || demande.statut! >= 2 },
    { label: 'Intervention en cours', completed: demande.statut! >= 3, current: demande.statut === 3 },
    { label: 'Résolue', completed: demande.statut! >= 4, current: demande.statut === 4 },
    { label: 'Clôturée', completed: demande.statut === 5, current: demande.statut === 5 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. EN-TÊTE DU DOSSIER */}
      <div className="space-y-3">
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 shadow-2xs">
            <ArrowLeft className="w-3 h-3" />
          </div>
          <span>Retour à mes demandes</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                #{demande.reference || `DEM-0${demande.id}`}
              </span>
              <PriorityBadge urgence={demande.urgence} />
              <span
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-xs font-bold border shadow-2xs"
                style={{
                  backgroundColor: `${statutCouleur}15`,
                  color: statutCouleur,
                  borderColor: `${statutCouleur}30`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statutCouleur }}
                />
                {statutLibelle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
              {demande.objet}
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <p>Créée le {formatDate(demande.date_creation)}</p>
            {demande.date_cloture && (
              <p className="text-emerald-600 font-semibold mt-0.5">
                Clôturée le {formatDate(demande.date_cloture)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. PROGRESSION DU TRAITEMENT (STEPPER) */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
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
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>

                <div className="overflow-hidden">
                  <p className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-950 font-extrabold' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isCurrent ? 'En cours' : isDone ? 'Validé' : 'À venir'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. BLOC ENCADRÉ SPÉCIAL : RÉSOLUTION (Si résolue ou clôturée) */}
      {isResolueOrCloturee && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-200 shadow-xs rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 border-b border-emerald-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">
              Dossier de Résolution
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Technicien ayant traité</p>
              <p className="text-slate-900 font-bold mt-0.5">
                {demande.technicien?.nom || 'Équipe Technique Support'}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Date de résolution</p>
              <p className="text-slate-900 font-bold mt-0.5">
                {demande.date_cloture ? formatDate(demande.date_cloture) : 'Récemment résolue'}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Statut final</p>
              <span className="inline-block text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold mt-0.5">
                {statutLibelle}
              </span>
            </div>
          </div>

          {demande.note_resolution && (
            <div className="pt-2">
              <p className="text-slate-500 font-semibold text-xs mb-1">Note de résolution du technicien :</p>
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/80 text-xs text-slate-800 font-medium leading-relaxed">
                « {demande.note_resolution} »
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 4. INFORMATIONS DE LA DEMANDE (CARTES ORGANISÉES) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Description & Contenu technique (2 colonnes) */}
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Détail du problème
              </h2>
            </div>
            {demande.categorie_details && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {demande.categorie_details.libelle}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Description transmise
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {demande.description}
            </div>
          </div>

          {/* Pièce jointe */}
          {demande.piece_jointe && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pièce jointe / Capture
              </p>
              <div className="inline-flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {demande.piece_jointe.split('/').pop()}
                  </p>
                  <a
                    href={demande.piece_jointe}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                  >
                    Télécharger la pièce jointe
                  </a>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Contacts & Responsables (1 colonne) */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Intervenants & Contacts
            </h2>
          </div>

          {/* Demandeur */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Demandeur</p>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {demande.demandeur.nom || demande.demandeur.email}
                </p>
                {demande.demandeur.departement && (
                  <p className="text-[11px] text-slate-500 truncate">{demande.demandeur.departement}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technicien assigné */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Technicien assigné</p>
            {demande.technicien ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {demande.technicien.nom || demande.technicien.email}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">En charge du ticket</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800">
                En attente d&apos;attribution à un technicien.
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* 5. HISTORIQUE & COMMENTAIRES / ÉCHANGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIMELINE DE L'HISTORIQUE */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Historique de la demande
            </h2>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {historique.map((item, idx) => (
              <div key={item.id || idx} className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-slate-900 shadow-xs" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">
                    Statut : <span className="text-indigo-600">{item.nouveau_statut?.libelle || 'Enregistré'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDateTime(item.date_changement)}
                    {item.modifie_par && ` · par ${item.modifie_par.nom || item.modifie_par.email}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FIL DE DISCUSSION / COMMENTAIRES */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Commentaires & Échanges ({commentaires.length})
              </h2>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {commentaires.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
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
                          ? 'bg-indigo-50/60 border-indigo-100 text-slate-900'
                          : 'bg-slate-50 border-slate-200/70 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{com.auteur_details?.nom || `Utilisateur #${com.auteur}`}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-extrabold ${
                              isTech
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isTech ? 'Technicien' : 'Demandeur'}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {formatDateTime(com.date_creation)}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
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
              placeholder="Écrire un commentaire pour le technicien..."
              value={nouveauCommentaire}
              onChange={(e) => setNouveauCommentaire(e.target.value)}
              disabled={sendingComment}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
            <Button
              type="submit"
              disabled={!nouveauCommentaire.trim() || sendingComment}
              isLoading={sendingComment}
              className="bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </Card>

      </div>

    </div>
  );
}
