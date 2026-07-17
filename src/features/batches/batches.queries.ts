import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { batchesApi } from "./batches.api";
import { splitMergeApi } from "./split-merge.api";
import type { BatchFilters, CreateBatchRequest, UpdateBatchRequest } from "./batches.types";
import type { SplitBatchRequest, MergeBatchRequest } from "./split-merge.types";

const QUERY_KEY = "batches";

export function useBatches(filters?: BatchFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => batchesApi.getAll(filters),
  });
}

export function useBatch(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => batchesApi.getById(id),
    enabled: !!id,
  });
}

export function useBatchTimeline(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, batchId, "timeline"],
    queryFn: () => batchesApi.getTimeline(batchId),
    enabled: !!batchId,
  });
}

export function useBatchQrCode(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, batchId, "qr-code"],
    queryFn: () => batchesApi.getQrCode(batchId),
    enabled: !!batchId,
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBatchRequest) => batchesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateBatch(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBatchRequest) => batchesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => batchesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useSplitBatch(batchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SplitBatchRequest) => splitMergeApi.split(batchId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useMergeBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MergeBatchRequest) => splitMergeApi.merge(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
