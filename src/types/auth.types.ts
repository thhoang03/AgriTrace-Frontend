export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  organizationId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  user: UserInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
