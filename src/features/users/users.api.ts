import { getList, get, post, put, del } from "../../lib/api";
import type { UserItem, CreateUserRequest, UpdateUserRequest, UserFilters } from "./users.types";

export const usersApi = {
  getAll: (filters?: UserFilters) =>
    getList<UserItem>("/users", { params: filters }),

  getById: (id: string) =>
    get<UserItem>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    post<UserItem>("/users", data),

  update: (id: string, data: UpdateUserRequest) =>
    put<UserItem>(`/users/${id}`, data),

  delete: (id: string) =>
    del(`/users/${id}`),

  resetPassword: (id: string, newPassword: string) =>
    post<void>(`/users/${id}/reset-password`, { newPassword }),
};
