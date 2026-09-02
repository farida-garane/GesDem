'use client';

import React, { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Header supérieur moderne */}
      <Header />

      {/* 2. Contenu principal avec Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Suspense fallback={<aside className="w-full md:w-64 shrink-0 p-6" />}>
          <Sidebar />
        </Suspense>

        <main className="flex-1 p-2 md:p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
