import { getPaginated, get, post, put, patch, del } from "../../lib/api";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
  CategoryFilters,
  CategoriesListResponse,
} from "./categories.types";

export const categoriesApi = {
  getAll: (filters?: CategoryFilters) =>
    getPaginated<Category, CategoriesListResponse>("/categories", { params: filters }),

  getById: (id: number | string) =>
    get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryRequest) =>
    post<Category>("/categories", data),

  update: (id: number | string, data: UpdateCategoryRequest) =>
    put<Category>(`/categories/${id}`, data),

  updateStatus: (id: number | string, data: UpdateCategoryStatusRequest) =>
    patch<void>(`/categories/${id}/status`, data),

  delete: (id: number | string) =>
    del(`/categories/${id}`),
};
