import React from 'react';
import { DemandeDetailView } from '@/features/demandes/components/DemandeDetailView';

export const metadata = {
  title: 'Détail de la demande | DemOps',
  description: 'Suivi et consultation détaillée de la demande d\'intervention',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DemandeDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return (
    <div className="py-2 px-1 md:px-4 max-w-7xl mx-auto">
      <DemandeDetailView demandeId={resolvedParams.id} />
    </div>
  );
}
