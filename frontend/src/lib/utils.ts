import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserRole } from '@/types/user';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getRoleBadgeProps(role: UserRole): { label: string; bgClass: string } {
  switch (role) {
    case 'admin':
      return { label: 'Administrateur', bgClass: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'technicien':
      return { label: 'Technicien', bgClass: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'demandeur':
    default:
      return { label: 'Demandeur', bgClass: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}
