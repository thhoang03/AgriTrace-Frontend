import { getPaginated, get, post, put, patch } from "../../lib/api";
import type { UserItem } from "../users/users.types";
import type { Product } from "../products/products.types";
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  UpdateOrganizationStatusRequest,
  OrganizationFilters,
} from "./organizations.types";

export const organizationsApi = {
  getAll: (filters?: OrganizationFilters) =>
    getPaginated<Organization>("/organizations", { params: filters }),

  getById: (id: number | string) =>
    get<Organization>(`/organizations/${id}`),

  create: (data: CreateOrganizationRequest) =>
    post<Organization>("/organizations", data),

  update: (id: number | string, data: UpdateOrganizationRequest) =>
    put<Organization>(`/organizations/${id}`, data),

  updateStatus: (id: number | string, data: UpdateOrganizationStatusRequest) =>
    patch<void>(`/organizations/${id}/status`, data),

  getUsers: (id: number | string, params?: { page?: number; pageSize?: number }) =>
    getPaginated<UserItem>(`/organizations/${id}/users`, { params }),

  getProducts: (id: number | string, params?: { page?: number; pageSize?: number }) =>
    getPaginated<Product>(`/organizations/${id}/products`, { params }),
};
