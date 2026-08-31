import React, { Suspense } from 'react';
import { DemandeList } from '@/features/demandes/components/DemandeList';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Mes Demandes | DemOps',
  description: 'Consultez et suivez l\'état de vos demandes d\'intervention',
};

export default function DemandesPage() {
  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[300px] text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            <span className="text-xs">Chargement...</span>
          </div>
        }
      >
        <DemandeList />
      </Suspense>
    </div>
  );
}
