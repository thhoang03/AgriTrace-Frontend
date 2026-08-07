import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inspectionApi } from "./inspection.api";
import type {
  CreateInspectionRequest,
  RequestInspectionRequest,
  ConcludeInspectionRequest,
  InspectionFilters,
  CreateLabTestRequest,
} from "./inspection.types";

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
    mutationFn: (data: CreateInspectionRequest) => inspectionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRequestInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RequestInspectionRequest) => inspectionApi.request(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useConcludeInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConcludeInspectionRequest) => inspectionApi.conclude(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useAddLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { inspectionId: string } & CreateLabTestRequest) =>
      inspectionApi.addLabTest(data.inspectionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRemoveLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labTestId: string) => inspectionApi.removeLabTest(labTestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
