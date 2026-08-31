import React from 'react';
import { InterventionDetail } from '@/features/demandes/components/InterventionDetail';

export const metadata = {
  title: "Dossier d'intervention | DemOps",
  description: 'Traitement technique et suivi d’intervention',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterventionDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className="py-2 px-1 md:px-4 max-w-7xl mx-auto">
      <InterventionDetail demandeId={resolvedParams.id} />
    </div>
  );
}
