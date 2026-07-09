import http from "../../lib/api/http";
import { setToken, removeToken } from "../../lib/api/token-storage";

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
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await http.post("/auth/login", { email, password });
    setToken(res.data.data.accessToken);
    return res.data.data;
  },

  me: async (): Promise<MeResponse> => {
    const res = await http.get("/auth/me");
    return res.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
    const res = await http.put("/auth/change-password", { currentPassword, newPassword, confirmNewPassword });
    return res.data;
  },

  updateProfile: async (userId: number, fullName: string) => {
    const res = await http.put(`/users/${userId}`, { fullName });
    return res.data;
  },

  logout: () => {
    removeToken();
    sessionStorage.removeItem("agritrace_user");
  },
};
