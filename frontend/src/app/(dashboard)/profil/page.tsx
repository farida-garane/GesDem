import React, { Suspense } from 'react';
import { ProfileView } from '@/features/profil/components/ProfileView';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Mon Profil | DemOps',
  description: 'Consultez et modifiez vos informations de profil et la sécurité de votre compte',
};

export default function ProfilPage() {
  return (
    <div className="py-4 px-2 md:px-6 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
            <span className="text-xs">Chargement du profil...</span>
          </div>
        }
      >
        <ProfileView />
      </Suspense>
    </div>
  );
}
