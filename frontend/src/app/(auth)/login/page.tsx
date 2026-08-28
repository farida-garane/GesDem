'use client';

import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-gray-900/20 border border-gray-200 p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mb-4 shadow-lg shadow-gray-900/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
        <h2 className="text-xl font-semibold text-gray-800">Connexion</h2>
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-gray-600 text-sm">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-gray-800 hover:text-gray-900 font-medium transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
