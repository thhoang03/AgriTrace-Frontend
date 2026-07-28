import { get, post, put, del, patch } from "../../lib/api";
import type { 
  UserListItem, 
  UserPagedResponse, 
  CreateUserRequest as NewCreateUserRequest,
  UpdateUserRequest as NewUpdateUserRequest,
  UserStatusRequest 
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface UserItem {
  id: string;
  avatar: string;
  username: string;
  fullName: string;
  organization: string;
  role: string;
  status: string;
  phone: string;
  email: string;
}

export interface CreateUserRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  organization: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  status?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string | "All";
  page?: number;
  limit?: number;
}

// Adapter functions
function adaptUserListItem(item: any): UserItem {
  return {
    id: String(item.userId ?? item.id ?? ""),
    avatar: item.avatar ?? "",
    username: item.email ?? "",
    fullName: item.fullName ?? item.name ?? "",
    organization: item.organizationName ?? item.organization ?? item.orgName ?? "",
    organizationType: item.organizationTypeName ?? item.organizationType ?? "",
    role: item.role ?? "",
    status: item.isActive ? "Active" : "Inactive",
    phone: item.phone ?? "",
    email: item.email ?? "",
  };
}

function adaptCreateUserRequest(legacy: CreateUserRequest): NewCreateUserRequest {
  return {
    fullName: legacy.fullName,
    email: legacy.email,
    password: legacy.password,
    role: legacy.role as any, // Role enum may need mapping
  };
}

function adaptUpdateUserRequest(legacy: UpdateUserRequest): NewUpdateUserRequest {
  return {
    fullName: legacy.fullName,
    phone: legacy.phone,
    role: legacy.role as any,
    ...(legacy.status ? { status: legacy.status } : {}),
  };
}

export const usersApi = {
  getAll: async (filters?: UserFilters) => {
    const response = await get<UserPagedResponse>("/users", { 
      params: {
        search: filters?.search,
        role: filters?.role,
        page: filters?.page,
        pageSize: filters?.limit,
      }
    });
    // get() returns ApiResponse<T>, so response.data is the UserPagedResponse
    const pagedData = response.data as any; // Use any to bypass type checking for now
    return {
      data: {
        items: pagedData.items?.map(adaptUserListItem) ?? [],
        totalCount: pagedData.totalCount ?? 0,
      }
    };
  },

  getById: async (id: string) => {
    const response = await get<any>(`/users/${id}`);
    return adaptUserListItem(response.data);
  },

  create: async (data: CreateUserRequest) => {
    const newRequest = adaptCreateUserRequest(data);
    const response = await post<{ userId: number }>("/users", newRequest);
    return { data: { id: String(response.data.userId) } };
  },

  update: async (id: string, data: UpdateUserRequest) => {
    const newRequest = adaptUpdateUserRequest(data);
    const response = await put<any>(`/users/${id}`, newRequest);
    let updatedData = response.data;
    if (data.status !== undefined) {
      const statusResponse = await patch<any>(`/users/${id}/status`, { isActive: data.status === "Active" });
      updatedData = statusResponse.data;
    }
    return { data: adaptUserListItem(updatedData) };
  },

  delete: (id: string) =>
    del(`/users/${id}`),

  resetPassword: (id: string, newPassword: string) =>
    post<void>(`/users/${id}/reset-password`, { newPassword }),
};
