'use client';

import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { InterventionDetail } from '@/features/demandes/components/InterventionDetail';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InterventionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
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
    <div className="py-2 px-1 md:px-4 max-w-7xl mx-auto">
      <InterventionDetail demandeId={resolvedParams.id} />
    </div>
  );
}
