export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokens?: AuthTokens;
}

export type RegisterResponse = User;

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
