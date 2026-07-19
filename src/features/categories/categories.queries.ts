import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "./categories.api";
import type { Category, CategoriesListResponse } from "./categories.types";

export const categoriesQueries = {
  list: (params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }) => ({
    queryKey: ["categories", "list", params],
    queryFn: () => categoriesApi.getAll(params),
  }),

  detail: (id: number) => ({
    queryKey: ["categories", "detail", id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  }),
};

export function useCategoriesList(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery(categoriesQueries.list(params));
}

export function useCategoryDetail(id: number) {
  return useQuery(categoriesQueries.detail(id));
}
