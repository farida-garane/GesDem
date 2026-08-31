import React, { Suspense } from 'react';
import { InterventionList } from '@/features/interventions/components/InterventionList';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Espace Interventions | DemOps',
  description: 'Tableau de bord et traitement des interventions techniques',
};

export default function InterventionsPage() {
  return (
    <div className="py-4 px-2 sm:px-4 md:px-6 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
            <span className="text-xs">Chargement des interventions...</span>
          </div>
        }
      >
        <InterventionList />
      </Suspense>
    </div>
  );
}
