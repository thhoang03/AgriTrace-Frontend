import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplyChainApi } from "./supply-chain.api";
import { batchesApi } from "../batches/batches.api";
import type { CreateEventRequest, SupplyChainFilters } from "./supply-chain.api";

const QUERY_KEY = "supply-chain";

export function useEventTypes() {
  return useQuery({
    queryKey: [QUERY_KEY, "event-types"],
    queryFn: () => supplyChainApi.getEventTypes(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSupplyChain(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, batchId],
    queryFn: () => supplyChainApi.getChain(batchId),
    enabled: !!batchId,
  });
}

export function useEvents(batchId: string, filters?: SupplyChainFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, "events", batchId, filters],
    queryFn: () => supplyChainApi.getEvents(batchId, filters),
    enabled: !!batchId,
  });
}

export function useCreateEvent(batchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => supplyChainApi.createEvent(batchId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, "events", batchId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEY, batchId] });
    },
  });
}

export function useRecentBatches() {
  return useQuery({
    queryKey: [QUERY_KEY, "recent-batches"],
    queryFn: async () => {
      const result = await batchesApi.getAll({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
      return result.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}