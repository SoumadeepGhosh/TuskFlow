import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokens';
import { RefreshResponse } from '@/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request Interceptor: Attach Bearer Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response Interceptor: Handle Refresh Token on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // If backend returns transformed response { statusCode, message, data }, extract data if present
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token as string}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = tokenStorage.getRefreshToken();
      if (!currentRefreshToken) {
        tokenStorage.clearTokens();
        isRefreshing = false;
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: currentRefreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const newAccessToken =
          response.data?.accessToken ||
          // In case nested inside { data: { accessToken } }
          (response.data as unknown as { data: RefreshResponse })?.data?.accessToken;
        const newRefreshToken =
          response.data?.refreshToken ||
          (response.data as unknown as { data: RefreshResponse })?.data?.refreshToken;

        if (newAccessToken && newRefreshToken) {
          tokenStorage.setTokens(newAccessToken, newRefreshToken);
          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh response missing tokens');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        tokenStorage.clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
