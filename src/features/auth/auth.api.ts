import { post, get, put } from "../../lib/api";
import type { LoginRequest, ChangePasswordRequest, LoginData, UserBasic } from "../../types/mapping";
import { adaptLoginDataToResponse } from "../../types/mapping";

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await post<LoginData>("/auth/login", data);
    // Adapt new LoginData to legacy LoginResponse
    return adaptLoginDataToResponse(response.data);
  },

  logout: () => post<void>("/auth/logout"),

  getProfile: () => get<UserBasic>("/auth/profile"),

  refreshToken: () => post<{ accessToken: string }>("/auth/refresh-token"),

  changePassword: (data: ChangePasswordRequest) =>
    put<void>("/auth/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
};
