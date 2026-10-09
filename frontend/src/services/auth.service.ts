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

  async updateProfile(data: { name?: string; avatarUrl?: string }): Promise<User> {
    const res = await apiClient.patch<unknown, { data?: User } & User>(
      '/auth/profile',
      data,
    );
    return (res?.data ?? res) as User;
  },

  async uploadAvatar(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<{ avatarUrl: string; user: User }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<
      unknown,
      { data?: { avatarUrl: string; user: User } } & {
        avatarUrl: string;
        user: User;
      }
    >('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });

    return (res?.data ?? res) as { avatarUrl: string; user: User };
  },

  async removeAvatar(): Promise<{ avatarUrl: null; user: User }> {
    const res = await apiClient.delete<
      unknown,
      { data?: { avatarUrl: null; user: User } } & {
        avatarUrl: null;
        user: User;
      }
    >('/auth/avatar');
    return (res?.data ?? res) as { avatarUrl: null; user: User };
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const res = await apiClient.patch<unknown, { message: string }>(
      '/auth/change-password',
      data,
    );
    return res;
  },
};
