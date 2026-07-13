import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recallsApi } from "./recalls.api";
import type { CreateRecallRequest, RecallFilters } from "./recalls.types";

const QUERY_KEY = "recalls";

export function useRecalls(filters?: RecallFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => recallsApi.getAll(filters),
  });
}

export function useRecall(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => recallsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRecall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecallRequest) => recallsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useResolveRecall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recallsApi.resolve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
