import { get } from "../../lib/api";
import type { Category, CategoriesListResponse } from "./categories.types";

export const categoriesApi = {
  // GET /categories - Danh sách categories
  getCategories: (params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }) => get<CategoriesListResponse>("/categories", { params }),

  // GET /categories/{id} - Chi tiết category
  getCategory: (id: number) => get<Category>(`/categories/${id}`),
};
