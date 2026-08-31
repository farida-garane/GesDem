'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { UserRoleModal } from './UserRoleModal';
import { authService } from '@/services/auth.service';
import { User, UserRole } from '@/types/user';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  UserCheck,
  ShieldAlert,
  UserX
} from 'lucide-react';

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDepartement, setSelectedDepartement] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal
  const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: number, newRole: UserRole, isActive: boolean) => {
    try {
      await authService.updateUserRole(userId, { role: newRole, is_active: isActive });
      setSuccessBanner('Les informations du compte ont été mises à jour avec succès.');
      setTimeout(() => setSuccessBanner(null), 3500);
      await fetchUsers();
    } catch (err: unknown) {
      throw err;
    }
  };

  // Departements list dynamically extracted from users
  const departementsList = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.departement && u.departement.trim()) {
        set.add(u.departement.trim());
      }
    });
    return Array.from(set);
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase();
        const emailMatch = u.email.toLowerCase().includes(query);
        const depMatch = (u.departement || '').toLowerCase().includes(query);
        if (!fullName.includes(query) && !emailMatch && !depMatch) return false;
      }

      // 2. Role Filter
      if (selectedRole !== 'all' && u.role !== selectedRole) {
        return false;
      }

      // 3. Departement Filter
      if (selectedDepartement !== 'all' && u.departement !== selectedDepartement) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus !== 'all') {
        const isActive = u.is_active ?? true;
        if (selectedStatus === 'active' && !isActive) return false;
        if (selectedStatus === 'inactive' && isActive) return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedRole, selectedDepartement, selectedStatus]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedRole !== 'all' || selectedDepartement !== 'all' || selectedStatus !== 'all'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedDepartement('all');
    setSelectedStatus('all');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <ShieldAlert className="w-3 h-3" />
            <span>Administrateur</span>
          </span>
        );
      case 'technicien':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <ShieldCheck className="w-3 h-3" />
            <span>Technicien</span>
          </span>
        );
      case 'demandeur':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <UserCheck className="w-3 h-3" />
            <span>Demandeur</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 1. En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Utilisateurs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les comptes et les rôles des utilisateurs de l&apos;entreprise.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Notifications */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{successBanner}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
          <button onClick={fetchUsers} className="underline font-bold hover:text-rose-950">
            Réessayer
          </button>
        </div>
      )}

      {/* 2. Barre de Recherche et Filtres */}
      <Card className="p-4 bg-white border border-slate-200/90 shadow-xs rounded-2xl space-y-3">
        {/* Recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou adresse email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </div>

        {/* Ligne des filtres */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres</span>
            </div>

            {/* Filtre Rôle */}
            <div className="w-40">
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={[
                  { value: 'all', label: 'Rôle : Tous' },
                  { value: 'demandeur', label: 'Demandeurs' },
                  { value: 'technicien', label: 'Techniciens' },
                  { value: 'admin', label: 'Administrateurs' },
                ]}
              />
            </div>

            {/* Filtre Département */}
            <div className="w-44">
              <Select
                value={selectedDepartement}
                onChange={(e) => setSelectedDepartement(e.target.value)}
                options={[
                  { value: 'all', label: 'Département : Tous' },
                  ...departementsList.map((dep) => ({ value: dep, label: dep })),
                ]}
              />
            </div>

            {/* Filtre État */}
            <div className="w-36">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'État : Tous' },
                  { value: 'active', label: 'Actifs' },
                  { value: 'inactive', label: 'Désactivés' },
                ]}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      </Card>

      {/* 3. TABLEAU DES UTILISATEURS */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
          <p className="text-xs font-semibold">Chargement des utilisateurs...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 text-center space-y-2 bg-white border border-slate-200/80 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 mx-auto flex items-center justify-center text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900">Aucun utilisateur trouvé</p>
          <p className="text-xs text-slate-400">Ajustez vos critères de recherche ou vos filtres.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white border border-slate-200/90 shadow-xs rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Utilisateur</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Département / Service</th>
                  <th className="py-3.5 px-4">Rôle</th>
                  <th className="py-3.5 px-4">État</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => {
                  const displayName = [u.prenom, u.nom].filter(Boolean).join(' ') || u.nom || 'Sans nom';
                  const initial = displayName.charAt(0).toUpperCase();
                  const isActive = u.is_active ?? true;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nom et Prénom + Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{displayName}</p>
                            <p className="text-[10px] text-slate-400">ID #{u.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {u.email}
                      </td>

                      {/* Département */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.departement ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.departement}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Non assigné</span>
                        )}
                      </td>

                      {/* Rôle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* État */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Désactivé
                          </span>
                        )}
                      </td>

                      {/* Action : Modifier le rôle */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForModal(u);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Modifier le rôle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modale de gestion des rôles */}
      <UserRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUserForModal}
        onConfirm={handleUpdateRole}
      />

    </div>
  );
}
