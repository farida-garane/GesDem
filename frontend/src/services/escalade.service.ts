import { api } from './api';
import {
  EscaladeExterne,
  CreateEscaladeDto,
  EchangeExterne,
  CreateEchangeDto,
  StatutEscalade,
} from '@/types/escalade';

export const escaladeService = {
  async getEscalades(demandeId?: number | string): Promise<EscaladeExterne[]> {
    try {
      const params = demandeId ? { demande: demandeId } : undefined;
      return await api.get<EscaladeExterne[]>('/api/interventions/escalades/', params);
    } catch {
      return [];
    }
  },

  async createEscalade(data: CreateEscaladeDto): Promise<EscaladeExterne> {
    return await api.post<EscaladeExterne>('/api/interventions/escalades/', data);
  },

  async updateEscalade(
    id: number,
    data: Partial<EscaladeExterne>
  ): Promise<EscaladeExterne> {
    return await api.patch<EscaladeExterne>(`/api/interventions/escalades/${id}/`, data);
  },

  async createEchange(data: CreateEchangeDto): Promise<EchangeExterne> {
    return await api.post<EchangeExterne>('/api/interventions/echanges/', data);
  },
};

