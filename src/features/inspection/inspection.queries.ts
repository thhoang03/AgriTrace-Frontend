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

export function useCreateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInspectionRequest) => inspectionApi.create(data.batchId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string } & Partial<CreateInspectionRequest> & { status?: InspectionItem["status"]; score?: number; notes?: string }) =>
      inspectionApi.update(data.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
