import { get, post, put, patch, del } from "../../lib/api";
import type {
  CategoryListItem,
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
function adaptCategoryFromListItem(item: any): Category {
  return {
    categoryId: item.categoryId ?? 0,
    name: item.name ?? "",
    description: item.description ?? "",
    isActive: item.isActive ?? true,
    createdAt: item.createdAt,
  };
}

function adaptCategoryFromDetail(item: any): Category {
  return {
    categoryId: item.categoryId ?? 0,
    name: item.name ?? "",
    description: item.description ?? "",
    isActive: item.isActive ?? true,
    createdAt: item.createdAt,
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
    const pagedData = response.data as any;
    return {
      data: {
        items: pagedData.items?.map(adaptCategoryFromListItem) ?? [],
        totalCount: pagedData.totalCount ?? 0,
        page: pagedData.page ?? 1,
        pageSize: pagedData.pageSize ?? 20,
        totalPages: pagedData.totalPages ?? 1,
      }
    };
  },

  getById: async (id: number | string) => {
    const response = await get<CategoryDetail>(`/categories/${id}`);
    return { data: adaptCategoryFromDetail(response.data) };
  },

  create: async (data: CreateCategoryRequest) => {
    const response = await post<{ categoryId: number; createdAt?: string }>("/categories", data as CategoryRequest);
    return { data: { categoryId: response.data.categoryId, ...data, isActive: true, createdAt: response.data.createdAt } as Category };
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
