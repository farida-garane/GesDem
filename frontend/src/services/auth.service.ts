import { api } from './api';
import { User, LoginResponse, RegisterPayload, UserRole, ChangePasswordPayload, UpdateUserRolePayload } from '@/types/user';

export const authService = {
  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>('/api/accounts/login/', credentials);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gesdem_token', data.token);
      localStorage.setItem('gesdem_user', JSON.stringify({
        nom: data.username,
        role: data.role,
      }));
    }
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    return api.post<User>('/api/accounts/register/', {
      username: payload.nom,
      email: payload.email,
      password: payload.password,
      departement: payload.departement,
      role: payload.role || 'demandeur',
    });
  },

  async getProfile(): Promise<User> {
    return api.get<User>('/api/accounts/profile/');
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    return api.patch<User>('/api/accounts/profile/', payload);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message?: string }> {
    return api.post<{ success: boolean; message?: string }>('/api/accounts/change-password/', payload);
  },

  async getUsers(): Promise<User[]> {
    return api.get<User[]>('/api/accounts/users/');
  },

  async createUser(payload: RegisterPayload): Promise<User> {
    return api.post<User>('/api/accounts/register/', {
      username: payload.nom,
      email: payload.email,
      password: payload.password,
      departement: payload.departement,
      role: payload.role || 'demandeur',
    });
  },

  async updateUserRole(userId: number, payload: UpdateUserRolePayload): Promise<User> {
    return api.patch<User>(`/api/accounts/users/${userId}/`, payload);
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gesdem_token');
      localStorage.removeItem('gesdem_user');
    }
  },
};
