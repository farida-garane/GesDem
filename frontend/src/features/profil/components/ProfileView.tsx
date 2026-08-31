'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { User } from '@/types/user';
import {
  User as UserIcon,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Save,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Sparkles,
  Calendar,
  Check
} from 'lucide-react';

export function ProfileView() {
  const searchParams = useSearchParams();
  const { user: authUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Onglet actif : 'general' | 'securite' (synchronisé avec l'URL)
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'general' | 'securite'>(
    tabParam === 'securite' ? 'securite' : 'general'
  );

  useEffect(() => {
    if (tabParam === 'securite' || tabParam === 'general') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // État Édition Informations du compte
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [departement, setDepartement] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);

  // État Édition Mot de Passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getProfile();
      if (data) {
        setProfile(data);
        setNom(data.nom || '');
        setEmail(data.email || '');
        setDepartement(data.departement || '');
      }
    } catch {
      if (authUser) {
        setProfile(authUser);
        setNom(authUser.nom || '');
        setEmail(authUser.email || '');
        setDepartement(authUser.departement || '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authUser]);

  // Enregistrer les informations du compte
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setError(null);
    setInfoSuccess(null);

    try {
      const updated = await authService.updateProfile({
        nom: nom.trim(),
        email: email.trim(),
        departement: departement.trim(),
      });
      setProfile(updated);
      await refreshUser();
      setInfoSuccess('Vos informations ont été enregistrées avec succès.');
      setTimeout(() => setInfoSuccess(null), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSavingInfo(false);
    }
  };

  // Enregistrer le mot de passe
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Votre mot de passe a été modifié avec succès.');
      setTimeout(() => setPasswordSuccess(null), 3500);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe.');
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName = nom || profile?.nom || 'Mon Profil';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">

      {/* 1. EN-TÊTE DE LA PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Paramètres du compte
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos informations de profil et vos préférences de sécurité.
          </p>
        </div>

        {/* Onglets de navigation horizontaux */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Informations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('securite')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'securite'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sécurité</span>
          </button>
        </div>
      </div>

      {/* Notifications globales */}
      {infoSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{infoSuccess}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-900 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* 2. DISPOSITION EN 2 COLONNES (STYLE SAAS MODERNE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : CARTE D'IDENTITÉ COMPACTE (4 colonnes) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-3xl text-center space-y-5">
            
            {/* Grand Avatar Élégant */}
            <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-extrabold mx-auto shadow-md shadow-slate-900/15">
              {initialLetter}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                {displayName}
              </h2>
              <p className="text-xs text-slate-400 font-medium truncate">
                {profile?.email || 'email@entreprise.com'}
              </p>
            </div>

            {/* Badges de synthèse */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-left">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role</span>
                </span>
                <span className="font-bold text-slate-700">{departement || 'Non spécifié'}</span>
              </div>
            </div>

          </Card>
        </div>

        {/* COLONNE DROITE : ESPACE FORMULAIRE PRINCIPAL (8 colonnes) */}
        <div className="lg:col-span-8">
          
          {/* ONGLET 1 : INFORMATIONS DU COMPTE */}
          {activeTab === 'general' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Informations Générales
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modifiez vos coordonnées d&apos;inscription et de contact.
                </p>
              </div>

              <form onSubmit={handleSaveInfo} className="space-y-5">
                <div className="space-y-4">
                  {/* Nom d'utilisateur */}
                  <Input
                    label="Nom d'utilisateur *"
                    placeholder=""
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    disabled={savingInfo}
                    required
                  />

                  {/* Email */}
                  <Input
                    label=" Email  *"
                    type="email"
                    placeholder="Ex : email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={savingInfo}
                    required
                  />

                  {/* Département */}
                  <Input
                    label="Département / Service"
                    placeholder="Ex : Informatique, Comptabilité, RH..."
                    value={departement}
                    onChange={(e) => setDepartement(e.target.value)}
                    disabled={savingInfo}
                  />
                </div>

                {/* Bouton de sauvegarde */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <Button
                    type="submit"
                    isLoading={savingInfo}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Enregistrer les modifications</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* ONGLET 2 : SÉCURITÉ & MOT DE PASSE */}
          {activeTab === 'securite' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs rounded-3xl space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Sécurité & Mot de passe
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mettez à jour votre mot de passe pour protéger votre compte.
                </p>
              </div>

              {passwordSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-900 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4">
                {/* Mot de passe actuel */}
                <div className="relative">
                  <Input
                    label="Mot de passe actuel *"
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder=""
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={savingPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Nouveau mot de passe */}
                <div className="relative">
                  <Input
                    label="Nouveau mot de passe *"
                    type={showNewPass ? 'text' : 'password'}
                    placeholder=""
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={savingPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirmer le nouveau mot de passe */}
                <div>
                  <Input
                    label="Confirmer le nouveau mot de passe *"
                    type="password"
                    placeholder=""
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={savingPassword}
                    required
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <Button
                    type="submit"
                    isLoading={savingPassword}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Mettre à jour le mot de passe</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
