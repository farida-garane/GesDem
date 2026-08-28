'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { UserRole } from '@/types/user';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('demandeur');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.register({
        nom: nom.trim(),
        email: email.trim(),
        password,
        role,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'inscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl">
          <p className="text-green-600 text-sm">Compte créé avec succès ! Redirection...</p>
        </div>
      )}

      <Input
        label="Nom d'utilisateur"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        autoFocus
        placeholder="Entrez votre nom d'utilisateur"
      />

      <Input
        label="Adresse email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="exemple@entreprise.com"
      />

      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Créez un mot de passe "
      />

      <Input
        label="Confirmer le mot de passe"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        placeholder="Confirmez votre mot de passe"
      />

      <Select
        label="Rôle"
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        options={[
          { value: 'demandeur', label: 'Demandeur' },
          { value: 'technicien', label: 'Technicien' },
          { value: 'administrateur', label: 'Administrateur' },
        ]}
        placeholder="Sélectionnez votre rôle"
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Créer un compte
      </Button>
    </form>
  );
}
