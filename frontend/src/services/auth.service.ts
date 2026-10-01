import { apiClient } from '@/lib/axios';
import {
  LoginResponse,
  RefreshResponse,
  RegisterResponse,
  User,
} from '@/types/auth';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterDto): Promise<RegisterResponse> {
    const res = await apiClient.post<unknown, { data?: RegisterResponse } & RegisterResponse>(
      '/auth/register',
      data,
    );
    return (res?.data ?? res) as RegisterResponse;
  },

  async login(data: LoginDto): Promise<LoginResponse> {
    const res = await apiClient.post<unknown, { data?: LoginResponse } & LoginResponse>(
      '/auth/login',
      data,
    );
    return (res?.data ?? res) as LoginResponse;
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get<unknown, { data?: User } & User>('/auth/me');
    return (res?.data ?? res) as User;
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const res = await apiClient.post<unknown, { data?: RefreshResponse } & RefreshResponse>(
      '/auth/refresh',
      { refreshToken },
    );
    return (res?.data ?? res) as RefreshResponse;
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    const res = await apiClient.post<unknown, { message: string }>(
      '/auth/logout',
      { refreshToken },
    );
    return res;
  },

  async logoutAll(): Promise<{ message: string }> {
    const res = await apiClient.post<unknown, { message: string }>(
      '/auth/logout-all',
    );
    return res;
  },
};
