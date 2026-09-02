'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Layers } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="bg-white rounded-3xl border border-slate-300/80 p-8 sm:p-11 shadow-sm space-y-7">
      
      {/* En-tête sobre et spacieux */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-600/25">
          <Layers className="w-6 h-6 stroke-[2.2]" />
        </div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dem<span className="text-orange-500">Ops</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <LoginForm />

    </div>
  );
}
