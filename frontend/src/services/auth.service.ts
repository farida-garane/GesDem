import { api } from './api';
import { User, LoginResponse, RegisterPayload, UserRole } from '@/types/user';

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
      role: payload.role || 'demandeur',
    });
  },

  async getProfile(): Promise<User> {
    return api.get<User>('/api/accounts/profile/');
  },

  async getUsers(): Promise<User[]> {
    return api.get<User[]>('/api/accounts/users/');
  },

  async updateUserRole(userId: number, role: UserRole): Promise<User> {
    return api.put<User>(`/api/accounts/users/${userId}/`, { role });
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gesdem_token');
      localStorage.removeItem('gesdem_user');
    }
  },
};
