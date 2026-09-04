'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Loader2
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { User, UserRole, UpdateUserAdminPayload } from '@/types/user';
import { UserRoleModal } from './UserRoleModal';
import { CreateUserModal } from './CreateUserModal';

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

  // Modals
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.toLowerCase().includes('credential')) {
        setError(msg || 'Impossible de charger la liste des utilisateurs.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId: number, payload: UpdateUserAdminPayload) => {
    await authService.updateUser(userId, payload);
    setSuccessBanner('Les informations, accès et mot de passe du compte ont été mis à jour avec succès.');
    setTimeout(() => setSuccessBanner(null), 3500);
    await fetchUsers();
  };

  const handleDeleteUser = async (userId: number) => {
    await authService.deleteUser(userId);
    setSuccessBanner('Le compte a été définitivement supprimé de la plateforme.');
    setTimeout(() => setSuccessBanner(null), 3500);
    await fetchUsers();
  };

  // Unique departments
  const departements = useMemo(() => {
    const deps = new Set<string>();
    users.forEach((u) => {
      if (u.departement) deps.add(u.departement);
    });
    return Array.from(deps);
  }, [users]);

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const demandeurs = users.filter((u) => u.role === 'demandeur').length;
    const intervenants = users.filter((u) => u.role === 'technicien').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, demandeurs, intervenants, admins };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        u.nom?.toLowerCase().includes(query) ||
        u.prenom?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.departement?.toLowerCase().includes(query);

      const matchesRole = selectedRole === 'all' || u.role === selectedRole;
      const matchesDepartement = selectedDepartement === 'all' || u.departement === selectedDepartement;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' ? u.is_active !== false : u.is_active === false);

      return matchesSearch && matchesRole && matchesDepartement && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedDepartement, selectedStatus]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
            <span>Administrateur</span>
          </span>
        );
      case 'technicien':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-orange-50 text-orange-800 border border-orange-200 shadow-2xs">
            <span>Services Généraux</span>
          </span>
        );
      case 'demandeur':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
            <span>Demandeur</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-8 pb-16 animate-fade-in">
      {/* 1. EN-TÊTE PRINCIPAL */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,43,127,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#002B7F] tracking-tight">
            Gestion des Utilisateurs &amp; Rôles
          </h1>
          <p className="text-sm text-[#475569] font-semibold mt-1.5">
            Supervision des comptes collaborateurs, attribution des rôles et contrôle des accès
          </p>
        </div>

        {/* Action principale unique : Inscrire un utilisateur avec attribution du rôle */}
        <Link
          href="/admin/inscrire"
          className="inline-flex items-center px-6 py-3.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs sm:text-sm font-black cursor-pointer active:scale-95 transition-all shrink-0 shadow-md"
        >
          <span>Inscrire un utilisateur</span>
        </Link>
      </div>

      {/* BANNIÈRE DE SUCCÈS */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm font-bold animate-fade-in">
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. BANDEAU DE STATISTIQUES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,43,127,0.02)] space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#475569] block">Total Comptes</span>
          <p className="text-3xl sm:text-4xl font-black text-[#071530]">{stats.total}</p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,43,127,0.02)] space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#475569] block">Demandeurs</span>
          <p className="text-3xl sm:text-4xl font-black text-[#002B7F]">{stats.demandeurs}</p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,43,127,0.02)] space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#475569] block">Intervenants</span>
          <p className="text-3xl sm:text-4xl font-black text-[#FF5E00]">{stats.intervenants}</p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,43,127,0.02)] space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#475569] block">Administrateurs</span>
          <p className="text-3xl sm:text-4xl font-black text-[#071530]">{stats.admins}</p>
        </div>
      </div>

      {/* 3. BARRE DE RECHERCHE & FILTRES */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,43,127,0.03)] space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Rechercher par nom, email, identifiant ou département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-[#071530] placeholder-[#64748b] focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all font-semibold"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 text-[#071530] font-bold rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#002B7F] focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Tous rôles</option>
              <option value="demandeur">Demandeurs</option>
              <option value="technicien">Intervenants</option>
              <option value="admin">Administrateurs</option>
            </select>

            <select
              value={selectedDepartement}
              onChange={(e) => setSelectedDepartement(e.target.value)}
              className="px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 text-[#071530] font-bold rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#002B7F] focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Tous départements</option>
              {departements.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 text-[#071530] font-bold rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#002B7F] focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Tous statuts</option>
              <option value="active">Comptes actifs</option>
              <option value="inactive">Comptes désactivés</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. LISTE DES UTILISATEURS */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#002B7F] mx-auto" />
          <p className="text-sm font-bold text-[#475569]">Chargement des utilisateurs...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-bold">
          <span>{error}</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-100 rounded-3xl space-y-3 shadow-xs">
          <p className="text-base font-black text-[#071530]">Aucun utilisateur trouvé</p>
          <p className="text-sm text-[#475569] font-medium max-w-md mx-auto">
            Aucun compte ne correspond à vos critères de recherche actuels.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,43,127,0.03)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const displayName = [u.prenom, u.nom].filter(Boolean).join(' ') || u.nom || u.username || u.email;
              const initial = displayName.charAt(0).toUpperCase();

              return (
                <div
                  key={u.id}
                  className="p-6 sm:p-7 hover:bg-[#F0F6FF] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#002B7F] text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                      {initial}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-base sm:text-lg font-black text-[#071530] truncate">
                          {displayName}
                        </p>
                        {getRoleBadge(u.role)}
                        {u.is_active === false ? (
                          <span className="text-xs font-black px-2.5 py-0.5 bg-rose-100 text-rose-950 border border-rose-300 rounded-lg">
                            ⛔ Désactivé
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                            Actif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs sm:text-sm text-[#475569] font-semibold flex-wrap">
                        <span>{u.email}</span>
                        {u.departement && (
                          <span className="text-[#002B7F] font-bold">
                            Département : {u.departement}
                          </span>
                        )}
                        {u.telephone && (
                          <span>Tél : {u.telephone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {/* Bouton Gérer le compte (Rôle & Activation) */}
                    <button
                      onClick={() => {
                        setSelectedUserForEdit(u);
                        setIsModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#E8F1FF] border border-[#CBD5E1] hover:border-[#002B7F] text-[#002B7F] text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      <span>Gérer le compte</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODALE DE GESTION DU COMPTE (RÔLE, STATUT & SUPPRESSION) */}
      <UserRoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        user={selectedUserForEdit}
        onConfirm={handleUpdateUser}
        onDelete={handleDeleteUser}
      />

      {/* MODALE D'INSCRIPTION D'UN NOUVEL UTILISATEUR AVEC CHOIX DU RÔLE */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setSuccessBanner("L'utilisateur a été inscrit avec succès et son rôle a été attribué.");
          setTimeout(() => setSuccessBanner(null), 3500);
          fetchUsers();
        }}
      />
    </div>
  );
}
