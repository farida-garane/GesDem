'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { 
  User, 
  Mail, 
  Building2, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Lock
} from 'lucide-react';

export function ProfileForm() {
  const { user, refreshUser } = useAuth();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [departement, setDepartement] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const profile = await authService.getProfile();
        if (profile) {
          setNom(profile.nom || '');
          setEmail(profile.email || '');
          setDepartement(profile.departement || '');
        }
      } catch {
        // En cas de non-connexion ou fallback
        if (user) {
          setNom(user.nom || '');
          setEmail(user.email || '');
          setDepartement(user.departement || '');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await authService.updateProfile({
        nom: nom.trim(),
        email: email.trim(),
        departement: departement.trim(),
      });

      await refreshUser();
      setSuccessMessage('Vos informations de profil ont été mises à jour avec succès.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = (nom || user?.nom || 'U').charAt(0).toUpperCase();
  const currentRole = user?.role || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* En-tête */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mon Profil
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Consultez et mettez à jour vos informations personnelles et vos coordonnées de contact.
        </p>
      </div>

      {/* Bannière de succès */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Bannière d'erreur */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* 1. Carte Synthèse du compte */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl font-extrabold shadow-sm shadow-slate-900/20 shrink-0">
              {initialLetter}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {nom || user?.nom || ''}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {email || user?.email || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rôle : {currentRole}</span>
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Formulaire */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom complet */}
            <Input
              label="Nom d'utilisateur *"
              placeholder=""
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              disabled={isSaving || loading}
              leftIcon={<User className="w-4 h-4" />}
            />

            {/* Email */}
            <Input
              label="Email *"
              type="email"
              placeholder="Ex : email@entreprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSaving || loading}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {/* Département */}
            <Input
              label="Département / Service"
              placeholder="Ex : Comptabilité, RH.."
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              disabled={isSaving || loading}
              leftIcon={<Building2 className="w-4 h-4" />}
            />
          </div>

          {/* Rôle information (lecture seule) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
    
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="submit"
              isLoading={isSaving}
              disabled={isSaving || loading}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer les modifications</span>
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
}
