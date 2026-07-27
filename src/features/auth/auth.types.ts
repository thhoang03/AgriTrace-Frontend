export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export type OrganizationType =
  | "FARM"
  | "PROCESSOR"
  | "DISTRIBUTOR"
  | "RETAILER"
  | "INSPECTION"
  | "SYSTEM";

export type EventType =
  | "HARVEST"
  | "RECEIVE"
  | "PROCESSING"
  | "PACKAGING"
  | "TRANSPORT"
  | "DISTRIBUTION"
  | "RETAIL"
  | "INSPECTION"
  | "RECALL"
  | "SPLIT"
  | "MERGE";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organizationType?: OrganizationType;
  organizationName?: string;
  avatar: string;
}

export interface LoginRequest {
  email: string;
  password: string;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
