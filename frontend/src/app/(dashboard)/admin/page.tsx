'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UsersList } from '@/features/utilisateurs/components/UsersList';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login/admin');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#002B7F]" />
        <span className="text-xs font-bold text-[#475569]">Vérification des privilèges Administrateur...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-2">
      <UsersList />
    </div>
  );
}
