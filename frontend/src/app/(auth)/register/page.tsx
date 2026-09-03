'use client';

import React from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 p-8 sm:p-10 shadow-[0_4px_30px_rgba(0,43,127,0.04)] space-y-7 max-w-lg w-full mx-auto animate-fade-in">
      
      {/* En-tête sobre et spacieux */}
      <div className="text-center space-y-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#002B7F] tracking-tight">
            Dem<span className="text-[#FF5E00]">Ops</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-medium">
            Créez votre compte pour gérer vos demandes et interventions
          </p>
        </div>
      </div>

      {/* Formulaire d'inscription */}
      <RegisterForm />

    </div>
  );
}
