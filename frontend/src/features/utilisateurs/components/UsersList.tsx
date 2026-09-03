'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Loader2
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { User, UserRole } from '@/types/user';
import { UserRoleModal } from './UserRoleModal';

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

  // Edit role modal
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleUpdateRole = async (userId: number, newRole: UserRole, isActive: boolean) => {
    await authService.updateUserRole(userId, { role: newRole, is_active: isActive });
    setSuccessBanner('Les informations et le rôle du compte ont été mis à jour avec succès.');
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
            <span>Intervenant</span>
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fade-in">
      {/* 1. EN-TÊTE PRINCIPAL */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,43,127,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#002B7F] tracking-tight">
            Gestion des Utilisateurs &amp; Rôles
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1">
            Supervision des comptes collaborateurs, attribution des rôles et contrôle des accès
          </p>
        </div>

        {/* Action principale unique : Orange Vif de l'affiche (#FF5E00) */}
        <Link
          href="/register"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs font-black cursor-pointer active:scale-95 transition-all shrink-0 shadow-md"
        >
          <span>Inscrire un utilisateur</span>
        </Link>
      </div>

      {/* BANNIÈRE DE SUCCÈS */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold animate-fade-in">
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. BANDEAU DE STATISTIQUES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,43,127,0.02)] space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] block">Total Comptes</span>
          <p className="text-2xl sm:text-3xl font-black text-[#071530]">{stats.total}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,43,127,0.02)] space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] block">Demandeurs</span>
          <p className="text-2xl sm:text-3xl font-black text-[#002B7F]">{stats.demandeurs}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,43,127,0.02)] space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] block">Intervenants</span>
          <p className="text-2xl sm:text-3xl font-black text-[#071530]">{stats.intervenants}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,43,127,0.02)] space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] block">Administrateurs</span>
          <p className="text-2xl sm:text-3xl font-black text-[#071530]">{stats.admins}</p>
        </div>
      </div>

      {/* 3. BARRE DE RECHERCHE & FILTRES */}
      <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,43,127,0.02)] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Rechercher par nom, email, identifiant ou département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:outline-none focus:border-[#B3D1FF] focus:bg-white transition-all font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 text-[#071530] font-bold rounded-xl text-xs focus:outline-none focus:border-[#B3D1FF] focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Tous les rôles</option>
              <option value="demandeur">Demandeurs</option>
              <option value="technicien">Intervenants</option>
              <option value="admin">Administrateurs</option>
            </select>

            {departements.length > 0 && (
              <select
                value={selectedDepartement}
                onChange={(e) => setSelectedDepartement(e.target.value)}
                className="px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 text-[#071530] font-bold rounded-xl text-xs focus:outline-none focus:border-[#B3D1FF] focus:bg-white cursor-pointer transition-all"
              >
                <option value="all">Tous départements</option>
                {departements.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 text-[#071530] font-bold rounded-xl text-xs focus:outline-none focus:border-[#B3D1FF] focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Tous les états</option>
              <option value="active">Comptes Actifs</option>
              <option value="inactive">Comptes Désactivés</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. LISTE UTILISATEURS */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#002B7F] mx-auto" />
          <p className="text-xs text-[#475569] font-bold">Chargement des utilisateurs...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-bold">
          <span>{error}</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl space-y-3 shadow-[0_2px_14px_rgba(0,43,127,0.02)]">
          <h3 className="text-sm font-black text-[#071530]">Aucun utilisateur trouvé</h3>
          <p className="text-xs text-[#475569]">
            Aucun compte ne correspond à vos critères de recherche actuels.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_16px_rgba(0,43,127,0.03)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const displayName = [u.prenom, u.nom].filter(Boolean).join(' ') || u.nom || u.username || u.email;
              const initial = displayName.charAt(0).toUpperCase();

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 hover:bg-[#F0F6FF] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#002B7F] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {initial}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-[#071530] truncate">
                          {displayName}
                        </p>
                        {getRoleBadge(u.role)}
                        {u.is_active === false && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
                            Désactivé
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#1E293B] font-medium flex-wrap">
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

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Bouton secondaire Modifier rôle */}
                    <button
                      onClick={() => {
                        setSelectedUserForEdit(u);
                        setIsModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#E8F1FF] border border-[#CBD5E1] hover:border-[#002B7F] text-[#002B7F] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      <span>Modifier rôle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION DE RÔLE */}
      <UserRoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        user={selectedUserForEdit}
        onConfirm={handleUpdateRole}
      />
    </div>
  );
}
