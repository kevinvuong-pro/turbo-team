import axios from 'axios';

import { getDeviceHeaders } from './device-info';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from './auth-token-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const skipRefreshEndpoints = ['/auth/login', '/auth/refresh'];

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];
const processQueue = (error: unknown, status: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(status);
    }
  });

  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
apiClient.interceptors.request.use(async (config) => {
  const accessToken = getAccessToken();

  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

  Object.assign(config.headers, await getDeviceHeaders());

  return config;
});
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/stats';
      }

      return Promise.reject(error);
    }

    if (!originalRequest._retry && error.response?.status === 401) {
      if (skipRefreshEndpoints.some((path) => originalRequest.url?.includes(path))) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw error;

        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { headers: await getDeviceHeaders() },
        );
        const tokens = refreshResponse.data.data;
        setTokens(tokens.accessToken, tokens.refreshToken);

        processQueue(null, 'success');

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError, null);

        if (typeof window !== 'undefined') {
          window.location.href = '/stats';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { apiClient };
