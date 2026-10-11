export type Role = 'admin' | 'operator';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface LoginResponse {
  user: PublicUser;
}

export interface MeResponse {
  user: PublicUser;
}

export interface ApiErrorBody {
  error?: string;
  details?: Record<string, unknown[]>;
}