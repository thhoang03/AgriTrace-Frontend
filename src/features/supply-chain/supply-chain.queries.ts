import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplyChainApi } from "./supply-chain.api";
import type { CreateEventRequest } from "./supply-chain.types";

const QUERY_KEY = "supply-chain";

export function useSupplyChain(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, batchId],
    queryFn: () => supplyChainApi.getChain(batchId),
    enabled: !!batchId,
  });
}

export function useSupplyChainNode(nodeId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "node", nodeId],
    queryFn: () => supplyChainApi.getNode(nodeId),
    enabled: !!nodeId,
  });
}

export function useTraceByQR(qrCode: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "trace", qrCode],
    queryFn: () => supplyChainApi.traceByQR(qrCode),
    enabled: !!qrCode,
  });
}

export function useCreateEvent(batchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => supplyChainApi.createEvent(batchId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, batchId] });
      qc.invalidateQueries({ queryKey: ["batches", batchId, "timeline"] });
    },
  });
}
