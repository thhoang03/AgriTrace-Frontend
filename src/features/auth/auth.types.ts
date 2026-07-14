export type UserRole =
  | "Administrator"
  | "Farmer"
  | "Processor"
  | "Distributor"
  | "Retailer"
  | "Inspector";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  organization: string;
  avatar: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
