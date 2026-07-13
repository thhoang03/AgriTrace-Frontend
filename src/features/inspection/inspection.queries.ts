import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inspectionApi } from "./inspection.api";
import type { CreateInspectionRequest, InspectionFilters } from "./inspection.types";

const QUERY_KEY = "inspections";

export function useInspections(filters?: InspectionFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => inspectionApi.getAll(filters),
  });
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => inspectionApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInspectionRequest) => inspectionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateInspection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, score, notes }: { status: InspectionItem["status"]; score: number; notes: string }) =>
      inspectionApi.updateStatus(id, status, score, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
