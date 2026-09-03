export type UserRole = 'demandeur' | 'technicien' | 'admin';

export interface User {
  id: number;
  nom: string;
  prenom?: string;
  username?: string;
  email: string;
  telephone?: string;
  role: UserRole;
  departement?: string;
  is_active?: boolean;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  username: string;
}

export interface RegisterPayload {
  nom: string;
  prenom?: string;
  email: string;
  password: string;
  departement?: string;
  role?: UserRole;
}

export interface UpdateProfilePayload {
  nom: string;
  prenom?: string;
  email: string;
  departement?: string;
}

export interface ChangePasswordPayload {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface UpdateUserRolePayload {
  role: UserRole;
  is_active?: boolean;
}
