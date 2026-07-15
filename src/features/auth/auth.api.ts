import { post, get, put } from "../../lib/api";
import type { LoginRequest, LoginResponse, User, ChangePasswordRequest } from "./auth.types";

export const authApi = {
  login: (data: LoginRequest) => post<LoginResponse>("/auth/login", data),

  logout: () => post<void>("/auth/logout"),

  getProfile: () => get<User>("/auth/profile"),

  refreshToken: () => post<{ accessToken: string }>("/auth/refresh"),

  changePassword: (data: ChangePasswordRequest) =>
    put<void>("/auth/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
};
