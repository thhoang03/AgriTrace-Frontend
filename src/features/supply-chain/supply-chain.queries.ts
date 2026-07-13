import { useQuery } from "@tanstack/react-query";
import { supplyChainApi } from "./supply-chain.api";

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
