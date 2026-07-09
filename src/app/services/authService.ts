import { apiFetch } from "./api";

export interface MeResponse {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  organizationId: number;
  organizationName: string;
  organizationType: string;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: MeResponse;
}

export const authService = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<MeResponse>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) =>
    apiFetch("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    }),

  updateProfile: (userId: number, fullName: string) =>
    apiFetch(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ fullName }),
    }),
};
