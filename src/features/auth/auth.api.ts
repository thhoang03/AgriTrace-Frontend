import { post, get } from "../../lib/api";
import type { LoginRequest, LoginResponse, User } from "./auth.types";

export const authApi = {
  login: (data: LoginRequest) => post<LoginResponse>("/auth/login", data),

  logout: () => post<void>("/auth/logout"),

  getProfile: () => get<User>("/auth/profile"),

  refreshToken: () => post<{ accessToken: string }>("/auth/refresh"),
};
