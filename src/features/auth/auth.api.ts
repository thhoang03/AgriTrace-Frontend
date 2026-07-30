import { post, get, put } from "../../lib/api";
import type { LoginRequest, ChangePasswordRequest, LoginData, UserBasic } from "../../types/mapping";
import { adaptLoginDataToResponse } from "../../types/mapping";

// Legacy LoginResponse for backward compatibility
interface LoginResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await post<LoginData>("/auth/login", data);
    // Adapt new LoginData to legacy LoginResponse
    return adaptLoginDataToResponse(response.data);
  },

  register: async (data: any) => {
    const response = await post<LoginData>("/auth/register", data);
    return adaptLoginDataToResponse(response.data);
  },

  logout: () => post<void>("/auth/logout"),

  getProfile: () => get<UserBasic>("/auth/me"),

  refreshToken: (refreshToken?: string) => post<{ accessToken: string; refreshToken: string }>("/auth/refresh-token", { refreshToken }),

  changePassword: (data: ChangePasswordRequest) =>
    put<void>("/auth/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
};
