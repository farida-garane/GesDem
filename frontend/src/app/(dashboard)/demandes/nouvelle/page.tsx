import React from 'react';
import { NouvelleDemandeForm } from '@/features/demandes/components/NouvelleDemandeForm';

export const metadata = {
  title: 'Nouvelle demande | DemOps',
  description: 'Créer et soumettre une nouvelle demande d\'intervention technique',
};

export default function NouvelleDemandePage() {
  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <NouvelleDemandeForm />
    </div>
  );
}
