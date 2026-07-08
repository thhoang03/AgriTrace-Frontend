import axios from "axios";
import { env } from "../../config/env";
import { getToken } from "./token-storage";

const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("agritrace_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
