'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useAuth } from '@/context/AuthContext';
import { demandeService } from '@/services/demande.service';
import { Demande, Statut, HistoriqueStatut, Commentaire } from '@/types/demande';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Building2,
  Paperclip,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  History,
  MessageSquare,
  Wrench,
  Check
} from 'lucide-react';

interface InterventionDetailProps {
  demandeId: string | number;
}

export function InterventionDetail({ demandeId }: InterventionDetailProps) {
  const { user } = useAuth();

  const [demande, setDemande] = useState<Demande | null>(null);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [historique, setHistorique] = useState<HistoriqueStatut[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update state
  const [updatingStatut, setUpdatingStatut] = useState(false);
  const [assigningSelf, setAssigningSelf] = useState(false);

  // New Comment state
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Load all details
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [demandeData, statutsData, historiqueData, commentairesData] = await Promise.all([
        demandeService.getDemandeById(demandeId),
        demandeService.getStatuts(),
        demandeService.getDemandeHistorique(demandeId),
        demandeService.getCommentaires(demandeId),
      ]);

      setDemande(demandeData);
      setStatuts(statutsData);
      setHistorique(historiqueData);
      setCommentaires(commentairesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [demandeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle status change
  const handleStatutChange = async (nouveauStatutId: number) => {
    if (!demande || demande.statut === nouveauStatutId) return;
    setUpdatingStatut(true);
    try {
      await demandeService.updateDemandeStatut(demande.id, { statut: nouveauStatutId });
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    } finally {
      setUpdatingStatut(false);
    }
  };

  // Handle self-assignment
  const handleAssignToMe = async () => {
    if (!demande || !user) return;
    setAssigningSelf(true);
    try {
      await demandeService.updateDemandeStatut(demande.id, { technicien: user.id });
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'assignation");
    } finally {
      setAssigningSelf(false);
    }
  };

  // Handle fast close
  const handleCloseDemande = async () => {
    if (!demande) return;
    const statutTermine = statuts.find(
      (s) => s.libelle.toLowerCase().includes('termine') || s.libelle.toLowerCase().includes('cloture') || s.ordre === 4
    );
    if (statutTermine) {
      handleStatutChange(statutTermine.id);
    }
  };

  // Handle send comment
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim() || !demande) return;

    setSendingComment(true);
    try {
      await demandeService.createCommentaire(demande.id, nouveauCommentaire.trim());
      setNouveauCommentaire('');
      const updatedComments = await demandeService.getCommentaires(demande.id);
      setCommentaires(updatedComments);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'envoi du message");
    } finally {
      setSendingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
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
        <p className="text-xs font-semibold">Chargement du dossier d&apos;intervention...</p>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Impossible de charger l&apos;intervention</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Demande introuvable.'}</p>
        </div>
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à la liste</span>
        </Link>
      </div>
    );
  }

  const statutCouleur = demande.statut_details?.couleur || '#64748b';
  const statutLibelle = demande.statut_details?.libelle || 'En attente';
  const isTermine = statutLibelle.toLowerCase().includes('termine') || statutLibelle.toLowerCase().includes('cloture');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* En-tête de navigation */}
      <div className="space-y-3">
        <Link
          href="/interventions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 shadow-2xs">
            <ArrowLeft className="w-3 h-3" />
          </div>
          <span>Retour aux interventions</span>
        </Link>

        {/* Titre & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {demande.reference || `DEM-${String(demande.id).padStart(4, '0')}`}
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
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statutCouleur }}
                />
                {statutLibelle}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight pt-1">
              {demande.objet}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-400 hidden sm:block">
            <p>Créée le {formatDate(demande.date_creation)}</p>
            {demande.date_cloture && (
              <p className="text-emerald-600 font-semibold mt-0.5">
                Clôturée le {formatDate(demande.date_cloture)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grille 2 Colonnes : Haut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOC 1 : Dossier technique & Demandeur (2 colonnes) */}
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Dossier Technique & Description
              </h2>
            </div>
            {demande.categorie_details && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {demande.categorie_details.libelle}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Description du problème
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
              {demande.description}
            </div>
          </div>

          {/* Pièce jointe */}
          {demande.piece_jointe && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pièce jointe fournie
              </p>
              <div className="inline-flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {demande.piece_jointe.split('/').pop()}
                  </p>
                  <a
                    href={demande.piece_jointe}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                  >
                    Ouvrir / Télécharger le fichier
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Informations demandeur */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[10px] uppercase font-bold text-slate-400">Demandeur</p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {demande.demandeur.nom || demande.demandeur.email}
                </p>
              </div>
            </div>

            {demande.demandeur.departement && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Département</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{demande.demandeur.departement}</p>
                </div>
              </div>
            )}

            {demande.demandeur.telephone && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Contact</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{demande.demandeur.telephone}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* BLOC 2 : Contrôle Intervention (Technicien & Statuts) (1 colonne) */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Wrench className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Contrôle de l&apos;Intervention
              </h2>
            </div>

            {/* Technicien assigné */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Technicien assigné
              </p>
              {demande.technicien ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {demande.technicien.nom || demande.technicien.email}
                    </p>
                    <p className="text-[10px] text-slate-400">Technicien en charge</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Aucun technicien assigné pour le moment.</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAssignToMe}
                    isLoading={assigningSelf}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold py-2"
                  >
                    M&apos;assigner ce ticket
                  </Button>
                </div>
              )}
            </div>

            {/* Changement de statut */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Changer l&apos;état du ticket
              </p>
              <div className="grid grid-cols-2 gap-2">
                {statuts.map((s) => {
                  const isActive = demande.statut === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={updatingStatut || isActive}
                      onClick={() => handleStatutChange(s.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{s.libelle}</span>
                      {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action rapide : Clôturer */}
          {!isTermine && (
            <div className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                onClick={handleCloseDemande}
                isLoading={updatingStatut}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold py-2.5 shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marquer comme Résolue</span>
              </Button>
            </div>
          )}
        </Card>

      </div>

      {/* Grille 2 Colonnes : Bas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BLOC 3 : Timeline & Historique des étapes */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Timeline & Historique des étapes
            </h2>
          </div>

          {historique.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              Aucun changement de statut enregistré pour le moment.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {historique.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  {/* Point sur la timeline */}
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-slate-900 shadow-xs" />
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      Statut passé à :{' '}
                      <span className="text-indigo-600">
                        {item.nouveau_statut?.libelle || 'Inconnu'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.date_changement)}</span>
                      {item.modifie_par && (
                        <span>• par {item.modifie_par.nom || item.modifie_par.email}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* BLOC 4 : Journal d'échange & Commentaires */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Journal de suivi & Échanges ({commentaires.length})
              </h2>
            </div>

            {/* Fil des messages */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {commentaires.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  Aucun message ou compte-rendu pour le moment.
                </div>
              ) : (
                commentaires.map((com) => {
                  const isAuthorTech = com.auteur_details?.role === 'technicien';
                  return (
                    <div
                      key={com.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        isAuthorTech
                          ? 'bg-indigo-50/50 border-indigo-100 text-slate-900'
                          : 'bg-slate-50 border-slate-200/70 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{com.auteur_details?.nom || `Utilisateur #${com.auteur}`}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-extrabold ${
                              isAuthorTech
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {com.auteur_details?.role || 'Membre'}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {formatDate(com.date_creation)}
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

          {/* Formulaire d'envoi de message */}
          <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Écrire un message ou une note..."
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
