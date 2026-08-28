'use client';

import React from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-gray-900/20 border border-gray-200 p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mb-4 shadow-lg shadow-gray-900/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">DemOps</h1>
        <p className="text-gray-600 text-sm">
          Plateforme de gestion des demandes et interventions internes
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Créer un nouveau compte</h2>
        <RegisterForm />
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-gray-600 text-sm">
          <Link href="/login" className="text-gray-800 hover:text-gray-900 font-medium transition-colors">
            ← Retour à la page de connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
