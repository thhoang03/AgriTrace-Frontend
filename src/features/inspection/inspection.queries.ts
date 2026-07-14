import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inspectionApi } from "./inspection.api";
import type { CreateInspectionRequest, InspectionFilters, InspectionItem } from "./inspection.types";

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

export function useBatchInspections(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "batch", batchId],
    queryFn: () => inspectionApi.getByBatchId(batchId),
    enabled: !!batchId,
  });
}

export function useCreateInspection(batchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInspectionRequest) => inspectionApi.create(batchId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateInspection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateInspectionRequest> & { status?: InspectionItem["status"]; score?: number; notes?: string }) =>
      inspectionApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
