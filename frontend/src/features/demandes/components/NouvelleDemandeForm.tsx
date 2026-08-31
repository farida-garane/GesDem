'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { demandeService } from '@/services/demande.service';
import { Categorie, UrgenceLevel } from '@/types/demande';
import { 
  AlertCircle, 
  CheckCircle2, 
  Paperclip, 
  FileText, 
  X, 
  ArrowLeft,
  Shield,
  Zap,
  Flame,
  Send,
  Eye,
  Pencil
} from 'lucide-react';

export function NouvelleDemandeForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [objet, setObjet] = useState('');
  const [categorieId, setCategorieId] = useState<string>('');
  const [autreCategoriePrecision, setAutreCategoriePrecision] = useState('');
  const [urgence, setUrgence] = useState<UrgenceLevel>('moyen');
  const [description, setDescription] = useState('');
  const [pieceJointe, setPieceJointe] = useState<File | null>(null);

  // Validation & UI States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRecap, setShowRecap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const data = await demandeService.getCategories();
        setCategories(data);
      } catch {
        setCategories([
          { id: 1, libelle: 'Matériel (Ordinateur, écran, imprimante)' },
          { id: 2, libelle: 'Logiciel (Applications, messagerie, licences)' },
          { id: 3, libelle: 'Réseau & Connexion (Wi-Fi, VPN, Internet)' },
          { id: 4, libelle: 'Assistance informatique (Mot de passe, droits)' },
          { id: 5, libelle: 'Logistique & Mobilier (Déplacement de poste)' },
          { id: 99, libelle: 'Autre (Problème non listé)' },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const isAutreSelected = () => {
    const selected = categories.find((c) => String(c.id) === String(categorieId));
    return selected?.libelle.toLowerCase().includes('autre') || categorieId === '99';
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!objet.trim()) {
      newErrors.objet = "Veuillez préciser l'objet de votre demande.";
    } else if (objet.length < 5) {
      newErrors.objet = "L'objet doit comporter au moins 5 caractères.";
    }

    if (!categorieId) {
      newErrors.categorie = "Veuillez sélectionner une catégorie.";
    }

    if (isAutreSelected() && !autreCategoriePrecision.trim()) {
      newErrors.autrePrecision = "Veuillez préciser la nature de votre demande.";
    }

    if (!description.trim()) {
      newErrors.description = "Veuillez décrire votre problème avec le plus de détails possible.";
    } else if (description.length < 10) {
      newErrors.description = "La description doit comporter au moins 10 caractères pour aider le technicien.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoToRecap = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowRecap(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, pieceJointe: 'Le fichier ne doit pas dépasser 10 Mo.' }));
        return;
      }
      setPieceJointe(file);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.pieceJointe;
        return copy;
      });
    }
  };

  const removeFile = () => {
    setPieceJointe(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setServerError(null);

    const fullDescription = isAutreSelected() && autreCategoriePrecision
      ? `[Précision Catégorie Autre : ${autreCategoriePrecision.trim()}]\n\n${description.trim()}`
      : description.trim();

    try {
      await demandeService.createDemande({
        objet: objet.trim(),
        categorie: categorieId === '99' ? 1 : Number(categorieId),
        urgence,
        description: fullDescription,
        piece_jointe: pieceJointe,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/demandes');
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'envoi.';
      setServerError(message);
      setIsSubmitting(false);
    }
  };

  const selectedCategorieObj = categories.find((c) => String(c.id) === String(categorieId));
  const urgenceLabel = urgence === 'eleve' ? 'Haute' : urgence === 'moyen' ? 'Moyenne' : 'Faible';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* En-tête avec retour */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/demandes"
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Nouvelle demande
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            Déposez votre ticket auprès du service technique.
          </p>
        </div>
      </div>

      {/* Bannière de succès */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">Demande enregistrée avec succès !</p>
            <p className="text-xs text-emerald-700">Votre demande a été transmise aux techniciens. Redirection en cours...</p>
          </div>
        </div>
      )}

      {/* Bannière d'erreur */}
      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-medium">{serverError}</p>
        </div>
      )}

      {/* Formulaire Principal ou Récapitulatif */}
      {!showRecap ? (
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6">
          <form onSubmit={handleGoToRecap} className="space-y-6">
            
            {/* 1. OBJET */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Objet de la demande *
              </label>
              <Input
                placeholder="Ex : Mon ordinateur ne démarre plus"
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                error={errors.objet}
                disabled={isSubmitting}
              />
            </div>

            {/* 2. CATÉGORIE & URGENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Catégorie */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Catégorie *
                </label>
                <Select
                  placeholder={loadingCategories ? 'Chargement...' : 'Sélectionnez une catégorie'}
                  value={categorieId}
                  onChange={(e) => setCategorieId(e.target.value)}
                  options={categories.map((c) => ({ value: c.id, label: c.libelle }))}
                  error={errors.categorie}
                  disabled={isSubmitting || loadingCategories}
                />
              </div>

              {/* Urgence (Pilules épurées) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Niveau d&apos;urgence *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Faible */}
                  <button
                    type="button"
                    onClick={() => setUrgence('faible')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      urgence === 'faible'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Faible</span>
                  </button>

                  {/* Moyenne */}
                  <button
                    type="button"
                    onClick={() => setUrgence('moyen')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      urgence === 'moyen'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Moyenne</span>
                  </button>

                  {/* Haute */}
                  <button
                    type="button"
                    onClick={() => setUrgence('eleve')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      urgence === 'eleve'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Haute</span>
                  </button>

                </div>
              </div>

            </div>

            {/* Précision si 'Autre' */}
            {isAutreSelected() && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider">
                  Précisez votre besoin *
                </label>
                <Input
                  placeholder="Ex : Problème badge d'accès, demande spécifique..."
                  value={autreCategoriePrecision}
                  onChange={(e) => setAutreCategoriePrecision(e.target.value)}
                  error={errors.autrePrecision}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* 3. DESCRIPTION */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Description détaillée *
              </label>
              <Textarea
                rows={5}
                placeholder="Expliquez ce qui se passe, les circonstances du problème, les messages d'erreur éventuels..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                disabled={isSubmitting}
              />
            </div>

            {/* 4. PIÈCE JOINTE */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              {!pieceJointe ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Joindre une capture d&apos;écran ou un fichier (optionnel)</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-3 p-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-900 truncate max-w-xs">{pieceJointe.name}</span>
                  <span className="text-[11px] text-slate-400">({(pieceJointe.size / 1024).toFixed(1)} Ko)</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {errors.pieceJointe && (
                <p className="text-xs text-rose-600 font-medium mt-1">{errors.pieceJointe}</p>
              )}
            </div>

            {/* 5. BOUTON ACTION */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-2"
              >
                <span>Vérifier et Envoyer</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>

          </form>
        </Card>
      ) : (
        /* VUE RÉCAPITULATIF */
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6 animate-in fade-in">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Vérification de votre demande
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assurez-vous que les informations sont exactes avant transmission.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Objet</span>
              <p className="text-sm font-semibold text-slate-900">{objet}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Catégorie</span>
                <p className="text-xs font-semibold text-slate-900">
                  {selectedCategorieObj?.libelle || 'Non renseignée'}
                  {isAutreSelected() && autreCategoriePrecision && ` (${autreCategoriePrecision})`}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Urgence</span>
                <p className={`text-xs font-semibold ${urgence === 'eleve' ? 'text-rose-600' : urgence === 'moyen' ? 'text-amber-600' : 'text-slate-800'}`}>
                  {urgenceLabel}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Description</span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                {description}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Pièce jointe</span>
              <span className="text-slate-900 font-semibold">
                {pieceJointe ? pieceJointe.name : 'Aucun fichier joint'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowRecap(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>

            <Button
              type="button"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer la demande</span>
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
}
