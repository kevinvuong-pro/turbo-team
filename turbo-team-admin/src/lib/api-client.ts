import axios from 'axios';

import { getDeviceHeaders } from './device-info';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from './auth-token-storage';

const skipRefreshEndpoints = ['/auth/login', '/auth/refresh'];
const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Gắn accessToken vào header
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const accessToken = getAccessToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    Object.assign(config.headers, await getDeviceHeaders());

    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Xử lý lỗi và refresh token
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }

      return Promise.reject(error);
    }

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      skipRefreshEndpoints.some((path) => originalRequest.url?.includes(path))
    ) {
      return Promise.reject(error);
    }

    // Request khác chờ refresh hoàn tất
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw error;

      // Gọi axios trực tiếp để không kích hoạt interceptor của apiClient
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        { headers: await getDeviceHeaders() },
      );
      const tokens = response.data.data;
      const { accessToken } = tokens;
      setTokens(tokens.accessToken, tokens.refreshToken);

      processQueue(null, accessToken);

      // Retry request ban đầu với accessToken mới
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      if (typeof window !== 'undefined') {
        clearTokens();

        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { apiClient };
