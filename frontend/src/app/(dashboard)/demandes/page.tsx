'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DemandeList } from '@/features/demandes/components/DemandeList';
import { Loader2 } from 'lucide-react';

export default function DemandesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#002B7F]" />
        <span className="text-xs font-bold text-[#475569]">Chargement de votre espace...</span>
      </div>
    );
  }

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
