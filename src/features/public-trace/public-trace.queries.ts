import { useQuery } from "@tanstack/react-query";
import { publicTraceApi } from "./public-trace.api";

const QUERY_KEY = "public-trace";

/**
 * Fetch full public traceability data for a batch.
 * Maps to GET /public/trace/{batchId}
 */
export function usePublicTrace(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, batchId],
    queryFn: () => publicTraceApi.getTrace(batchId),
    enabled: !!batchId,
    // Cache for 5 minutes — same as Redis TTL on the backend
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch the parent/child lineage tree for a batch.
 * Maps to GET /public/trace/{batchId}/lineage
 */
export function useBatchLineage(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, batchId, "lineage"],
    queryFn: () => publicTraceApi.getLineage(batchId),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
  });
}
