'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { InterventionList } from '@/features/interventions/components/InterventionList';
import { Loader2 } from 'lucide-react';

export default function InterventionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role !== 'technicien' && user.role !== 'admin')) {
        router.push('/login/intervenant');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== 'technicien' && user.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#002B7F]" />
        <span className="text-xs font-bold text-[#475569]">Vérification des accès Intervenant...</span>
      </div>
    );
  }

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
