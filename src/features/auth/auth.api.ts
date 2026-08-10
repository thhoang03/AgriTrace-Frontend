import { post, get, put } from "../../lib/api";
import type {
  LoginRequest,
  ChangePasswordRequest,
  LoginData,
  UserBasic,
} from "../../types/mapping";
import { adaptLoginDataToResponse } from "../../types/mapping";

// Legacy LoginResponse for backward compatibility
interface LoginResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  mustChangePassword?: boolean;
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await post<LoginData>("/auth/login", data);
    // Adapt new LoginData to legacy LoginResponse
    return adaptLoginDataToResponse(response.data);
  },

  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    organizationName: string;
    organizationTypeId?: string;
    organizationTypeCode?: string;
    organizationAddress?: string;
  }) => {
    return post<any>("/auth/register", {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      organizationName: data.organizationName,
      organizationTypeId: data.organizationTypeId,
      organizationTypeCode: data.organizationTypeCode,
      organizationAddress: data.organizationAddress,
    });
  },

  logout: () => post<void>("/auth/logout"),

  getProfile: () => get<UserBasic>("/auth/me"),

  refreshToken: (refreshToken?: string) =>
    post<{ accessToken: string; refreshToken: string }>("/auth/refresh-token", {
      refreshToken,
    }),

  changePassword: (data: ChangePasswordRequest) =>
    put<void>("/auth/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),

  forgotPassword: (email: string) =>
    post<void>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    post<void>("/auth/reset-password", { token, newPassword }),
};
