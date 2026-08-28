export type UserRole = 'demandeur' | 'technicien' | 'admin';

export interface User {
  id: number;
  nom: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  username: string;
}

export interface RegisterPayload {
  nom: string;
  email: string;
  password: string;
  role?: UserRole;
}
