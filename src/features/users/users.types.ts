export type UserStatus = "Active" | "Inactive";
export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export interface UserItem {
  id: string;
  avatar: string;
  fullName: string;
  organization: string;
  organizationType: string;
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
  organizationId?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  status?: UserStatus;
}

export interface UserFilters {
  search?: string;
  role?: string;
  orgType?: string;
  status?: UserStatus | "All";
  page?: number;
  limit?: number;
}
