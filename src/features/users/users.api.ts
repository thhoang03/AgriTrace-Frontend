import { get, post, put, del } from "../../lib/api";
import type {
  UserPagedResponse,
  CreateUserRequest as NewCreateUserRequest,
  UpdateUserRequest as NewUpdateUserRequest,
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
function adaptUserListItem(item: Record<string, unknown>): UserItem {
  return {
    id: String(item.userId ?? item.id ?? ""),
    avatar: item.avatar ?? "",
    username: item.email ?? "",
    fullName: item.fullName ?? item.name ?? "",
    organization: item.organizationName ?? item.organization ?? "",
    role: item.role ?? "",
    status: item.status ?? "Active",
    phone: item.phone ?? "",
    email: item.email ?? "",
  };
}

function adaptCreateUserRequest(legacy: CreateUserRequest): NewCreateUserRequest {
  return {
    fullName: legacy.fullName,
    email: legacy.email,
    password: legacy.password,
    role: legacy.role as string,
    organizationId: null, // Legacy uses organization name, new uses ID
  };
}

function adaptUpdateUserRequest(legacy: UpdateUserRequest): NewUpdateUserRequest {
  return {
    fullName: legacy.fullName,
    phone: legacy.phone,
    role: legacy.role as string,
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
    return {
      data: {
        items: (response.data.items ?? []).map(adaptUserListItem) ?? [],
        totalCount: response.data.totalCount ?? 0,
      }
    };
  },

  getById: async (id: string) => {
    const response = await get<unknown>(`/users/${id}`);
    return adaptUserListItem(response.data as Record<string, unknown>);
  },

  create: async (data: CreateUserRequest) => {
    const newRequest = adaptCreateUserRequest(data);
    const response = await post<{ userId: number }>("/users", newRequest);
    return { data: { id: String(response.data.userId) } };
  },

  update: async (id: string, data: UpdateUserRequest) => {
    const newRequest = adaptUpdateUserRequest(data);
    const response = await put<unknown>(`/users/${id}`, newRequest);
    return { data: adaptUserListItem(response.data as Record<string, unknown>) };
  },

  delete: (id: string) =>
    del(`/users/${id}`),

  resetPassword: (id: string, newPassword: string) =>
    post<void>(`/users/${id}/reset-password`, { newPassword }),
};
