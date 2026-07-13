import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { env } from "../../config/env";
import { getToken, setToken, removeToken } from "./token-storage";
import { enableMockAdapter } from "./mock-adapter";

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
}

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${env.apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers!.Authorization = `Bearer ${data.accessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeToken();
        sessionStorage.removeItem("agritrace_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

if (env.enableMocks) {
  enableMockAdapter(http);
}

export function get<T>(url: string, config?: AxiosRequestConfig) {
  return http.get<ApiResponse<T>>(url, config).then((r) => r.data);
}

export function getList<T>(url: string, config?: AxiosRequestConfig) {
  return http.get<ApiResponse<T[]>>(url, config).then((r) => r.data);
}

export function getPaginated<T>(url: string, config?: AxiosRequestConfig) {
  return http.get<ApiResponse<PaginatedResponse<T>>>(url, config).then((r) => r.data);
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return http.post<ApiResponse<T>>(url, data, config).then((r) => r.data);
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return http.put<ApiResponse<T>>(url, data, config).then((r) => r.data);
}

export function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return http.patch<ApiResponse<T>>(url, data, config).then((r) => r.data);
}

export function del<T = void>(url: string, config?: AxiosRequestConfig) {
  return http.delete<ApiResponse<T>>(url, config).then((r) => r.data);
}

export default http;
