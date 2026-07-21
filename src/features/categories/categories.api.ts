import { get, post, put, patch, del } from "../../lib/api";
import type {
  CategoryDetail,
  CategoryPagedResponse,
  CategoryRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CategoriesListResponse {
  items: Category[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface UpdateCategoryStatusRequest {
  isActive: boolean;
}

export interface CategoryFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

// Adapter functions
function adaptCategoryFromListItem(item: Record<string, unknown>): Category {
  return {
    categoryId: item.categoryId ?? 0,
    name: item.name ?? "",
    description: item.description ?? "",
    isActive: item.isActive ?? true,
  };
}

function adaptCategoryFromDetail(item: Record<string, unknown>): Category {
  return {
    categoryId: item.categoryId ?? 0,
    name: item.name ?? "",
    description: item.description ?? "",
    isActive: item.isActive ?? true,
  };
}

export const categoriesApi = {
  getAll: async (filters?: CategoryFilters) => {
    const response = await get<CategoryPagedResponse>("/categories", {
      params: {
        search: filters?.search,
        page: filters?.page,
        pageSize: filters?.pageSize,
      }
    });
    const pagedData = response.data as unknown as Record<string, unknown>;
    return {
      data: {
        items: ((pagedData.items ?? []) as Record<string, unknown>[]).map(adaptCategoryFromListItem) ?? [],
        totalCount: Number(pagedData.totalCount ?? 0),
        page: Number(pagedData.page ?? 1),
        pageSize: Number(pagedData.pageSize ?? 20),
        totalPages: Number(pagedData.totalPages ?? 1),
      }
    };
  },

  getById: async (id: number | string) => {
    const response = await get<CategoryDetail>(`/categories/${id}`);
    return { data: adaptCategoryFromDetail(response.data) };
  },

  create: async (data: CreateCategoryRequest) => {
    const response = await post<{ categoryId: number }>("/categories", data as CategoryRequest);
    return { data: { categoryId: response.data.categoryId, ...data, isActive: true } as Category };
  },

  update: async (id: number | string, data: UpdateCategoryRequest) => {
    const response = await put<CategoryDetail>(`/categories/${id}`, data as CategoryRequest);
    return { data: adaptCategoryFromDetail(response.data) };
  },

  updateStatus: (id: number | string, data: UpdateCategoryStatusRequest) =>
    patch<void>(`/categories/${id}/status`, data),

  delete: (id: number | string) =>
    del(`/categories/${id}`),
};
