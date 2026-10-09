import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService, LoginDto, RegisterDto } from '@/services/auth.service';
import { useAuth } from '@/providers/auth-provider';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

export function useLoginMutation() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (res) => {
      const accessToken = res.accessToken || res.tokens?.accessToken;
      const refreshToken = res.refreshToken || res.tokens?.refreshToken;

      if (accessToken && refreshToken && res.user) {
        login(accessToken, refreshToken, res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
      } else {
        toast.error('Authentication succeeded but tokens were missing.');
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to login. Please check your credentials.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: () => {
      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useUpdateProfileMutation() {
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: (data: { name?: string; avatarUrl?: string }) =>
      authService.updateProfile(data),
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Profile details updated');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useUploadAvatarMutation() {
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Avatar updated successfully');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || error.message || 'Failed to upload avatar';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useRemoveAvatarMutation() {
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: () => authService.removeAvatar(),
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Avatar removed successfully');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || error.message || 'Failed to remove avatar';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || error.message || 'Failed to update password';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

