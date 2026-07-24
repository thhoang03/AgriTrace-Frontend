export type UserStatus = "Active" | "Inactive" | "Pending";
export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export interface UserItem {
  id: string;
  avatar: string;
  fullName: string;
  organization: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
  email: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  organization: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  status?: UserStatus;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: UserStatus | "All";
  page?: number;
  limit?: number;
}
