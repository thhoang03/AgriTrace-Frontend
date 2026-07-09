export type UserStatus = "Active" | "Inactive" | "Pending";
export type UserRole = "Administrator" | "Farmer" | "Processor" | "Distributor" | "Retailer" | "Inspector";

export interface UserItem {
  id: string;
  avatar: string;
  username: string;
  fullName: string;
  organization: string;
  role: string;
  status: UserStatus;
  phone: string;
  email: string;
}

export interface CreateUserRequest {
  fullName: string;
  username: string;
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
