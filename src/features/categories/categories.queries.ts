import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof categoriesApi.create>[0]) =>
      categoriesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", "list"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Parameters<typeof categoriesApi.update>[1] }) =>
      categoriesApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["categories", "list"] });
      qc.invalidateQueries({ queryKey: ["categories", "detail", Number(id)] });
    },
  });
}

export function useUpdateCategoryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Parameters<typeof categoriesApi.updateStatus>[1] }) =>
      categoriesApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["categories", "list"] });
      qc.invalidateQueries({ queryKey: ["categories", "detail", Number(id)] });
    },
  });
}

export type { Category, CategoriesListResponse };

