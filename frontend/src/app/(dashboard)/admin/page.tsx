'use client';

import React from 'react';
import { UsersList } from '@/features/utilisateurs/components/UsersList';

export default function AdminPage() {
  return (
    <div className="w-full max-w-7xl mx-auto py-2">
      <UsersList />
    </div>
  );
}
