'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { demandeService } from '@/services/demande.service';
import { Categorie, UrgenceLevel } from '@/types/demande';
import { 
  X
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
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fade-in">
      
      {/* En-tête avec retour */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/demandes"
              className="text-xs font-bold text-[#002B7F] hover:underline"
            >
              &larr; Retour
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nouvelle demande
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Déposez votre ticket auprès du service technique.
          </p>
        </div>
      </div>

      {/* Conseil d'assistance préalable pour limiter les demandes inutiles */}
      <div className="p-3.5 rounded-2xl bg-[#E8F1FF] border border-[#B3D1FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="font-medium text-[#1E293B]">
          Un souci courant (App Repas, double écran, Wi-Fi...) ? Consultez la fiche d&apos;assistance pour le résoudre en autonomie.
        </span>
        <Link
          href="/aide"
          className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#B3D1FF] text-[#002B7F] font-bold hover:bg-white/80 transition-colors shadow-2xs text-center"
        >
          Consulter la fiche &rarr;
        </Link>
      </div>

      {/* Bannière de succès */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs animate-in fade-in">
          <p className="font-bold text-sm">Demande enregistrée avec succès !</p>
          <p className="text-xs text-emerald-700">Votre demande a été transmise aux techniciens. Redirection en cours...</p>
        </div>
      )}

      {/* Bannière d'erreur */}
      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
          <p className="text-xs font-bold">{serverError}</p>
        </div>
      )}

      {/* Formulaire Principal ou Récapitulatif */}
      {!showRecap ? (
        <div className="p-6 sm:p-8 bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,43,127,0.03)] rounded-3xl space-y-6">
          <form onSubmit={handleGoToRecap} className="space-y-6">
            
            {/* 1. OBJET */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
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
                <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
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

              {/* Urgence */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                  Niveau d&apos;urgence *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Faible */}
                  <button
                    type="button"
                    onClick={() => setUrgence('faible')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      urgence === 'faible'
                        ? 'bg-[#E8F1FF] text-[#002B7F] border-[#B3D1FF]'
                        : 'bg-slate-50 border-slate-100 text-[#1E293B] hover:bg-slate-100/70'
                    }`}
                  >
                    <span>Faible</span>
                  </button>

                  {/* Moyenne */}
                  <button
                    type="button"
                    onClick={() => setUrgence('moyen')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      urgence === 'moyen'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-slate-50 border-slate-100 text-[#1E293B] hover:bg-slate-100/70'
                    }`}
                  >
                    <span>Moyenne</span>
                  </button>

                  {/* Haute */}
                  <button
                    type="button"
                    onClick={() => setUrgence('eleve')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      urgence === 'eleve'
                        ? 'bg-rose-50 text-rose-900 border-rose-200'
                        : 'bg-slate-50 border-slate-100 text-[#1E293B] hover:bg-slate-100/70'
                    }`}
                  >
                    <span>Élevée</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Précision si 'Autre' */}
            {isAutreSelected() && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-[#002B7F] uppercase tracking-wider">
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

            {/* 3. DESCRIPTION DÉTAILLÉE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                Description détaillée du problème *
              </label>
              <Textarea
                rows={4}
                placeholder="Précisez les symptômes constatés, les messages d'erreur éventuels..."
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-200 hover:border-[#002B7F] bg-slate-50/70 hover:bg-[#E8F1FF] text-xs font-bold text-[#002B7F] transition-colors cursor-pointer"
                >
                  <span>Joindre une capture d&apos;écran ou un fichier (optionnel)</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-3 p-2.5 px-3.5 bg-[#E8F1FF] border border-[#B3D1FF] rounded-xl text-xs">
                  <span className="font-bold text-[#071530] truncate max-w-xs">{pieceJointe.name}</span>
                  <span className="text-[11px] text-[#475569] font-medium">({(pieceJointe.size / 1024).toFixed(1)} Ko)</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-rose-100 text-[#071530] hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {errors.pieceJointe && (
                <p className="text-xs text-rose-600 font-bold mt-1">{errors.pieceJointe}</p>
              )}
            </div>

            {/* 5. BOUTON ACTION UNIQUE : Orange #FF5E00 */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#FF5E00] hover:bg-[#E05200] text-white rounded-xl text-xs font-black active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <span>Vérifier et Envoyer</span>
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* VUE RÉCAPITULATIF */
        <div className="p-6 sm:p-8 bg-white border border-[#CBD5E1] rounded-2xl shadow-xs space-y-6 animate-in fade-in">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h2 className="text-base font-black text-[#002B7F]">
              Vérification de votre demande
            </h2>
            <p className="text-xs text-[#1E293B] font-semibold mt-0.5">
              Assurez-vous que les informations sont exactes avant transmission.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] space-y-1">
              <span className="text-[#002B7F] font-bold uppercase text-[10px] block">Objet</span>
              <p className="text-sm font-black text-[#071530]">{objet}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] space-y-1">
                <span className="text-[#002B7F] font-bold uppercase text-[10px] block">Catégorie</span>
                <p className="text-xs font-bold text-[#071530]">
                  {selectedCategorieObj?.libelle || 'Non renseignée'}
                  {isAutreSelected() && autreCategoriePrecision && ` (${autreCategoriePrecision})`}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] space-y-1">
                <span className="text-[#002B7F] font-bold uppercase text-[10px] block">Urgence</span>
                <p className={`text-xs font-black ${urgence === 'eleve' ? 'text-rose-700' : urgence === 'moyen' ? 'text-amber-700' : 'text-[#002B7F]'}`}>
                  {urgenceLabel}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] space-y-1">
              <span className="text-[#002B7F] font-bold uppercase text-[10px] block">Description</span>
              <p className="text-xs text-[#071530] font-medium whitespace-pre-wrap leading-relaxed bg-[#F0F6FF] p-3 rounded-xl border border-[#B3D1FF]">
                {description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] flex items-center justify-between">
              <span className="text-[#002B7F] font-bold uppercase text-[10px]">Pièce jointe</span>
              <span className="text-[#071530] font-bold">
                {pieceJointe ? pieceJointe.name : 'Aucun fichier joint'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
            {/* Bouton secondaire */}
            <button
              type="button"
              onClick={() => setShowRecap(false)}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#002B7F] hover:bg-[#E8F1FF] hover:border-[#002B7F] transition-colors cursor-pointer shadow-xs"
            >
              <span>Modifier</span>
            </button>

            {/* Action principale unique */}
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#FF5E00] hover:bg-[#E05200] text-white rounded-xl text-xs font-black active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
