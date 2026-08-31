import React from 'react';
import { UsersList } from '@/features/utilisateurs/components/UsersList';

export const metadata = {
  title: 'Utilisateurs | DemOps',
  description: 'Gestion des comptes et des rôles utilisateurs de l\'entreprise',
};

export default function UtilisateursPage() {
  return (
    <div className="py-4 px-2 md:px-6 max-w-7xl mx-auto">
      <UsersList />
    </div>
  );
}
