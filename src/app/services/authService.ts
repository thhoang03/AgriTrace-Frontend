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

const USE_MOCK = true; // đổi thành false khi backend sẵn sàng

const mockUser: MeResponse = {
  userId: 1,
  fullName: "Nguyen Van A",
  email: "admin@agritrace.vn",
  role: "Administrator",
  isActive: true,
  organizationId: 1,
  organizationName: "Ministry of Agriculture",
  organizationType: "Government",
};

const mockDelay = () => new Promise((r) => setTimeout(r, 600));

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await mockDelay();
      if (email === "admin@agritrace.vn" && password === "password123") {
        const data: LoginResponse = {
          accessToken: "mock-access-token",
          accessTokenExpiresAt: "",
          refreshToken: "mock-refresh-token",
          refreshTokenExpiresAt: "",
          user: mockUser,
        };
        setToken(data.accessToken);
        return data;
      }
      throw new Error("Email hoặc mật khẩu không đúng");
    }
    const res = await http.post("/auth/login", { email, password });
    setToken(res.data.data.accessToken);
    return res.data.data;
  },

  me: async (): Promise<MeResponse> => {
    if (USE_MOCK) {
      await mockDelay();
      return mockUser;
    }
    const res = await http.get("/auth/me");
    return res.data.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) => {
    if (USE_MOCK) {
      await mockDelay();
      if (!currentPassword || !newPassword || !confirmNewPassword)
        throw new Error("Vui lòng điền đầy đủ thông tin");
      if (newPassword !== confirmNewPassword)
        throw new Error("Mật khẩu mới không khớp");
      return { success: true };
    }
    const res = await http.put("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    return res.data;
  },

  updateProfile: async (userId: number, fullName: string) => {
    if (USE_MOCK) {
      await mockDelay();
      mockUser.fullName = fullName;
      return { success: true };
    }
    const res = await http.put(`/users/${userId}`, { fullName });
    return res.data;
  },

  logout: () => {
    removeToken();
    sessionStorage.removeItem("agritrace_user");
  },
};
